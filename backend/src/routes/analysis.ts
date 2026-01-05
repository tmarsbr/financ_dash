// backend/src/routes/analysis.ts

import { Router, Request, Response } from 'express';
import { analyzeFinances, analyzeFinancesStream } from '../services/geminiService';
import { Account, Transaction, Goal } from '../types';

const router = Router();

/**
 * POST /api/analysis/chat
 * Recebe uma pergunta e retorna análise do Gemini
 */
router.post('/chat', async (req: Request, res: Response) => {
    try {
        const { userQuestion, accounts, transactions, goals } = req.body;

        // Validação básica
        if (!userQuestion || typeof userQuestion !== 'string') {
            return res.status(400).json({ error: 'Pergunta inválida' });
        }

        if (!Array.isArray(accounts) || !Array.isArray(transactions) || !Array.isArray(goals)) {
            return res.status(400).json({ error: 'Dados financeiros inválidos' });
        }

        // Converter strings de data para objetos Date
        const transactionsWithDates = transactions.map((t: any) => ({
            ...t,
            date: new Date(t.date),
        }));

        const goalsWithDates = goals.map((g: any) => ({
            ...g,
            targetDate: g.targetDate ? new Date(g.targetDate) : undefined,
        }));

        // Chamar serviço Gemini
        const result = await analyzeFinances({
            userQuestion,
            accounts,
            transactions: transactionsWithDates,
            goals: goalsWithDates,
        });

        res.json(result);
    } catch (error) {
        console.error('Erro na rota /chat:', error);
        res.status(500).json({ error: 'Falha ao processar análise' });
    }
});

/**
 * POST /api/analysis/chat-stream
 * Versão com streaming para respostas em tempo real
 */
router.post('/chat-stream', async (req: Request, res: Response) => {
    try {
        const { userQuestion, accounts, transactions, goals } = req.body;

        // Validação básica
        if (!userQuestion || typeof userQuestion !== 'string') {
            return res.status(400).json({ error: 'Pergunta inválida' });
        }

        // Configurar headers para streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Converter strings de data para objetos Date
        const transactionsWithDates = transactions.map((t: any) => ({
            ...t,
            date: new Date(t.date),
        }));

        const goalsWithDates = goals.map((g: any) => ({
            ...g,
            targetDate: g.targetDate ? new Date(g.targetDate) : undefined,
        }));

        // Chamar serviço com streaming
        await analyzeFinancesStream(
            {
                userQuestion,
                accounts,
                transactions: transactionsWithDates,
                goals: goalsWithDates,
            },
            (chunk: string) => {
                res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
            }
        );

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Erro na rota /chat-stream:', error);
        res.write(`data: ${JSON.stringify({ error: 'Falha ao processar análise' })}\n\n`);
        res.end();
    }
});

export default router;
