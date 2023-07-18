import CustomErrorHandler from "@/utils/ErrorHandler";
import isAuth from "@/utils/IsAuth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import connectMongo from "@/utils/ConnectMongo";
import User from "../../User.model";

export async function GET(request : Request){
    try{
        await connectMongo();
        const requestUserId = isAuth(headers());
        const { searchParams } = new URL(request.url);
        const queryString = searchParams.get('query')||"";
        const regex = new RegExp(queryString, "i");
        const users = await User.find({
            $or: [
                { username: regex },
                { first_name: regex },
                { last_name: regex },
            ],
        }).select("-likes -comments -dislikes -friends -password_hash -has_password -email -verified -__v -updatedAt -date_of_birth -gender -posts -createdAt");

        return NextResponse.json({ users });
    }catch(error){
        return CustomErrorHandler(error);
    }
}