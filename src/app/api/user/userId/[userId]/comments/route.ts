import CustomErrorHandler from "@/utils/ErrorHandler";
import { NextResponse } from "next/server";
import connectMongo from "@/utils/ConnectMongo";
import Comment from "@/app/api/Comment.model";
import isAuth from "@/utils/IsAuth";
import { headers } from "next/headers";


export async function GET(request: Request,{ params }: { params: { userId: string } }) {
    try {
        await connectMongo();
        const requestUserId = isAuth(headers())
        const userId = params.userId
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || "1");
        const limit = parseInt(searchParams.get('limit') || "10");
        const options = {
            page:page,
            limit: limit,
            populate: {
                path: 'post',
                select: 'author content createdAt',
                populate: {
                    path: 'author',
                    select: 'username picture'
                }
            },
            lean: true,
            sort: { createdAt: -1 }
        };
        const comments = await Comment.paginate({ author: userId }, options);
        const commentsModified = comments.docs.map(comment => ({
            ...comment,
            author: undefined,
            likedByCurrentUser: comment.likes.some(like => 
                like.toString()==requestUserId),
            dislikedByCurrentUser: comment.dislikes.some(dislike => 
                dislike.toString()==requestUserId),
            likes: [],
            dislikes: [],
            id: undefined
        }))
        return NextResponse.json({
            comments: commentsModified,
            currentPage: comments.page,
            totalPages: comments.totalPages,
            totalPosts: comments.totalDocs
        })
    } catch (error) {
        return CustomErrorHandler(error);
    }
}

