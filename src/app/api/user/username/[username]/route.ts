import CustomErrorHandler from "@/utils/ErrorHandler";
import { NextResponse } from "next/server";
import connectMongo from "@/utils/ConnectMongo";
import { HttpError } from "@/utils/HttpError";
import User from "@/app/api/User.model";


export async function GET(request : Request,{ params }: { params: { username: string } }){
    try{
        await connectMongo();
        const username = params.username
        const user = await User.findOne({username : username}).select('-dislikes -friends -password_hash -has_password -email -verified -__v -updatedAt -date_of_birth -gender')
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