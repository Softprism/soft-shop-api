import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorMiddleware.js";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import productRoutes from "./routes/product.routes.js";
import storeRoutes from "./routes/store.routes.js";
import orderRoutes from "./routes/order.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";

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
app.use("/users", userRoutes);
app.use("/admins", adminRoutes);
app.use("/products", productRoutes);
app.use("/stores", storeRoutes);
app.use("/order", orderRoutes);
app.use("/category", categoryRoutes);
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
