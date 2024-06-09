import { Router } from "express";
import userController from "./user/user.controller";
import movieController from "./movie/movie.controller";

const api = Router().use(userController).use(movieController);

export default Router().use(api);
