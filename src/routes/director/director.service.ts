import Joi from "joi";
import {
  CreateDirectorAttributes,
  Director,
} from "../../database/models/director";
import constructError from "../../utils/constructError";
import { Transaction } from "sequelize";
import {
  INTERNAL_ERROR_CODE,
  INTERNAL_ERROR_MESSAGE,
} from "../../utils/constants";

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

  let director: Director;

  try {
    director = await Director.create(
      { ...(validatedDirector as CreateDirectorAttributes) },
      { ...(transaction && { transaction }) }
    );

    return director;
  } catch (error) {
    throw constructError({
      message: INTERNAL_ERROR_MESSAGE,
      code: INTERNAL_ERROR_CODE,
    });
  }
};

export const getDirector = async (
  fullName: string
): Promise<Director | null> => {
  return await Director.findOne({
    where: { fullName },
  });
};
