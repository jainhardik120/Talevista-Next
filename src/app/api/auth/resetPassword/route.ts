import User from '@/app/api/User.model';
import connectMongo from '@/utils/ConnectMongo'
import { NextResponse } from 'next/server'
import bcrypt from "bcrypt";
import jsonwebtoken ,{ JwtPayload } from "jsonwebtoken"
import key from '@/utils/SecretKey';
import CustomErrorHandler from '@/utils/ErrorHandler';
import { HttpError } from '@/utils/HttpError';

export interface CustomJwtPayload extends JwtPayload {
    forReset: boolean;
    userId : string
  }

export async function POST(request: Request) {
    const {token, newPassword} = await request.json()
    try {
        await connectMongo();
        const decodedToken = jsonwebtoken.verify(token, key)
        if (!decodedToken) {
            throw new HttpError(401, 'Invalid Token')
        }
        const payload = decodedToken as CustomJwtPayload
        if (!payload.forReset) {
            throw new HttpError(401, 'Invalid Token')
        }
        const userId = payload.userId
        const password_hash = await bcrypt.hash(newPassword, 12)
        await User.updateOne({
            _id: userId
        }, {
            $set: { password_hash: password_hash, has_password: true }
        })
        return NextResponse.json({
            message: "Password Updated successfully"
        })
    } catch (err) {
        return CustomErrorHandler(err);
    }
}