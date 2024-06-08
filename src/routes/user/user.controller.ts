import { NextFunction, Request, Response, Router } from "express";
import constructError from "../../utils/constructError";
import { getUser, updateUser } from "./user.service";

const router = Router();

router.get(
  "/users/:ID",
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.ID;

    if (!userId) {
      return next(
        constructError({ message: "ID is required in params.", code: 400 })
      );
    }

    if (Number.isNaN(Number(userId))) {
      return next(
        constructError({
          message: "ID is required to be a number in params.",
          code: 400,
        })
      );
    }

    try {
      const user = await getUser(Number(userId));
      return res.status(200).send(user);
    } catch (error) {
      return next(error);
    }
  }
);

router.put(
  "/users/:ID",
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.ID;

    if (!userId) {
      return next(
        constructError({ message: "ID is required in params.", code: 400 })
      );
    }

    if (Number.isNaN(Number(userId))) {
      return next(
        constructError({
          message: "ID is required to be a number in params.",
          code: 400,
        })
      );
    }

    try {
      const user = await updateUser(Number(userId), req.body);
      return res.status(200).send(user);
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
