import authRouter from "../routes/auth.route.js";
import categoryRouter from "../routes/category.route.js";

const routes = (app) => {
  app.use("/api/auth", authRouter);
  app.use("/api/category", categoryRouter);
};

export default routes;
