import express from "express";
import compression from "compression";
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

// compress all responses
app.use(compression({ level: 9 }));
// api routes
app.use("/v1", router);
app.all("*", (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: "server is fine. Jazz up if you're lost" });
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
