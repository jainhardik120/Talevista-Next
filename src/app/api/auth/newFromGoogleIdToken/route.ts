import User from '@/app/api/User.model';
import connectMongo from '@/utils/ConnectMongo'
import { NextResponse } from 'next/server'
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken"
import key from '@/utils/SecretKey';
import { Error } from 'mongoose';
import CustomErrorHandler from '@/utils/ErrorHandler';
import { HttpError } from '@/utils/HttpError';
import { OAuth2Client } from "google-auth-library";

function extractNameParts(fullName: string) {
    const parts = fullName.trim().split(' ');
    const firstName = parts.length > 1 ? parts.slice(0, -1).join(' ') : parts.join(' ');
    const lastName = parts.length > 1 ? parts.slice(-1)[0] : '';
    return { firstName, lastName };
}

export async function POST(request: Request) {
    const { idToken, username, name, picture, dob, gender } = await request.json()
    try {
        await connectMongo();
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
        const nameArray = extractNameParts(name);
        const first_name = nameArray.firstName;
        const last_name = nameArray.lastName;
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        })
        const payload = ticket.getPayload()

        if (payload == undefined) {
            throw new HttpError(400, "Invalid Token");
        }
        const foundUserByEmail = await User.findOne({ email: payload.email });
        if (foundUserByEmail) {
            throw new HttpError(409, "Email already exists!")
        }
        const foundUserByUsername = await User.findOne({ username });

        if (foundUserByUsername) {
            throw new HttpError(409, "Username already exists!")
        }

        const newUser = new User({
            first_name: first_name,
            last_name: last_name,
            has_password: false,
            email: payload.email,
            verified: true,
            picture: picture,
            username: username,
            gender: gender,
            date_of_birth: dob
        })
        const savedUser = await newUser.save()
        const token = jsonwebtoken.sign({
            email: savedUser.email,
            userId: savedUser._id.toString()
        }, key)
        const _id = savedUser._id
        return NextResponse.json({
            token: token,
            userId: _id,
            firstName: savedUser.first_name,
            lastName: savedUser.last_name,
            email: savedUser.email,
            picture: savedUser.picture
        })
    } catch (err) {
        return CustomErrorHandler(err);
    }
}