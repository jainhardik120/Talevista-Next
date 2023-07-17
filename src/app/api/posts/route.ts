import CustomErrorHandler from "@/utils/ErrorHandler";
import isAuth from "@/utils/IsAuth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Post from "../Post.model";
import { PaginateOptions } from "mongoose";
import connectMongo from "@/utils/ConnectMongo";
import User from "../User.model";

export async function GET(request: Request) {
    try {
        await connectMongo();
        const requestUserId = isAuth(headers())
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || "1");
        const limit = parseInt(searchParams.get('limit') || "10");
        const filters: { [key: string]: any } = {};
        if (searchParams.has('category')) {
            filters.category = searchParams.get('category');
        }
        if (searchParams.has('userId')) {
            filters.author = searchParams.get('userId');
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
        const posts = await Post.paginate(filters, options);
        const postsWithLikesDislikes = posts.docs.map(post => ({
            ...post,
            likedByCurrentUser: post.likes.some(like =>
                like.toString() == requestUserId
            ),
            dislikedByCurrentUser: post.dislikes.some(dislike => dislike.toString() == requestUserId),
            likes: undefined,
            dislikes: undefined,
            comments: undefined
        }));
        const response = {
            posts: postsWithLikesDislikes,
            currentPage: posts.page,
            totalPages: posts.totalPages,
            totalPosts: posts.totalDocs
        };
        return NextResponse.json(response);
    } catch (error) {
        return CustomErrorHandler(error);
    }
}

export async function POST(request: Request) {
    try {
        await connectMongo();
        const requestUserId = isAuth(headers())
        const { content, category } = await request.json()

        const post = new Post({
            author: requestUserId,
            content,
            category
        });

        await post.save();

        await User.findByIdAndUpdate(
            requestUserId,
            { $push: { posts: post._id } }
        );

        return NextResponse.json({ message: 'Post created successfully', _id: post._id });
    } catch (error) {
        return CustomErrorHandler(error);
    }
}