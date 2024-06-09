import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from "sequelize-typescript";
import { BaseModel } from "./base-model";
import { User } from "./user";
import { Director } from "./director";

interface CreateMovieAttributes {
  title: string;
  publishingYear: number;
  publishingCountry: string | null;
  imageURL: string | null;
  genre: string | null;
  rating: number | null;
  userId: number | null;
  directorId: number | null;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the movie
 *         publishingYear:
 *           type: integer
 *           description: The publishing year of the movie
 *         publishingCountry:
 *           type: string
 *           nullable: true
 *           description: The publishing country of the movie
 *         imageURL:
 *           type: string
 *           nullable: true
 *           description: The URL of the movie's image
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
 *         userId:
 *           type: integer
 *           description: The ID of the user who added the movie
 *         directorId:
 *           type: integer
 *           nullable: true
 *           description: The ID of the director of the movie
 *         director:
 *           $ref: '#/components/schemas/Director'
 */
@Table({
  tableName: "movies",
})
export class Movie extends BaseModel<Movie, CreateMovieAttributes> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  publishingYear!: number;

  @Column({ type: DataType.STRING, allowNull: true })
  publishingCountry!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  imageURL!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  genre!: string | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 10,
    },
  })
  rating!: number | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Director)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  directorId!: number | null;

  @BelongsTo(() => Director)
  director!: Director;
}
