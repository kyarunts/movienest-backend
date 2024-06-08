import { Column, DataType, Table } from "sequelize-typescript";
import { BaseModel } from "./base-model";

export interface CreateDirectorAttributes {
  fullName: string;
}

@Table({
  tableName: "directors",
})
export class Director extends BaseModel<Director, CreateDirectorAttributes> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  fullName!: string;
}
