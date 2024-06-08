import Joi from "joi";

import { User } from "../../database/models/user";

import constructError from "../../utils/constructError";
import { hashPassword } from "../../utils/hashPassword";

export const createUserSchema = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
});

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
  return User.findOne({ where: { email } });
};

export const getUser = async (userId: number): Promise<User> => {
  const user = await User.findByPk(userId);

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

  const user = await User.create({
    email: validatedUser.email,
    password: hashedPassword,
    firstName: validatedUser.firstName,
    lastName: validatedUser.lastName,
  });

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

  await user.update({ ...validatedPayload });

  return user;
};
