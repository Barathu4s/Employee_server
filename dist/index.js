"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const routes_1 = require("./routes");
const EmployeeService_1 = require("./services/EmployeeService");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.get('/swagger.json', (_req, res) => {
    const swaggerPath = path_1.default.resolve(__dirname, '../swagger.json');
    res.sendFile(swaggerPath);
});
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(undefined, { swaggerUrl: '/swagger.json' }));
// TSOA generated routes
(0, routes_1.RegisterRoutes)(app);
// Raw binary file endpoints (bypass TSOA to ensure proper streaming)
const service = new EmployeeService_1.EmployeeService();
app.get('/api/files/employees/:employeeId/image', async (req, res) => {
    try {
        const id = Number(req.params.employeeId);
        const file = await service.getEmployeeFile(id, 'image');
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.fileName)}"`);
        res.setHeader('Cache-Control', 'private, max-age=300, no-transform');
        res.setHeader('Content-Length', String(file.data.length));
        res.status(200).send(file.data);
    }
    catch (e) {
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
    }
    catch (e) {
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
