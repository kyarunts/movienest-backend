import Joi from "joi";

import constructError from "../../utils/constructError";

import { Movie } from "../../database/models/movie";
import { Director } from "../../database/models/director";
import { sequelize } from "../../database/sequelize";
import { createDirector, getDirector } from "../director/director.service";
import { SortingByEnum, SortingDirectionEnum } from "../../utils/enums";
import { Op } from "sequelize";
import {
  INTERNAL_ERROR_CODE,
  INTERNAL_ERROR_MESSAGE,
} from "../../utils/constants";

export const createMovieSchema = Joi.object({
  title: Joi.string().required(),
  publishingYear: Joi.number().integer().required(),
  imageURL: Joi.string().optional(),
  publishingCountry: Joi.string().optional(),
  genre: Joi.string().optional(),
  rating: Joi.number().integer().min(0).max(10).optional(),
  directorFullName: Joi.string().optional(),
});

export const updateMovieSchema = Joi.object({
  title: Joi.string().optional(),
  publishingYear: Joi.number().integer().optional(),
  imageURL: Joi.string().optional(),
  publishingCountry: Joi.string().optional(),
  genre: Joi.string().optional(),
  rating: Joi.number().optional(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateMovieParams:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the movie
 *         publishingYear:
 *           type: integer
 *           description: The publishing year of the movie
 *         imageURL:
 *           type: string
 *           nullable: true
 *           description: The URL of the movie's image
 *         publishingCountry:
 *           type: string
 *           nullable: true
 *           description: The publishing country of the movie
 *         genre:
 *           type: string
 *           nullable: true
 *           description: The genre of the movie
 *         rating:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *           nullable: true
 *           description: The rating of the movie (0-10)
 *         directorFullName:
 *           type: string
 *           nullable: true
 *           description: The full name of the movie's director
 */
interface CreateMovieParams {
  title: string;
  publishingYear: number;
  imageURL: string | null;
  publishingCountry: string | null;
  genre: string | null;
  rating: number | null;
  directorFullName: string | null;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateMovieParams:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           nullable: true
 *           description: The title of the movie
 *         publishingYear:
 *           type: integer
 *           nullable: true
 *           description: The publishing year of the movie
 *         imageURL:
 *           type: string
 *           nullable: true
 *           description: The URL of the movie's image
 *         publishingCountry:
 *           type: string
 *           nullable: true
 *           description: The publishing country of the movie
 *         genre:
 *           type: string
 *           nullable: true
 *           description: The genre of the movie
 *         rating:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *           nullable: true
 *           description: The rating of the movie (0-10)
 */
interface UpdateMovieParams {
  title: string | null;
  publishingYear: number | null;
  imageURL: string | null;
  publishingCountry: string | null;
  genre: string | null;
  rating: number | null;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     PaginationInfo:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           description: The total count of items
 *         currentPage:
 *           type: integer
 *           description: The current page number
 *         totalPages:
 *           type: integer
 *           description: The total number of pages
 */
interface PaginationInfo {
  count: number;
  currentPage: number;
  totalPages: number;
}

export interface GetMoviesParams {
  limit?: number;
  offset?: number;
  filters?: {
    genre?: string;
    publishingYear?: number;
    publishingCountry?: string;
    rating?: [number, number];
  };
  sorting?: {
    direction: SortingDirectionEnum;
    by: SortingByEnum;
  };
}

export const getMovie = async (
  userId: number,
  movieId: number
): Promise<Movie> => {
  let movie: Movie | null;

  try {
    movie = await Movie.findByPk(movieId, { include: [{ model: Director }] });
  } catch (error) {
    throw constructError({
      message: INTERNAL_ERROR_MESSAGE,
      code: INTERNAL_ERROR_CODE,
    });
  }

  if (!movie) {
    throw constructError({ message: "Movie not found.", code: 404 });
  }

  if (movie.userId !== userId) {
    throw constructError({ message: "Operation forbidden.", code: 403 });
  }

  return movie;
};

export const getMovies = async (
  userId: number,
  searchParams: GetMoviesParams
): Promise<{ movies: Movie[]; paginationInfo: PaginationInfo }> => {
  let filterParams: any = { userId };
  if (searchParams.filters) {
    const { filters } = searchParams;

    if (filters.genre) {
      filterParams = {
        ...filterParams,
        genre: { [Op.iLike]: `%${filters.genre}%` },
      };
    }

    if (filters.publishingCountry) {
      filterParams = {
        ...filterParams,
        publishingCountry: { [Op.iLike]: `%${filters.publishingCountry}%` },
      };
    }

    if (filters.publishingYear) {
      filterParams = {
        ...filterParams,
        publishingYear: filters.publishingYear,
      };
    }

    if (
      filters.rating &&
      Array.isArray(filters.rating) &&
      filters.rating.length === 2
    ) {
      filterParams = {
        ...filterParams,
        rating: { [Op.between]: filters.rating },
      };
    }
  }

  let movies: Movie[];
  let count: number;

  try {
    count = await Movie.count({ where: { ...filterParams } });

    movies = await Movie.findAll({
      where: { ...filterParams },
      limit: searchParams.limit,
      offset: searchParams.offset,
      ...(searchParams.sorting &&
        searchParams.sorting.by &&
        searchParams.sorting.direction && {
          order: [[searchParams.sorting.by, searchParams.sorting.direction]],
        }),
      include: [{ model: Director }],
    });
  } catch (error) {
    console.error(error);
    throw constructError({
      message: INTERNAL_ERROR_MESSAGE,
      code: INTERNAL_ERROR_CODE,
    });
  }

  let currentPage: number = 0,
    totalPages: number = 0;

  if (searchParams.offset && searchParams.limit) {
    currentPage = Math.floor(searchParams.offset / searchParams.limit) + 1;
    totalPages = Math.ceil(count / searchParams.limit);
  }

  return { movies, paginationInfo: { count, currentPage, totalPages } };
};

export const createMovie = async (
  userId: number,
  moviePayload: CreateMovieParams
): Promise<Movie> => {
  const { error, value: validatedMovie } =
    createMovieSchema.validate(moviePayload);

  if (error) {
    throw constructError({ message: error.message, code: 400 });
  }

  const movie = validatedMovie as CreateMovieParams;

  let director: Director | null = null;

  const transaction = await sequelize.transaction();

  try {
    if (movie.directorFullName) {
      director = await getDirector(movie.directorFullName);

      if (!director) {
        try {
          director = await createDirector(
            { fullName: movie.directorFullName },
            transaction
          );
        } catch (error) {
          throw error;
        }
      }
    }
    let newMovie: Movie;
    try {
      newMovie = await Movie.create(
        {
          title: movie.title,
          publishingYear: movie.publishingYear,
          imageURL: movie.imageURL,
          publishingCountry: movie.publishingCountry,
          genre: movie.genre,
          rating: movie.rating,
          userId,
          ...(director && { directorId: director?.id }),
        },
        { transaction }
      );
    } catch (error) {
      console.error(error);
      throw constructError({
        message: INTERNAL_ERROR_MESSAGE,
        code: INTERNAL_ERROR_CODE,
      });
    }

    try {
      await transaction.commit();
    } catch (error) {
      throw constructError({
        message: INTERNAL_ERROR_MESSAGE,
        code: INTERNAL_ERROR_CODE,
      });
    }

    return newMovie;
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (error) {
      throw constructError({
        message: INTERNAL_ERROR_MESSAGE,
        code: INTERNAL_ERROR_CODE,
      });
    }
    console.error(error);
    throw error;
  }
};

export const updateMovie = async (
  userId: number,
  movieId: number,
  updateMoviePayload: UpdateMovieParams
): Promise<Movie> => {
  let movie: Movie | null;
  try {
    movie = await Movie.findByPk(movieId);
  } catch (error) {
    throw constructError({
      message: INTERNAL_ERROR_MESSAGE,
      code: INTERNAL_ERROR_CODE,
    });
  }

  if (!movie) {
    throw constructError({ message: "Movie not found.", code: 404 });
  }

  if (movie.userId !== userId) {
    throw constructError({ message: "Operation forbidden.", code: 403 });
  }

  const { error, value: validatedMovieUpdate } =
    updateMovieSchema.validate(updateMoviePayload);

  if (error) {
    throw constructError({ message: error.message, code: 400 });
  }

  try {
    await movie.update({ ...validatedMovieUpdate });
  } catch (error) {
    throw constructError({
      message: INTERNAL_ERROR_MESSAGE,
      code: INTERNAL_ERROR_CODE,
    });
  }

  return movie;
};
