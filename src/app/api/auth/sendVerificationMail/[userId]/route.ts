import User from '@/app/api/User.model';
import connectMongo from '@/utils/ConnectMongo'
import { NextResponse } from 'next/server'
import jsonwebtoken from "jsonwebtoken"
import axios from 'axios';
import key from '@/utils/SecretKey';
import PasswordResetMail from '@/utils/PasswordResetMail';
import CustomErrorHandler from '@/utils/ErrorHandler';
import { HttpError } from '@/utils/HttpError';
import mongoose from 'mongoose';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
    const userId = params.userId
    try {
        await connectMongo();
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError(422, "Invalid id")
        }
        const findUser = await User.findById(userId)
        if (!findUser) {
            throw new HttpError(404, "User Not Found")
        }
        if (findUser.verified) {
            throw new HttpError(409, "User Already Verified")
        }
        const token = jsonwebtoken.sign({
            userId: userId
        }, key, {
            expiresIn: 60 * 30
        })
        const url = `http://localhost:5000/verify/${token}`
        const mailResponse = await axios.post(`https://api.brevo.com/v3/smtp/email`, {
            sender: {
                name: "TaleVista",
                email: "jainhardik120@gmail.com"
            },
            to: [
                {
                    email: `${findUser.email}`,
                    name: `${findUser.first_name} ${findUser.last_name}`
                }
            ],
            subject: "Verify Email Address",
            htmlContent: PasswordResetMail(url)
        }, {
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            }
        })
        return NextResponse.json({
            data: mailResponse.data
        });
    }
    catch (error) {
        return CustomErrorHandler(error);
    }
}