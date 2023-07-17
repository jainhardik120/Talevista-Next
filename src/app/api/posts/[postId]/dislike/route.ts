import CustomErrorHandler from "@/utils/ErrorHandler";
import isAuth from "@/utils/IsAuth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import User from "@/app/api/User.model";
import Post from "@/app/api/Post.model";
import connectMongo from "@/utils/ConnectMongo";
import { HttpError } from "@/utils/HttpError";
import mongoose, { ObjectId } from "mongoose";

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
        if (dislikedByCurrentUser) {
            throw new HttpError(400, "Already Disliked")
        }
        if (likedByCurrentUser) {
            post.likes = post.likes.filter((id) => id.toString() !== userId)
            post.likesCount -= 1;
        }
        post.dislikes.push(userId as unknown as ObjectId);
        post.dislikesCount += 1;
        await post.save();
        await User.findByIdAndUpdate(userId, { $push: { dislikes: postId }, $pull: { likes: postId } });

        return NextResponse.json({ message: 'Post disliked successfully' });
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
        const dislikedByCurrentUser = post.dislikes.some(like =>
            like.toString() == userId
        )
        if (!dislikedByCurrentUser) {
            throw new HttpError(400, "Not Disliked")
        }
        post.dislikes = post.dislikes.filter((id) => id.toString() !== userId);
        post.dislikesCount -= 1;
        await post.save();
        await User.findByIdAndUpdate(userId, { $pull: { dislikes: postId } });

        return NextResponse.json({ message: 'Post undisliked successfully' });
    } catch (error) {
        return CustomErrorHandler(error);
    }
}

