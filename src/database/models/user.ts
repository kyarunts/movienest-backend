import { Column, DataType, HasMany, Table } from "sequelize-typescript";
import { BaseModel } from "./base-model";
import { Movie } from "./movie";

interface CreateUserAttributes {
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
}

@Table({
  tableName: "users",
})
export class User extends BaseModel<User, CreateUserAttributes> {
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  firstName!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  lastName!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @HasMany(() => Movie)
  movies!: Movie[];
}
