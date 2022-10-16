import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import YAML from "yamljs";
import swaggerUiExpress from "swagger-ui-express";
import connectDatabase from "./config/db.config.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import authRouter from "./routes/auth.route.js";
import categoryRouter from "./routes/category.route.js";

dotenv.config();
connectDatabase();
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

//swagger
const swaggerDocument = YAML.load("./config/swagger.config.yaml");
app.use(
  "/swagger",
  swaggerUiExpress.serve,
  swaggerUiExpress.setup(swaggerDocument, {
    swaggerOptions: {
      docExpansion: "none",
    },
  })
);

//api
app.use("/api/auth", authRouter);
app.use("/api/category", categoryRouter);

//error handler middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 1000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
