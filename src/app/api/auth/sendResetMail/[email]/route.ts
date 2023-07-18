import User from '@/app/api/User.model';
import connectMongo from '@/utils/ConnectMongo'
import { NextResponse } from 'next/server'
import jsonwebtoken from "jsonwebtoken"
import axios from 'axios';
import key from '@/utils/SecretKey';
import PasswordResetMail from '@/utils/PasswordResetMail';
import CustomErrorHandler from '@/utils/ErrorHandler';
import { HttpError } from '@/utils/HttpError';
import { CustomJwtPayload } from '../../resetPassword/route';

export async function GET(request: Request, { params }: { params: { email: string } }) {
    const email = params.email
    try {
        await connectMongo();
        const foundUser = await User.findOne({ $or: [{ email: email }, { username: email }] });
        if (!foundUser) {
            throw new HttpError(404, "Email address not signed up")
        } else {
            const payload: CustomJwtPayload = {
                userId: foundUser._id,
                forReset: true
            }
            const token = jsonwebtoken.sign(
                payload, key, {
                expiresIn: 60 * 10
            }
            )
            const url = `talevista://resetpassword?token=${token}`
            const mailResponse = await axios.post(`https://api.brevo.com/v3/smtp/email`, {
                sender: {
                    name: "TaleVista",
                    email: "jainhardik120@gmail.com"
                },
                to: [
                    {
                        email: `${foundUser.email}`,
                        name: `${foundUser.first_name} ${foundUser.last_name}`
                    }
                ],
                subject: "Reset Password",
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
    } catch (error) {
        return CustomErrorHandler(error);
    }
}