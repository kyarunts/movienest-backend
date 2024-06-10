import { NextFunction, Request, Response, Router } from "express";
import { ISignIn, ISignUp, signIn, signUp } from "./auth.service";

const router = Router();

/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: Sign up a new user
 *     description: Create a new user account
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ISignUp'
 *     responses:
 *       201:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The user access token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcxNzk0MjI4NiwiZXhwIjoxNzE3OTc4Mjg2fQ.doOXrsHBWry2s8AftQ1jQiPLqABro4-QPbT_PFo28fc
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/signin:
 *   post:
 *     summary: Signs in a user
 *     description: Signs in an existing user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ISignIn'
 *     responses:
 *       201:
 *         description: The user was successfully signed in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The user access token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcxNzk0MjI4NiwiZXhwIjoxNzE3OTc4Mjg2fQ.doOXrsHBWry2s8AftQ1jQiPLqABro4-QPbT_PFo28fc
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
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
