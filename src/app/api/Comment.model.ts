import mongoose, { Document, PaginateModel, Schema, models } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export const commentSchema = new Schema(
  {
    detail: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dislikes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    dislikesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.plugin(mongoosePaginate);


export interface CommentData {
  detail: string;
  author: Schema.Types.ObjectId;
  post: Schema.Types.ObjectId;
  likes: Schema.Types.ObjectId[];
  dislikes: Schema.Types.ObjectId[];
  likesCount: number;
  dislikesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentDocument extends Document, CommentData{}

const model = (models.Comment as PaginateModel<CommentDocument>) || mongoose.model<
  CommentDocument,
  mongoose.PaginateModel<CommentDocument>
>('Comment', commentSchema);

export default model