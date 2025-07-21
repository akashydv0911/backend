import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`\n✅ MongoDB connected!!  DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("❌ MONGODB connection FAILED", error);
    process.exit(1);
  }
};

export default connectDB;
 // this is used to connect to the database
// this is an async function that connects to the database and returns a promise.
// it returns to index.js file where it is called.

