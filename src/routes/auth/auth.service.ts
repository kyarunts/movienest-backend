import JWT from "./auth.utils";

import { User } from "../../database/models/user";
import {
  createUser,
  createUserSchema,
  getUserByEmail,
} from "../user/user.service";

import constructError from "../../utils/constructError";
import { comparePassword } from "../../utils/hashPassword";

/**
 * @swagger
 * components:
 *   schemas:
 *     ISignUp:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         password:
 *           type: string
 *           description: The user's password
 *         firstName:
 *           type: string
 *           nullable: true
 *           description: The user's first name
 *         lastName:
 *           type: string
 *           nullable: true
 *           description: The user's last name
 *       example:
 *         email: johndoe@example.com
 *         password: securePassword123
 *         firstName: John
 *         lastName: Doe
 */
export interface ISignUp {
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ISignIn:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         password:
 *           type: string
 *           description: The user's password
 *       example:
 *         email: johndoe@example.com
 *         password: securePassword123
 */
export interface ISignIn {
  email: string;
  password: string;
}

export const signUp = async (
  signUpData: ISignUp
): Promise<{ accessToken: string }> => {
  let user: User | null;

  const { error, value } = createUserSchema.validate(signUpData);

  if (error) {
    throw constructError({
      message: error.message,
      code: 400,
    });
  }

  const validatedValue = value as ISignUp;

  user = await getUserByEmail(validatedValue.email);

  if (user) {
    throw constructError({
      message: "User with this email already exists.",
      code: 400,
    });
  }

  try {
    user = await createUser(validatedValue);
  } catch (error) {
    throw error;
  }

  const accessToken = JWT.signJWT({ userId: user.id });

  return { accessToken };
};

export const signIn = async (
  signInData: ISignIn
): Promise<{ accessToken: string }> => {
  const user = await getUserByEmail(signInData.email);

  if (!user) {
    throw constructError({ message: "User not found.", code: 404 });
  }

  const passwordsMatch: boolean = await comparePassword(
    signInData.password,
    user.password
  );

  if (!passwordsMatch) {
    throw constructError({
      message: "Email or password are incorrect. Please try again.",
      code: 400,
    });
  }

  const accessToken = JWT.signJWT({ userId: user.id });

  return { accessToken };
};
