import User from '@/app/api/User.model';
import connectMongo from '@/utils/ConnectMongo'
import { NextResponse } from 'next/server'
import CustomErrorHandler from '@/utils/ErrorHandler';
import { HttpError } from '@/utils/HttpError';

export async function POST(request: Request) {
    const { userId, first_name, last_name, picture, gender, date_of_birth } = await request.json()
    try {
        await connectMongo();
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    first_name,
                    last_name,
                    picture,
                    gender,
                    date_of_birth,
                },
            },
            { new: true }
        );
        if (!updatedUser) {
            throw new HttpError(404, "User not found")
        }
        return NextResponse.json(updatedUser);
    } catch (err) {
        return CustomErrorHandler(err);
    }
}