import CustomErrorHandler from "@/utils/ErrorHandler";
import isAuth from "@/utils/IsAuth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import connectMongo from "@/utils/ConnectMongo";
import User from "../User.model";
import { HttpError } from "@/utils/HttpError";


export async function GET(request : Request){
    try{
        await connectMongo();
        const requestUserId = isAuth(headers())
        const user = await User.findById(requestUserId).select('-dislikes -friends -password_hash -has_password -__v -updatedAt')
        if (!user) {
            throw new HttpError(404, "User not found")
        }
        let postsCount = user.posts.length
        let commentCount = user.comments.length
        let likeCount = user.likes.length
        user.posts = []
        user.comments = []
        user.likes = []
        return NextResponse.json({
            user, postsCount, commentCount, likeCount
        });
    }catch(error){
        return CustomErrorHandler(error);
    }
}