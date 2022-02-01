import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import errorHandler from "./middleware/errorMiddleware";
import connectDB from "./config/db";
import router from "./routes/index";

dotenv.config();

connectDB();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// sanitization and other preventive measures
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// api routes
app.use("/api/v1", router);
app.all("*", (req, res, next) => {
  res
    .status(404)
    .json({ success: true, msg: "Resource not found, please try logging in" });
  next();
});

// global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
