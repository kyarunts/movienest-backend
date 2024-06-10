import { NextFunction, Request, Response, Router } from "express";
import constructError from "../../utils/constructError";
import { getUser, updateUser } from "./user.service";

const router = Router();

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get the current user
 *     description: Retrieve the details of the currently authenticated user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */
router.get("/users/me", async (req: any, res: Response, next: NextFunction) => {
  const userId: number = req.userId;

  if (!userId) {
    return next(
      constructError({ message: "ID is missing in request object.", code: 500 })
    );
  }

  try {
    const user = await getUser(userId);
    return res.status(200).send(user);
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /api/users/:ID:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieve the details of another user by ID.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to update
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */
router.get(
  "/users/:ID",
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.ID;

    if (!userId) {
      return next(
        constructError({ message: "ID is required in params.", code: 400 })
      );
    }

    if (Number.isNaN(Number(userId))) {
      return next(
        constructError({
          message: "ID is required to be a number in params.",
          code: 400,
        })
      );
    }

    try {
      const user = await getUser(Number(userId));
      return res.status(200).send(user);
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @swagger
 * /api/users/:ID:
 *   put:
 *     summary: Update a user by ID
 *     description: Update the details of a user by ID.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserParams'
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */
router.put(
  "/users/:ID",
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.ID;

    if (!userId) {
      return next(
        constructError({ message: "ID is required in params.", code: 400 })
      );
    }

    if (Number.isNaN(Number(userId))) {
      return next(
        constructError({
          message: "ID is required to be a number in params.",
          code: 400,
        })
      );
    }

    try {
      const user = await updateUser(Number(userId), req.body);
      return res.status(200).send(user);
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
