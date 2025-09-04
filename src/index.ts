// Core y terceros
import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import express, { ErrorRequestHandler } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// i18n
import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';
import Backend from 'i18next-fs-backend';

// Rutas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import habitRoutes from './routes/habit.routes';
import categoryRoutes from './routes/category.routes';
import metricsRoutes from './routes/metrics.routes';
import notificationRoutes from './routes/notification.routes';

// Servicios y utilidades
import { HttpError } from './services/user.service';

const app = express();

// Configuración i18next
i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'es',
    preload: ['es', 'en'],
    backend: {
      loadPath: __dirname + '/../locales/{{lng}}/translation.json',
    },
  });
app.use(i18nextMiddleware.handle(i18next));

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentación Swagger en /docs
const openApiDocument = YAML.load('openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Health check
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Montaje de rutas
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', habitRoutes);
app.use('/api', categoryRoutes);
app.use('/api', metricsRoutes);
app.use('/api', notificationRoutes);

// Middleware para rutas no encontradas (404)
app.use((_req, res, _next) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejador global de errores
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
  } else {
    console.error(err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
app.use(errorHandler);

// Export para tests (no arranca el servidor aquí)
export default app;

// Si se ejecuta directamente, arrancar el servidor
if (require.main === module) {
  const port = process.env.PORT || 3000;
  // eslint-disable-next-line no-console
  console.warn(`⚡️ Server running on http://localhost:${port}`);
  app.listen(port);
}
