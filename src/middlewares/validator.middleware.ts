import { Response, NextFunction } from "express";
import Joi from "joi";
import { SortingByEnum, SortingDirectionEnum } from "../utils/enums";
import constructError from "../utils/constructError";

const getMoviesQuerySchema = Joi.object({
  limit: Joi.number().integer().min(0).optional(),
  offset: Joi.number().integer().min(0).optional(),
  genre: Joi.string().optional(),
  publishingYear: Joi.number().optional(),
  publishingCountry: Joi.string().optional(),
  rating: Joi.array()
    .items(Joi.number().min(0).max(10), Joi.number().min(0).max(10))
    .length(2)
    .optional()
    .messages({
      "array.length": "Rating must contain exactly two numbers.",
      "number.base": "Each rating value must be a number.",
      "number.min": "Rating values must be at least 0.",
      "number.max": "Rating values must be at most 10.",
    }),
  sortingDirection: Joi.string()
    .valid(SortingDirectionEnum.ASC, SortingDirectionEnum.DESC)
    .optional()
    .messages({
      "any.only": `Sorting direction must be either "${SortingDirectionEnum.ASC}" or "${SortingDirectionEnum.DESC}".`,
    }),
  sortingBy: Joi.string()
    .valid(
      SortingByEnum.PUBLISHING_YEAR,
      SortingByEnum.RATING,
      SortingByEnum.TITLE
    )
    .optional()
    .messages({
      "any.only": `Sorting by must be one of "${SortingByEnum.PUBLISHING_YEAR}", "${SortingByEnum.RATING}", or "${SortingByEnum.TITLE}".`,
    }),
}).optional();

export const validateGetMoviesQuery = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const queryString = req.query;

  let parsedRating: [number, number];

  try {
    parsedRating = JSON.parse(queryString.rating as string);
  } catch (error) {
    return next(
      constructError({ message: `${(error as any).message}`, code: 400 })
    );
  }

  queryString.rating = parsedRating;

  const { error, value: validatedQuery } =
    getMoviesQuerySchema.validate(queryString);

  if (error) {
    next(constructError({ message: error.message, code: 400 }));
  }

  if (validatedQuery.sortingBy) {
    if (!validatedQuery.sortingDirection) {
      next(
        constructError({
          message: "Both sorting params must be provided.",
          code: 400,
        })
      );
    }
  } else {
    if (validatedQuery.sortingDirection) {
      next(
        constructError({
          message: "Both sorting params must be provided.",
          code: 400,
        })
      );
    }
  }

  next();
};
