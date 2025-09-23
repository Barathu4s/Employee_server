import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { RegisterRoutes } from './routes';

const app = express();

app.use(cors({ origin: '*'}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/swagger.json', (_req, res) => {
  const swaggerPath = path.resolve(__dirname, '../swagger.json');
  res.sendFile(swaggerPath);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(undefined, { swaggerUrl: '/swagger.json' }));

// TSOA generated routes
RegisterRoutes(app);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  const base = `http://localhost:${port}`;
  console.log(`Server listening on ${base}`);
  console.log(`Health:       ${base}/health`);
  console.log(`Swagger UI:   ${base}/docs`);
  console.log(`OpenAPI JSON: ${base}/swagger.json`);
  console.log(`API base:     ${base}/api`);
});


