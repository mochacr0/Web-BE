import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cors from "cors";
import YAML from "yamljs";
import swaggerUiExpress from "swagger-ui-express";
import connectDatabase from "./config/db.config.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";

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

//api routes
routes(app);

//error handler middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 1000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
