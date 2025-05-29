import 'reflect-metadata';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import authRoutes from './routes/auth.routes';

const app = express();

// Carga la especificación OpenAPI
const openApiDocument = YAML.load('openapi.yaml');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Health check
app.get('/healthz', (_req, res) => {
  res.sendStatus(200);
});

// API routes
app.use('/api', authRoutes);

// Exportamos la app para tests, sin arrancar el servidor aquí
export default app;

// Sólo arrancamos el servidor si este archivo se ejecuta directamente
if (require.main === module) {
  const port = process.env.PORT || 3000;
  // eslint-disable-next-line no-console
  console.log(`⚡️ Server running on http://localhost:${port}`);
  app.listen(port);
}
