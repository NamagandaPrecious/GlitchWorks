import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config/index";
import { errorHandler, notFoundHandler } from "./middleware/index";
import { registerRoutes } from "./routes/index";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

registerRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);

export { app, config };
