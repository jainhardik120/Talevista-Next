import CustomErrorHandler from "@/utils/ErrorHandler";
import isAuth from "@/utils/IsAuth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import User from "@/app/api/User.model";
import Post from "@/app/api/Post.model";
import { PaginateOptions } from "mongoose";
import connectMongo from "@/utils/ConnectMongo";
import { HttpError } from "@/utils/HttpError";
import mongoose from "mongoose";

export async function PUT(request: Request, { params }: { params: { postId: string } }) {
    try {
        await connectMongo();
        const userId = isAuth(headers())
        const postId = params.postId
        const post = await Post.findById(postId);
        if (!post) {
            throw new HttpError(404, "Post not found")
        }
        const likedByCurrentUser = post.likes.some(like =>
            like.toString() == userId
        )
        const dislikedByCurrentUser = post.dislikes.some(dislike =>
            dislike.toString() == userId
        );
        if (likedByCurrentUser) {
            throw new HttpError(400, "Already Liked")
        }
        if (dislikedByCurrentUser) {
            post.dislikes = post.dislikes.filter((id) => id.toString() !== userId)
            post.dislikesCount -= 1;
        }
        post.likes.push(new mongoose.Schema.Types.ObjectId(userId));
        post.likesCount += 1;
        await post.save();
        await User.findByIdAndUpdate(userId, { $push: { likes: postId }, $pull: { dislikes: postId } });

        return NextResponse.json({ message: 'Post liked successfully' });
    } catch (error) {
        return CustomErrorHandler(error);
    }
}


export async function DELETE(request: Request, { params }: { params: { postId: string } }) {
    try {
        await connectMongo();
        const userId = isAuth(headers())
        const postId = params.postId
        const post = await Post.findById(postId);
        if (!post) {
            throw new HttpError(404, "Post not found")
        }
        const likedByCurrentUser = post.likes.some(like =>
            like.toString() == userId
        )
        if (!likedByCurrentUser) {
            throw new HttpError(400, "Not Liked")
        }
        post.likes = post.likes.filter((id) => id.toString() !== userId);
        post.likesCount -= 1;
        await post.save();
        await User.findByIdAndUpdate(userId, { $pull: { likes: postId } });

        return NextResponse.json({ message: 'Post unliked successfully' });
    } catch (error) {
        return CustomErrorHandler(error);
    }
}

