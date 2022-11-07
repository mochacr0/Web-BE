import authRouter from "./auth.route.js";
import categoryRouter from "./category.route.js";
import productRouter from "./product.route.js";
import orderRouter from "./order.route.js";
import cartRouter from "./cart.route.js";

const routes = (app) => {
  app.use("/api/auth", authRouter);
  app.use("/api/category", categoryRouter);
  app.use("/api/product", productRouter);
  app.use("/api/cart", cartRouter);
  app.use("api/order", orderRouter);
};

export default routes;
