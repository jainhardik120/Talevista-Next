import CustomErrorHandler from "@/utils/ErrorHandler";
import { NextResponse } from "next/server";
import connectMongo from "@/utils/ConnectMongo";
import { HttpError } from "@/utils/HttpError";
import User from "@/app/api/User.model";
import Post from "@/app/api/Post.model";

export async function GET(request: Request, { params }: { params: { userId: string } }) {
    try {
        await connectMongo();
        const userId = params.userId
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || "1");
        const limit = parseInt(searchParams.get('limit') || "10");
        const user = await User.findById(userId)
        if (!user) {
            throw new HttpError(404, "User not found")
        }
        const totalPosts = user.likes.length
        const startIndex = (page - 1) * 10;
        if (startIndex >= user.likes.length) {
            return NextResponse.json({
                posts: [],
                currentPage: page,
                totalPosts: totalPosts,
                totalPages: Math.ceil(totalPosts / limit)
            })
        }
        const endIndex = Math.min(((page) * 10) - 1, user.likes.length - 1);
        const begin = user.likes.length - (startIndex + 1)
        const end = user.likes.length - (endIndex + 1)
        const objectsToPopulate = user.likes.slice(end, begin + 1).reverse()
        const posts = await Post.find({ _id: { $in: objectsToPopulate } }).populate({
            path: 'author',
            select: 'username picture'
        }).exec();

        posts.sort((a, b) => {
            const aIndex = objectsToPopulate.indexOf(a._id.toString());
            const bIndex = objectsToPopulate.indexOf(b._id.toString());
            return aIndex - bIndex;
        });

        return NextResponse.json({
            posts,
            currentPage: page,
            totalPosts: totalPosts,
            totalPages: Math.ceil(totalPosts / limit)
        });
    } catch (error) {
        return CustomErrorHandler(error);
    }
}