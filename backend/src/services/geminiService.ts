// backend/src/services/geminiService.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Account, Transaction, Goal, AnalysisRequest, AnalysisResponse } from '../types';

// Ensure API key is present
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || '');

/**
 * Formata os dados financeiros em um formato legível para o Gemini
 */
function formatFinancialData(
    accounts: Account[],
    transactions: Transaction[],
    goals: Goal[]
): string {
    const accountsJson = JSON.stringify(accounts, null, 2);
    const transactionsJson = JSON.stringify(
        transactions.map(t => ({
            ...t,
            date: t.date.toISOString().split('T')[0],
        })),
        null,
        2
    );
    const goalsJson = JSON.stringify(
        goals.map(g => ({
            ...g,
            targetDate: g.targetDate ? g.targetDate.toISOString().split('T')[0] : null,
        })),
        null,
        2
    );

    return `## CONTAS
${accountsJson}

## TRANSAÇÕES
${transactionsJson}

## METAS
${goalsJson}`;
}

/**
 * Cria o prompt completo para o Gemini
 */
function buildPrompt(
    userQuestion: string,
    accounts: Account[],
    transactions: Transaction[],
    goals: Goal[]
): string {
    const financialData = formatFinancialData(accounts, transactions, goals);

    return `# CONTEXTO
Você é um Assistente Financeiro Pessoal Especialista. Sua missão é analisar os dados financeiros do usuário para fornecer respostas claras, insights úteis e recomendações práticas. Responda sempre em Markdown.

## REGRAS IMPORTANTES
1. Baseie-se APENAS nos dados fornecidos. Nunca invente transações ou saldos.
2. Não dê conselhos de investimento específicos (ex: "Compre ações da empresa X").
3. Seja neutro e objetivo. Use linguagem construtiva, não julgadora.
4. Se a pergunta for ambígua, peça esclarecimentos.
5. Sempre reforce que a análise é segura e privada.

# DADOS FINANCEIROS
${financialData}

# PERGUNTA DO USUÁRIO
"${userQuestion}"

# SUA ANÁLISE
(Comece sua resposta aqui)`;
}

/**
 * Envia a análise para o Gemini e retorna a resposta
 */
export async function analyzeFinances(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = buildPrompt(
            request.userQuestion,
            request.accounts,
            request.transactions,
            request.goals
        );

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return {
            response: responseText,
            timestamp: new Date(),
        };
    } catch (error) {
        console.error('Erro ao chamar API Gemini:', error);
        throw new Error('Falha ao processar análise financeira');
    }
}

/**
 * Versão streaming da análise (para respostas em tempo real)
 */
export async function analyzeFinancesStream(
    request: AnalysisRequest,
    onChunk: (chunk: string) => void
): Promise<void> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = buildPrompt(
            request.userQuestion,
            request.accounts,
            request.transactions,
            request.goals
        );

        const stream = await model.generateContentStream(prompt);

        for await (const chunk of stream.stream) {
            const chunkText = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
            if (chunkText) {
                onChunk(chunkText);
            }
        }
    } catch (error) {
        console.error('Erro ao chamar API Gemini (stream):', error);
        throw new Error('Falha ao processar análise financeira');
    }
}
