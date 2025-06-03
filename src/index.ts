import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import habitRoutes from './routes/habit.routes';

const app = express();

// 1. Configuración del rate limiter global
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por IP en esa ventana
  standardHeaders: true, // devuelve info de límite en cabeceras RateLimit-*
  legacyHeaders: false, // deshabilita cabeceras X-RateLimit-*
  message: {
    message:
      'Has excedido el número de peticiones permitidas. Intenta de nuevo más tarde.',
  },
});

// 2. Aplica el rate limiter a todas las rutas que empiezan con /api
app.use('/api', apiLimiter);

// Middlewares de parseo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentación Swagger en /docs
const openApiDocument = YAML.load('openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Health check
app.get('/healthz', (_req, res) => {
  res.sendStatus(200);
});

// Rutas de la API
app.use('/api', authRoutes);

// Rutas de hábitos (POST /api/habits, etc.)
app.use('/api/habits', habitRoutes);

// Exportamos la app para tests
export default app;

// Si se ejecuta directamente, arranca el servidor
if (require.main === module) {
  const port = process.env.PORT || 3000;
  // eslint-disable-next-line no-console
  console.log(`⚡️ Server corriendo en http://localhost:${port}`);
  app.listen(port);
}
