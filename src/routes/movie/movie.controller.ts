import { NextFunction, Request, Response, Router } from "express";
import constructError from "../../utils/constructError";
import { createMovie, getMovie, getMovies, updateMovie } from "./movie.service";

const router = Router();

router.get("/movies", async (req: any, res: Response, next: NextFunction) => {
  const userId = req.userId;

  if (!userId) {
    return next(constructError({ message: "Unauthorized", code: 401 }));
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

  let parsedRating;
  // try {
  //   parsedRating = JSON.parse(rating);
  //   if (!Array.isArray(parsedRating)) {
  //     next(
  //       constructError({
  //         message: "'rating' should be an array.",
  //         code: 400,
  //       })
  //     );
  //   }
  // } catch (error) {
  //   next(constructError({ message: "Cannot parse request query.", code: 400 }));
  // }

  try {
    console.log("Hereee");

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
});

router.get(
  "/movies/:ID",
  async (req: any, res: Response, next: NextFunction) => {
    const userId = req.userId;

    if (!userId) {
      return next(constructError({ message: "Unauthorized", code: 401 }));
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

router.post("/movies", async (req: any, res: Response, next: NextFunction) => {
  const userId = req.userId;

  if (!userId) {
    return next(constructError({ message: "Unauthorized", code: 401 }));
  }

  try {
    const movie = await createMovie(Number(userId), req.body);
    return res.status(200).send(movie);
  } catch (error) {
    return next(error);
  }
});

router.put(
  "/movies/:ID",
  async (req: any, res: Response, next: NextFunction) => {
    const userId = req.userId;

    if (!userId) {
      return next(constructError({ message: "Unauthorized", code: 401 }));
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
