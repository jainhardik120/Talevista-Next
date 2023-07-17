import User from '@/app/api/User.model';
import connectMongo from '@/utils/ConnectMongo'
import { NextResponse } from 'next/server'
import CustomErrorHandler from '@/utils/ErrorHandler';
import { HttpError } from '@/utils/HttpError';

export async function POST(request: Request) {
    const {email} = await request.json()
    try {
        await connectMongo();
        const foundUser = await User.findOne({ email });

        if (foundUser) {
            throw new HttpError(409, "Email already exists");
        }
        return NextResponse.json({
            message: 'Email is available.'
        })
    } catch (err) {
        return CustomErrorHandler(err);
    }
}