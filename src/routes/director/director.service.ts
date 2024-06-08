import Joi from "joi";
import {
  CreateDirectorAttributes,
  Director,
} from "../../database/models/director";
import constructError from "../../utils/constructError";
import { Transaction } from "sequelize";

export const createDirectorSchema = Joi.object({
  fullName: Joi.string().required(),
});

interface CreateDirectorParams {
  fullName: string;
}

export const createDirector = async (
  directorPayload: CreateDirectorParams,
  transaction?: Transaction
): Promise<Director> => {
  const { error, value: validatedDirector } =
    createDirectorSchema.validate(directorPayload);

  if (error) {
    throw constructError({ message: error.message, code: 400 });
  }

  return Director.create(
    { ...(validatedDirector as CreateDirectorAttributes) },
    { ...(transaction && { transaction }) }
  );
};

export const getDirector = async (
  fullName: string
): Promise<Director | null> => {
  return await Director.findOne({
    where: { fullName: fullName },
  });
};
