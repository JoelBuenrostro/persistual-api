import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import authRoutes from './routes/auth.routes';
import habitRoutes from './routes/habit.routes';
import categoryRoutes from './routes/category.routes';
import { HttpError } from './services/user.service';

const app = express();

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentación Swagger en /docs
const openApiDocument = YAML.load('openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Health check
app.get('/healthz', (_req, res) => {
  res.sendStatus(200);
});

// Montaje de rutas
app.use('/api', authRoutes);
app.use('/api', habitRoutes);
app.use('/api', categoryRoutes);

// Manejador global de errores
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(
  (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
);

// Export para tests (no arranca el servidor aquí)
export default app;

// Si se ejecuta directamente, arrancar el servidor
if (require.main === module) {
  const port = process.env.PORT || 3000;
  // eslint-disable-next-line no-console
  console.log(`⚡️ Server running on http://localhost:${port}`);
  app.listen(port);
}
