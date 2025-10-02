import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { RegisterRoutes } from './routes';
import { EmployeeService } from './services/EmployeeService';

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

RegisterRoutes(app);

const service = new EmployeeService();
app.get('/api/files/employees/:employeeId/image', async (req, res) => {
  try {
    const id = Number(req.params.employeeId);
    const file = await service.getEmployeeFile(id, 'image');
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.fileName)}"`);
    res.setHeader('Cache-Control', 'private, max-age=300, no-transform');
    res.setHeader('Content-Length', String(file.data.length));
    res.status(200).send(file.data);
  } catch (e: any) {
    res.status(e?.status || 500).json({ error: e?.message || 'Failed to load image' });
  }
});
app.get('/api/files/employees/:employeeId/document', async (req, res) => {
  try {
    const id = Number(req.params.employeeId);
    const file = await service.getEmployeeFile(id, 'document');
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.fileName)}"`);
    res.setHeader('Cache-Control', 'private, max-age=300, no-transform');
    res.setHeader('Content-Length', String(file.data.length));
    res.status(200).send(file.data);
  } catch (e: any) {
    res.status(e?.status || 500).json({ error: e?.message || 'Failed to load document' });
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  const base = `http://localhost:${port}`;
  console.log(`Server listening on ${base}`);
  console.log(`Health:       ${base}/health`);
  console.log(`Swagger UI:   ${base}/docs`);
  console.log(`OpenAPI JSON: ${base}/swagger.json`);
  console.log(`API base:     ${base}/api`);
});


