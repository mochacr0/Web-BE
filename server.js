import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

//swagger

//api

//error handler middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 1000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
