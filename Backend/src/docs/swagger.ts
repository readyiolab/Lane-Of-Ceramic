import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: { title: "Ceramic Studio API", version: "1.0.0" },
    servers: [{ url: "http://localhost:3000/api/v1" }],
  },
  apis: ["./src/modules/**/*.ts"],
});
