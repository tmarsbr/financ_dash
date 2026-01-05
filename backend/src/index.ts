// backend/src/index.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analysisRouter from './routes/analysis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rotas
app.use('/api/analysis', analysisRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
