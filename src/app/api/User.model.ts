import { Document, Schema, Model, models, model } from 'mongoose';

interface IUser extends Document {
  username: string;
  first_name: string;
  last_name?: string;
  password_hash?: string;
  has_password?: boolean;
  email: string;
  verified?: boolean;
  picture: string;
  date_of_birth: Date;
  gender: 'male' | 'female' | 'other' | 'na';
  posts: Schema.Types.ObjectId[];
  comments: Schema.Types.ObjectId[];
  likes: Schema.Types.ObjectId[];
  dislikes: Schema.Types.ObjectId[];
  friends: {
    user: Schema.Types.ObjectId;
    friends_from: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface IUserModel extends Model<IUser> {
  // Add custom static methods here if needed
}

const userSchema = new Schema<IUser, IUserModel>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: (username: string) => {
          const reg = /^[A-Za-z0-9_.-]+$/;
          return reg.test(username);
        },
        message: () =>
          `Username can only contain alphanumeric characters, underscores (_), periods (.), and hyphens (-).`,
      },
    },
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: false,
      trim: true,
    },
    password_hash: {
      type: String,
      minlength: [8, 'Minimum password length is 8 characters'],
    },
    has_password: {
      type: Boolean,
      default: true,
    },
    email: {
      type: String,
      validate: {
        validator: (email: string) => {
          const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
          return reg.test(email);
        },
        message: (props: { value: string }) =>
          `${props.value} is not a valid email address!`,
      },
      required: [true, 'User email address required'],
      unique: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    picture: {
      type: String,
      required: true,
    },
    date_of_birth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'na'],
      required: true,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    dislikes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    friends: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        friends_from: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User: IUserModel =
  (models.User as IUserModel) || model<IUser, IUserModel>('User', userSchema);

export default User;
