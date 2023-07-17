import User from '@/app/api/User.model';
import connectMongo from '@/utils/ConnectMongo'
import { NextResponse } from 'next/server'
import jsonwebtoken from "jsonwebtoken"
import key from '@/utils/SecretKey';
import CustomErrorHandler from '@/utils/ErrorHandler';
import { HttpError } from '@/utils/HttpError';
import { OAuth2Client } from "google-auth-library";
import { LoginJwtPayload } from '../login/route';


export async function POST(request: Request) {
    const { idToken } = await request.json()
    try {
        await connectMongo();
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        })
        const payload = ticket.getPayload()
        if (payload == undefined) {
            throw new HttpError(404, "Invalid Token")
        }
        const foundUser = await User.findOne({
            email: payload.email
        })
        if (foundUser) {
            const payload : LoginJwtPayload={
                email: foundUser.email,
                userId: foundUser._id.toString()
            }
            const token = jsonwebtoken.sign(payload, key)
            const { _id, verified } = foundUser;
            if (!verified) {
                await User.updateOne({
                    _id: _id
                }, {
                    $set: { verified: true }
                })
            }
            return NextResponse.json({
                token: token,
                userId: _id,
                firstName: foundUser.first_name,
                lastName: foundUser.last_name,
                email: foundUser.email,
                picture: foundUser.picture
            })
        } else {
            return NextResponse.json({
                error: "Username Required",
                first_name: payload.given_name,
                last_name: payload.family_name,
                picture: payload.picture
            }, {
                status: 400
            })
        }
    } catch (err) {
        return CustomErrorHandler(err);
    }
}