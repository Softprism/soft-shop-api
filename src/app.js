import express from "express";
import helmet from "helmet";
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

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// sanitization and other preventive measuress
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// compress all response
// app.use(compression({ level: 1 }));

// api routes
app.use("/api/v1", router);
app.use("/dev/v1", (req, res, next) => {
  console.log("dev mode");
  console.log(process.env.MONGO_URI_DEV);
  next();
}, router);

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
console.log(process.env)
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  
);
