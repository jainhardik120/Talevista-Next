import User from '@/app/api/User.model';
import connectMongo from '@/utils/ConnectMongo'
import { NextResponse } from 'next/server'
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken"
import key from '@/utils/SecretKey';
import { Error } from 'mongoose';
import CustomErrorHandler from '@/utils/ErrorHandler';
import { HttpError } from '@/utils/HttpError';

export async function POST(request: Request) {
    const {email, password} = await request.json()
    try {
        await connectMongo();
        const foundUser = await User.findOne({ email: email });
        if (!email || !password) {
            throw new HttpError(400, "Email or Password field can't be empty!")
        } else if (!foundUser) {
            throw new HttpError(400, "Email address is not signed up!")
        } else if (!foundUser.has_password) {
            throw new HttpError(400, "Account has no password")
        } else {
            const isEqual = await bcrypt.compare(password, foundUser.password_hash || "")
            if (!isEqual) {
                throw new HttpError(401, 'Wrong password!');
            }
            const token = jsonwebtoken.sign({
                email: foundUser.email,
                userId: foundUser._id.toString()
            }, key)
            return NextResponse.json({
                token: token,
                userId: foundUser._id,
                firstName: foundUser.first_name,
                lastName: foundUser.last_name,
                email: foundUser.email,
                picture: foundUser.picture
            })
        }
    } catch (err) {
        return CustomErrorHandler(err);
    }
}