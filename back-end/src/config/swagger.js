import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

const port = process.env.PORT || 3000;
const baseUrl = process.env.API_BASE_URL || `http://localhost:${port}`;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Badminton Tournament API',
      version: '1.0.0',
      description: 'Express API documentation',
    },
    servers: [{ url: baseUrl }],
  },
  apis: [path.join(process.cwd(), 'src', 'modules', '**', '*.routes.js')],
};

export const swaggerSpec = swaggerJsdoc(options);
