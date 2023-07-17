import { Document, Schema, Model, models, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

interface IComment extends Document {
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

interface ICommentModel extends Model<IComment> {
  // Add custom static methods here if needed
}

const commentSchema = new Schema<IComment, ICommentModel>(
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

const Comment: ICommentModel =
  (models.Comment as ICommentModel) || model<IComment, ICommentModel>('Comment', commentSchema);

export default Comment;
