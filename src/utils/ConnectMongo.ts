import mongoose from 'mongoose';

const connectMongo = async () => {
    try {
        const MONGO_URI : string = process.env.MONGO_URI || "localhost"
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

export default connectMongo;
