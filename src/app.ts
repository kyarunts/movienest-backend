import express, { json } from "express";
import cors from "cors";

import { config } from "dotenv";
config();

import { sequelize } from "./database/sequelize";

import { IError } from "./utils/constructError";

import { authMiddleware } from "./middlewares/auth.middleware";
import authRoutes from "./routes/auth/auth.controller";
import routes from "./routes/routes";

const app = express();
const port = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully!");
    return sequelize.sync({ force: true }); // Sync all models with database
  })
  .catch((err) => console.error("Unable to connect to the database", err));

app.use(cors());
app.use(json());

app.use("/api", authRoutes);
app.use(authMiddleware);
app.use(routes);

app.use((err: IError | any, req: any, res: any, next: any) => {
  console.error(err);

  res.status(err.errorCode).send(err);
});

app.get("/", (req, res) => {
  res.send("Hello, TypeScript Node Express!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
