import CustomErrorHandler from "@/utils/ErrorHandler";
import isAuth from "@/utils/IsAuth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import connectMongo from "@/utils/ConnectMongo";
import Comment from "@/app/api/Comment.model";
import User from "@/app/api/User.model";
import Post, { PostData, PostDocument } from "@/app/api/Post.model";
import { HttpError } from "@/utils/HttpError";
import mongoose, { PaginateOptions } from "mongoose"


export async function GET(request: Request,{ params }: { params: { postId: string } }) {
    try {
        await connectMongo();
        const userId = isAuth(headers())
        const postId = params.postId
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || "1");
        const limit = parseInt(searchParams.get('limit') || "10");
        if(!mongoose.Types.ObjectId.isValid(postId)){
            throw new HttpError(422, "Invalid Id")
        }
        const options: PaginateOptions = {
            page: page,
            limit: limit,
            populate: {
                path: 'author',
                select: 'username picture'
            },
            lean: true,
            sort: { createdAt: -1 }
        };
        const comments = await Comment.paginate({post: postId}, options);
        const commentsWithLikesDislikes = comments.docs.map(comment=>({
            ...comment,
            likedByCurrentUser: comment.likes.some(like =>
                like.toString() == userId
            ),
            dislikedByCurrentUser: comment.dislikes.some(dislike => dislike.toString()==userId),
            likes: [],
            dislikes: [],
        }));
        const response = {
            comments: commentsWithLikesDislikes,
            currentPage: comments.page,
            totalPages: comments.totalPages,
            totalComments: comments.totalDocs
        }
        return NextResponse.json(response);
    } catch (error) {
        return CustomErrorHandler(error);
    }
}


export async function POST(request: Request,{ params }: { params: { postId: string } }) {
    try {
        await connectMongo();
        const userId = isAuth(headers())
        const postId = params.postId;
        const {detail} = await request.json()
        const post = await Post.findById(postId);
        if (!post) {
            throw new HttpError(404, "Post not found")
        }

        const comment = new Comment({
            detail,
            author: userId,
            post: postId
        });

        const savedComment = await comment.save();

        // Add the comment to the user's comments field
        await User.findByIdAndUpdate(userId, { $push: { comments: savedComment._id } });

        // Add the comment to the post's comments array
        post.comments.push(savedComment._id);
        await post.save();

        return NextResponse.json({ message: 'Commented successfully', _id: savedComment._id });
    } catch (error) {
        return CustomErrorHandler(error);
    }
}