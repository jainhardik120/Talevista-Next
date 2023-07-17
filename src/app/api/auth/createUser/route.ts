import User from '@/app/api/User.model';
import connectMongo from '@/utils/ConnectMongo'
import { NextResponse } from 'next/server'
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken"
import key from '@/utils/SecretKey';
import CustomErrorHandler from '@/utils/ErrorHandler';
import { HttpError } from '@/utils/HttpError';
import { LoginJwtPayload } from '../login/route';

function extractNameParts(fullName: string) {
    const parts = fullName.trim().split(' ');
    const firstName = parts.length > 1 ? parts.slice(0, -1).join(' ') : parts.join(' ');
    const lastName = parts.length > 1 ? parts.slice(-1)[0] : '';
    return { firstName, lastName };
}

export async function POST(request: Request) {
    const { email, password, username, name, picture, dob, gender } = await request.json()
    try {
        await connectMongo();
        const nameArray = extractNameParts(name);
        const first_name = nameArray.firstName;
        const last_name = nameArray.lastName;
        if (!password || !email || !username) {
            throw new HttpError(400, "You must fill the required field!")
        }
        const foundUserByEmail = await User.findOne({ email });
        if (foundUserByEmail) {
            throw new HttpError(409, "Email already exists!")
        }
        const foundUserByUsername = await User.findOne({ username });

        if (foundUserByUsername) {
            throw new HttpError(409, "Username already exists!")
        }

        const newUser = new User({
            email,
            password_hash: await bcrypt.hash(password, 12),
            username,
            verified: false,
            has_password: true,
            first_name: first_name,
            last_name: last_name,
            picture: picture,
            gender: gender,
            date_of_birth: dob
        });
        const savedUser = await newUser.save();
        const payload:LoginJwtPayload = {
            email: savedUser.email,
            userId: savedUser._id.toString()
        }
        const token = jsonwebtoken.sign(payload, key)

        return NextResponse.json({
            token: token,
            userId: savedUser._id,
            firstName: savedUser.first_name,
            lastName: savedUser.last_name,
            email: savedUser.email,
            picture: savedUser.picture
        })

    } catch (err) {
        return CustomErrorHandler(err);
    }
}