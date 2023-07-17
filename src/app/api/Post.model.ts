import mongoose, { Document, PaginateModel, Schema, models } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const validCategories = [
  'horror',
  'comedy',
  'romance',
  'fantasy',
  'sciencefiction',
  'mystery',
  'thriller',
  'adventure',
  'historical',
  'drama',
  'action',
  'science',
  'biography',
  'inspirational',
  'poetry',
];

export const postSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          return validCategories.includes(value.toLowerCase());
        },
        message: 'Invalid category',
      },
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
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

postSchema.plugin(mongoosePaginate);


export interface PostData {
  author: Schema.Types.ObjectId;
  content: string;
  category: string;
  likes: Schema.Types.ObjectId[];
  dislikes: Schema.Types.ObjectId[];
  likesCount: number;
  dislikesCount: number;
  comments: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PostDocument extends Document, PostData{}

const model = (models.Post as PaginateModel<PostDocument>) || mongoose.model<
  PostDocument,
  mongoose.PaginateModel<PostDocument>
>('Post', postSchema);

export default model