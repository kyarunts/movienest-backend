import { Sequelize } from "sequelize-typescript";

import { config } from "./config";

import Models from "./models";

const sequelize = new Sequelize({ ...config, models: Models });

export { sequelize };
