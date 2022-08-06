import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import morgan from "morgan";
import errorHandler from "./middleware/errorMiddleware";
import connectDB from "./config/db";
import router from "./routes/index";

dotenv.config();

connectDB();

const app = express();
const config = {
  title: "SoftShop Health",
  path: "/api/v1/health",
  spans: [{
    interval: 1,
    retention: 60
  }, {
    interval: 5,
    retention: 60
  }, {
    interval: 15,
    retention: 60
  }],
  chartVisibility: {
    cpu: true,
    mem: true,
    load: true,
    responseTime: true,
    rps: true,
    statusCodes: true
  },
  healthChecks: [
    {
      protocol: "http",
      host: "soft-shop.app",
      path: "/api/v1/test",
      port: "3000"
    }
  ],
  ignoreStartsWith: "/admin"
};
app.use(require("express-status-monitor")(config));

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(morgan("combined"));

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

app.get("/", (req, res) => res.send({ message: "Welcome to Soft-Shop server!" }));

app.all("*", (req, res, next) => {
  res
    .status(404)
    .json({ success: false, msg: "Resource not found, please try logging in" });
  next();
});

// global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)

);
