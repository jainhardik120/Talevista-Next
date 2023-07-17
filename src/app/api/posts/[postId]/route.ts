import CustomErrorHandler from "@/utils/ErrorHandler";
import isAuth from "@/utils/IsAuth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Post from "../../Post.model";
import { PaginateOptions } from "mongoose";
import connectMongo from "@/utils/ConnectMongo";
import User from "../../User.model";
import Comment from "../../Comment.model";
import { HttpError } from "@/utils/HttpError";

export async function GET(_request: Request,{ params }: { params: { postId: string } }) {
    try {
        await connectMongo();
        const userId = isAuth(headers())
        const postId = params.postId;
        const post = await Post.findById(postId).populate('author', 'username first_name last_name picture');
        if (!post) {
            throw new HttpError(404, "Post Not Found")
        }
        const likedByCurrentUser = post.likes.some(like =>
            like.toString() == userId
        )
        const dislikedByCurrentUser = post.dislikes.some(dislike =>
            dislike.toString() == userId
        );
        const commentCount = post.comments.length
        post.likes = []
        post.dislikes = []
        post.comments = []
        return NextResponse.json({post, likedByCurrentUser, dislikedByCurrentUser, commentCount})
    } catch (error) {
        return CustomErrorHandler(error);
    }
}

export async function PUT(request: Request,{ params }: { params: { postId: string } }) {
    try {
        await connectMongo();
        const userId = isAuth(headers())
        const postId = params.postId
        const {content, category} = await request.json();
        const post = await Post.findById(postId);
        if (!post) {
            throw new HttpError(404, "Post not found")
        }

        if (post.author.toString() !== userId) {
            throw new HttpError(403, "Unauthorized access")
        }

        post.content = content;
        post.category = category;
        await post.save();

        
        return NextResponse.json({ message: 'Post updated successfully' });
    } catch (error) {
        return CustomErrorHandler(error);
    }
}
export async function DELETE(request: Request,{ params }: { params: { postId: string } }) {
    try {
        await connectMongo();
        const userId = isAuth(headers())
        const postId = params.postId
        const post = await Post.findById(postId);
        if (!post) {
            throw new HttpError(404, "Post not found")
        }
        if (post.author.toString() !== userId) {
            throw new HttpError(403, "Unauthorized access")
        }
        const likesDislikesUserIds = [...post.likes, ...post.dislikes];
        await User.updateMany(
            { _id: { $in: likesDislikesUserIds } },
            { $pull: { likes: postId, dislikes: postId } }
        );
        const comments = await Comment.find({ post: postId });
        const commentIds = comments.map(comment => comment._id);
        await Promise.all([
            Comment.deleteMany({ post: postId }),
            User.updateMany(
                { _id: { $in: comments.map(comment => comment.author) } },
                { $pull: { comments: { $in: commentIds } } }
            )
        ]);
        await Post.findByIdAndDelete(postId);
        await User.findByIdAndUpdate(userId, { $pull: { posts: postId } });
        return NextResponse.json({ message: 'Post deleted successfully' });
    } catch (error) {
        return CustomErrorHandler(error);
    }
}