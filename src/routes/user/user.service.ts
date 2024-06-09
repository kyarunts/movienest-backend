import Joi from "joi";

import { User } from "../../database/models/user";

import constructError from "../../utils/constructError";
import { hashPassword } from "../../utils/hashPassword";
import {
  INTERNAL_ERROR_CODE,
  INTERNAL_ERROR_MESSAGE,
} from "../../utils/constants";

export const createUserSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserParams:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           nullable: true
 *           description: The user's updated first name
 *         lastName:
 *           type: string
 *           nullable: true
 *           description: The user's updated last name
 */
interface CreateUserParams {
  firstName: string | null;
  lastName: string | null;
  email: string;
  password: string;
}

interface UpdateUserParams {
  firstName: string | null;
  lastName: string | null;
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  let user: User | null;
  try {
    user = await User.findOne({ where: { email } });
    return user;
  } catch (error) {
    throw constructError({
      message: INTERNAL_ERROR_MESSAGE,
      code: INTERNAL_ERROR_CODE,
    });
  }
};

export const getUser = async (userId: number): Promise<User> => {
  let user: User | null;

  try {
    user = await User.findByPk(userId);
  } catch (error) {
    throw constructError({
      message: INTERNAL_ERROR_MESSAGE,
      code: INTERNAL_ERROR_CODE,
    });
  }

  if (!user) {
    throw constructError({ message: "User not found", code: 404 });
  }

  user.password = "";

  return user;
};

export const createUser = async (
  userPayload: CreateUserParams
): Promise<User> => {
  const { error, value: validatedUser } =
    createUserSchema.validate(userPayload);

  if (error) {
    throw constructError({ message: error.message, code: 400 });
  }

  const hashedPassword = await hashPassword(validatedUser.password);

  let user: User;

  try {
    user = await User.create({
      email: validatedUser.email,
      password: hashedPassword,
      firstName: validatedUser.firstName,
      lastName: validatedUser.lastName,
    });
  } catch (error) {
    throw constructError({
      message: INTERNAL_ERROR_MESSAGE,
      code: INTERNAL_ERROR_CODE,
    });
  }

  user.password = "";

  return user;
};

export const updateUser = async (
  userId: number,
  updateData: UpdateUserParams
): Promise<User> => {
  const user = await getUser(userId);

  const { error, value: validatedPayload } =
    updateUserSchema.validate(updateData);

  if (error) {
    throw constructError({ message: error.message, code: 400 });
  }

  try {
    await user.update({ ...validatedPayload });
  } catch (error) {
    throw constructError({
      message: INTERNAL_ERROR_MESSAGE,
      code: INTERNAL_ERROR_CODE,
    });
  }

  return user;
};
