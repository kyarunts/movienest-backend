import { NextFunction, Request, Response, Router } from "express";
import { ISignIn, ISignUp, signIn, signUp } from "./auth.service";

const router = Router();

router.post(
  "/signup",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signUpData: ISignUp = req.body;

      const signUpResData = await signUp(signUpData);

      res.status(201).json(signUpResData);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/signin",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signInData: ISignIn = req.body;

      const signInResData = await signIn(signInData);

      res.status(201).json(signInResData);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
