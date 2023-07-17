import CustomErrorHandler from "@/utils/ErrorHandler";
import isAuth from "@/utils/IsAuth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import connectMongo from "@/utils/ConnectMongo";
import Comment from "@/app/api/Comment.model";
import User from "@/app/api/User.model";
import Post, { PostData, PostDocument } from "@/app/api/Post.model";
import { HttpError } from "@/utils/HttpError";

export async function DELETE(request: Request,{ params }: { params: { commentId: string } }) {
    try {
        await connectMongo();
        const userId = isAuth(headers())
        const commentId = params.commentId;
        const comment = await Comment.findById(commentId).populate<{post:PostData}>('post');
        if (!comment) {
            throw new HttpError(404, "Comment not found")
        }
        if (comment.author.toString() !== userId && comment.post.author.toString() !== userId) {
            throw new HttpError(403, "Unauthorized Access")
        }
        await User.findByIdAndUpdate(comment.author, { $pull: { comments: commentId } });
        await Post.findByIdAndUpdate(comment.post, { $pull: { comments: commentId } });
        await Comment.findByIdAndDelete(commentId);
        return NextResponse.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        return CustomErrorHandler(error);
    }
}