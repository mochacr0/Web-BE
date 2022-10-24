import authRouter from "../routes/auth.route.js";
import categoryRouter from "../routes/category.route.js";
import productRouter from "../routes/product.route.js";
import cartRouter from "./cart.route.js";

const routes = (app) => {
  app.use("/api/auth", authRouter);
  app.use("/api/category", categoryRouter);
  app.use("/api/product", productRouter);
  app.use("/api/cart", cartRouter);
};

export default routes;
