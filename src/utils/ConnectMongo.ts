import User from '@/app/api/User.model';
import Post from "@/app/api/Post.model"
import Comment from '@/app/api/Comment.model';

import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI


let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

async function connectMongo() {
    if (cached.conn) {
        return cached.conn
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        }
        if (MONGO_URI == undefined) {
            throw new Error("Internal Server Issue")
        }
        cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
            return mongoose
        })
    }
    try {
        cached.conn = await cached.promise
    } catch (e) {
        cached.promise = null
        throw e
    }
    if(!mongoose.models.User){
        await User.findOne({email : 'test@test.com'})
    }
    if(!mongoose.models.Post){
        await Post.findOne({content : 'null'})
    }
    if(!mongoose.models.Comment){
        await Comment.findOne({detail : "null"});
    }
    return cached.conn
}

export default connectMongo;
