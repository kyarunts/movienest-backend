import Joi from "joi";

import constructError from "../../utils/constructError";

import { Movie } from "../../database/models/movie";
import { Director } from "../../database/models/director";
import { sequelize } from "../../database/sequelize";
import { createDirector, getDirector } from "../director/director.service";
import { SortingByEnum, SortingDirectionEnum } from "../../utils/enum";
import { Op } from "sequelize";

export const createMovieSchema = Joi.object({
  title: Joi.string().required(),
  publishingYear: Joi.number().integer().required(),
  imageURL: Joi.string(),
  publishingCountry: Joi.string(),
  genre: Joi.string(),
  rating: Joi.number(),
  directorFullName: Joi.string(),
});

export const updateMovieSchema = Joi.object({
  title: Joi.string(),
  publishingYear: Joi.number().integer(),
  imageURL: Joi.string(),
  publishingCountry: Joi.string(),
  genre: Joi.string(),
  rating: Joi.number(),
});

export const getMoviesSchema = Joi.object({
  limit: Joi.number().optional(),
  offset: Joi.number().optional(),
  filters: Joi.object({
    genre: Joi.string().optional(),
    publishingYear: Joi.number().optional(),
    publishingCountry: Joi.string().optional(),
    rating: Joi.array().optional(),
  }).optional(),
  sorting: Joi.object({
    direction: Joi.string().optional(),
    by: Joi.string().optional(),
  }).optional(),
});

interface CreateMovieParams {
  title: string;
  publishingYear: number;
  imageURL: string | null;
  publishingCountry: string | null;
  genre: string | null;
  rating: number | null;
  directorFullName: string | null;
}

interface UpdateMovieParams {
  title: string | null;
  publishingYear: number | null;
  imageURL: string | null;
  publishingCountry: string | null;
  genre: string | null;
  rating: number | null;
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
  const movie = await Movie.findByPk(movieId);

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
): Promise<Movie[]> => {
  console.log(searchParams);

  const { error, value: validatedSearchParams } =
    getMoviesSchema.validate(searchParams);

  if (error) {
    throw constructError({ message: error.message, code: 400 });
  }

  searchParams = validatedSearchParams;

  let filterParams: any = {};
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

    if (filters.rating) {
      filterParams = {
        ...filterParams,
        rating: { [Op.between]: filters.rating },
      };
    }
  }

  const movies = await Movie.findAll({
    where: { userId, ...filterParams },
    limit: searchParams.limit,
    offset: searchParams.offset,
    ...(searchParams.sorting && {
      order: [[searchParams.sorting.by, searchParams.sorting.direction]],
    }),
  });

  return movies;
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
        director = await createDirector(
          { fullName: movie.directorFullName },
          transaction
        );
      }
    }

    const newMovie = await Movie.create(
      {
        title: movie.title,
        publishingYear: movie.publishingYear,
        imageURL: movie.imageURL,
        publishingCountry: movie.publishingCountry,
        genre: movie.genre,
        rating: movie.rating,
        userId,
        directorId: director?.id,
      },
      { transaction }
    );

    await transaction.commit();

    return newMovie;
  } catch (error) {
    await transaction.rollback();
    throw constructError({
      message: "There was an internal error.",
      code: 500,
    });
  }
};

export const updateMovie = async (
  userId: number,
  movieId: number,
  updateMoviePayload: UpdateMovieParams
): Promise<Movie> => {
  const movie: Movie | null = await Movie.findByPk(movieId);

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

  return movie.update({ ...validatedMovieUpdate });
};
