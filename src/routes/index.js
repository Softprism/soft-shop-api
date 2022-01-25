import { Router } from "express";
import userRoutes from "./user.routes";
import riderRoutes from "./rider.routes";
import adminRoutes from "./admin.routes";
import productRoutes from "./product.routes";
import storeRoutes from "./store.routes";
import orderRoutes from "./order.routes";
import categoryRoutes from "./category.routes";
import paymentRoutes from "./payment.routes";
import dashboardRoutes from "./dashboard.routes";
import notificationRoutes from "./notification.routes";
import deliveryRoutes from "./delivery.routes";
import servicesRoutes from "./services.routes";

const router = new Router();
// api routes
router.use("/users", userRoutes);
router.use("/riders", riderRoutes);
router.use("/admins", adminRoutes);
router.use("/products", productRoutes);
router.use("/stores", storeRoutes);
router.use("/order", orderRoutes);
router.use("/category", categoryRoutes);
router.use("/payment", paymentRoutes);
router.use("/dashboards", dashboardRoutes);
router.use("/riders/notifications", notificationRoutes);
router.use("/deliveries", deliveryRoutes);
router.use("/services", servicesRoutes);

export default router;
