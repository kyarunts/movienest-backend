import { NextFunction, Request, Response, Router } from "express";
import constructError from "../../utils/constructError";
import { createMovie, getMovie, getMovies, updateMovie } from "./movie.service";
import {
  UNAUTHORIZED_ERROR_CODE,
  UNAUTHORIZED_ERROR_MESSAGE,
} from "../../utils/constants";
import { validateGetMoviesQuery } from "../../middlewares/validator.middleware";

const router = Router();

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Get movies
 *     description: Retrieve movies based on provided filters and sorting options.
 *     tags:
 *       - Movies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Number of movies to return
 *         schema:
 *           type: integer
 *       - name: offset
 *         in: query
 *         description: Number of movies to skip
 *         schema:
 *           type: integer
 *       - name: genre
 *         in: query
 *         description: Genre of the movies
 *         schema:
 *           type: string
 *       - name: publishingYear
 *         in: query
 *         description: Publishing year of the movies
 *         schema:
 *           type: integer
 *       - name: publishingCountry
 *         in: query
 *         description: Publishing country of the movies
 *         schema:
 *           type: string
 *       - name: rating
 *         in: query
 *         description: Rating range of the movies (e.g., [5, 8])
 *         schema:
 *           type: array
 *           items:
 *             type: number
 *             minimum: 0
 *             maximum: 10
 *       - name: sortingDirection
 *         in: query
 *         description: Sorting direction (ASC or DESC)
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *       - name: sortingBy
 *         in: query
 *         description: Sorting field (publishingYear, rating, or title)
 *         schema:
 *           type: string
 *           enum: [publishingYear, rating, title]
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 movies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Movie'
 *                 paginationInfo:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */
router.get(
  "/movies",
  validateGetMoviesQuery,
  async (req: any, res: Response, next: NextFunction) => {
    const userId = req.userId;

    if (!userId) {
      return next(
        constructError({
          message: UNAUTHORIZED_ERROR_MESSAGE,
          code: UNAUTHORIZED_ERROR_CODE,
        })
      );
    }

    const {
      limit,
      offset,
      genre,
      publishingYear,
      publishingCountry,
      rating,
      sortingDirection,
      sortingBy,
    } = req.query;

    try {
      const movies = await getMovies(Number(userId), {
        limit,
        offset,
        filters: {
          genre,
          publishingYear,
          publishingCountry,
          rating,
        },
        sorting: {
          direction: sortingDirection,
          by: sortingBy,
        },
      });
      return res.status(200).send(movies);
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @swagger
 * /api/movies/{ID}:
 *   get:
 *     summary: Get a movie by ID
 *     description: Retrieve details of a movie by its ID.
 *     tags:
 *       - Movies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the movie to retrieve
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/movies/:ID",
  async (req: any, res: Response, next: NextFunction) => {
    const userId = req.userId;

    if (!userId) {
      return next(
        constructError({
          message: UNAUTHORIZED_ERROR_MESSAGE,
          code: UNAUTHORIZED_ERROR_CODE,
        })
      );
    }

    const movieId = req.params.ID;

    if (!movieId) {
      return next(
        constructError({ message: "ID is required in params.", code: 400 })
      );
    }

    if (Number.isNaN(Number(movieId))) {
      return next(
        constructError({
          message: "ID is required to be a number in params.",
          code: 400,
        })
      );
    }

    try {
      const movie = await getMovie(Number(userId), Number(movieId));
      return res.status(200).send(movie);
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: Create a new movie
 *     description: Create a new movie with the provided details.
 *     tags:
 *       - Movies
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMovieParams'
 *     responses:
 *       201:
 *         description: Movie created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Bad request - Invalid movie data
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */
router.post("/movies", async (req: any, res: Response, next: NextFunction) => {
  const userId = req.userId;

  if (!userId) {
    return next(
      constructError({
        message: UNAUTHORIZED_ERROR_MESSAGE,
        code: UNAUTHORIZED_ERROR_CODE,
      })
    );
  }

  try {
    const movie = await createMovie(Number(userId), req.body);
    return res.status(200).send(movie);
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /api/movies/{ID}:
 *   put:
 *     summary: Update a movie by ID
 *     description: Update the details of a movie by its ID.
 *     tags:
 *       - Movies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the movie to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMovieParams'
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Bad request - Invalid movie data or ID
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/movies/:ID",
  async (req: any, res: Response, next: NextFunction) => {
    const userId = req.userId;

    if (!userId) {
      return next(
        constructError({
          message: UNAUTHORIZED_ERROR_MESSAGE,
          code: UNAUTHORIZED_ERROR_CODE,
        })
      );
    }

    const movieId = req.params.ID;

    if (!movieId) {
      return next(
        constructError({ message: "ID is required in params.", code: 400 })
      );
    }

    if (Number.isNaN(Number(movieId))) {
      return next(
        constructError({
          message: "ID is required to be a number in params.",
          code: 400,
        })
      );
    }

    try {
      const movie = await updateMovie(
        Number(userId),
        Number(movieId),
        req.body
      );
      return res.status(200).send(movie);
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
