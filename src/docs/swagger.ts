import swaggerJsdoc, { SwaggerDefinition } from "swagger-jsdoc";

const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "MovieNest API with Swagger",
    version: "1.0.0",
    description: "MovieNest application documented with Swagger",
  },
  servers: [
    {
      url: `${process.env.HOST}:${process.env.PORT}`,
      description: "Server",
    },
  ],
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: ["src/routes/**/*.ts", "src/database/**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec };
