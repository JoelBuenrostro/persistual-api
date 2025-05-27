import express, { RequestHandler } from 'express';

const healthHandler: RequestHandler = (_req, res) => {
  res.sendStatus(200);
};

const app = express();
app.get('/healthz', healthHandler);

export default app;
