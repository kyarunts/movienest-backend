import JWT from "./auth.utils";

import { User } from "../../database/models/user";
import {
  createUser,
  createUserSchema,
  getUserByEmail,
} from "../user/user.service";

import constructError from "../../utils/constructError";
import { comparePassword } from "../../utils/hashPassword";

export interface ISignUp {
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
}

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

  user = await createUser(validatedValue);

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
