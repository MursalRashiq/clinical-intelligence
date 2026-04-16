import mongoose from "mongoose";
import {env} from './env';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI as string);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDB;
