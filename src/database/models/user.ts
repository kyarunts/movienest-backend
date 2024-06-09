import { Column, DataType, HasMany, Table } from "sequelize-typescript";
import { BaseModel } from "./base-model";
import { Movie } from "./movie";

interface CreateUserAttributes {
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           nullable: true
 *           description: The user's first name
 *         lastName:
 *           type: string
 *           nullable: true
 *           description: The user's last name
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         password:
 *           type: string
 *           format: password
 *           description: The user's password
 *       required:
 *         - email
 *         - password
 */
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
