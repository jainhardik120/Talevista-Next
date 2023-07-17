import User from '@/app/api/User.model';
import connectMongo from '@/utils/ConnectMongo'
import { NextResponse } from 'next/server'
import CustomErrorHandler from '@/utils/ErrorHandler';
import { HttpError } from '@/utils/HttpError';

export async function POST(request: Request) {
    const { username } = await request.json()
    try {
        await connectMongo();
        const usernameRegex = /^[a-zA-Z0-9._-]+$/;
        if (!usernameRegex.test(username)) {
            throw new HttpError(400, "Invalid username format. Only alphanumeric characters, dots, dashes, and underscores are allowed.");
        }

        const foundUser = await User.findOne({ username });

        if (foundUser) {
            const similarUsernames = [];
            for (let i = 1; i <= 5; i++) {
                const newUsername = `${username}${i}`;
                const checkUser = await User.findOne({ username: newUsername });
                if (!checkUser) {
                    similarUsernames.push(newUsername);
                }
            }
            return NextResponse.json({ message: 'Username already exists.', similarUsernames }, {
                status: 409
            })
        } else {
            return NextResponse.json({
                message: 'Username is available.'
            })
        }
    } catch (err) {
        return CustomErrorHandler(err);
    }
}