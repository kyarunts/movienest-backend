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
    type: DataType.DOUBLE,
    allowNull: true,
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
