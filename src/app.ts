import express, { json } from "express";
import cors from "cors";
import swaggerUI from "swagger-ui-express";

import { config } from "dotenv";
config();

import { swaggerSpec } from "./docs/swagger";

import { sequelize } from "./database/sequelize";

import { IError } from "./utils/constructError";

import { authMiddleware } from "./middlewares/auth.middleware";
import authRoutes from "./routes/auth/auth.controller";
import routes from "./routes/routes";
import { INTERNAL_ERROR_CODE } from "./utils/constants";

const app = express();
const port = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully!");
    return sequelize.sync({ force: false }); // Sync all models with database every time server restarts
  })
  .catch((err) => console.error("Unable to connect to the database", err));

app.use(cors());
app.use(json());

app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Unprotected routes
app.use("/api", authRoutes);

// Protected routes
app.use(authMiddleware);
app.use("/api", routes);

app.use((err: IError | any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err.errorCode || INTERNAL_ERROR_CODE).send(err);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
