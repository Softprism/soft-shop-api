import mongoose from "mongoose";

const connectDB = async () => {
  try {
    let mongoURI;
    if (process.env.NODE_ENV === "production") {
      mongoURI = process.env.MONGO_URI_PROD;
    } else {
      mongoURI = process.env.MONGO_URI_DEV;
    }
    const conn = await mongoose.connect(mongoURI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export { connectDB };
