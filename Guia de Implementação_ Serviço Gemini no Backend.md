# Guia de Implementação: Serviço Gemini no Backend

## 1. Instalação de Dependências

Primeiro, instale a SDK do Google Generative AI:

```bash
npm install @google/generative-ai
npm install dotenv  # Para gerenciar variáveis de ambiente
```

## 2. Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto backend:

```
GEMINI_API_KEY=sua_chave_api_aqui
DATABASE_URL=./data/finance.db
PORT=3001
NODE_ENV=development
```

## 3. Tipos TypeScript

Cri um arquivo `backend/src/types/index.ts` com as definições de tipos:

```typescript
// backend/src/types/index.ts

export interface Account {
  id: string;
  name: string;
  type: 'corrente' | 'poupanca' | 'cartao' | 'investimento';
  balance: number;
  institution: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  accountId: string;
  type: 'entrada' | 'saida';
  notes?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  description?: string;
  targetDate?: Date;
}

export interface AnalysisRequest {
  userQuestion: string;
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
}

export interface AnalysisResponse {
  response: string;
  timestamp: Date;
}
```

## 4. Serviço Gemini

Crie um arquivo `backend/src/services/geminiService.ts`:

```typescript
// backend/src/services/geminiService.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Account, Transaction, Goal, AnalysisRequest, AnalysisResponse } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
```

## 5. Rota Express

Crie um arquivo `backend/src/routes/analysis.ts`:

```typescript
// backend/src/routes/analysis.ts

import { Router, Request, Response } from 'express';
import { analyzeFinances } from '../services/geminiService';
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
```

## 6. Integração no Servidor Express

Atualize seu arquivo `backend/src/index.ts`:

```typescript
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
```

## 7. Exemplo de Chamada no Frontend

No frontend, crie um serviço para chamar a API:

```typescript
// frontend/src/services/analysisApi.ts

import { Account, Transaction, Goal } from '../types';

interface AnalysisRequest {
  userQuestion: string;
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
}

interface AnalysisResponse {
  response: string;
  timestamp: string;
}

export async function askGemini(request: AnalysisRequest): Promise<AnalysisResponse> {
  const response = await fetch('http://localhost:3001/api/analysis/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Falha ao obter análise');
  }

  return response.json();
}

export async function askGeminiStream(
  request: AnalysisRequest,
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch('http://localhost:3001/api/analysis/chat-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Falha ao obter análise');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Sem reader disponível');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i];
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.chunk) {
          onChunk(data.chunk);
        }
      }
    }

    buffer = lines[lines.length - 1];
  }
}
```

## 8. Componente React para o Chat

```typescript
// frontend/src/components/Chat.tsx

import React, { useState } from 'react';
import { askGemini } from '../services/analysisApi';
import { Account, Transaction, Goal } from '../types';
import ReactMarkdown from 'react-markdown';

interface ChatProps {
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
}

export const Chat: React.FC<ChatProps> = ({ accounts, transactions, goals }) => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const result = await askGemini({
        userQuestion: question,
        accounts,
        transactions,
        goals,
      });

      setResponse(result.response);
    } catch (err) {
      setError('Erro ao processar sua pergunta. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Assistente Financeiro</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Faça uma pergunta sobre suas finanças..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Analisando...' : 'Enviar'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
          {error}
        </div>
      )}

      {response && (
        <div className="p-4 bg-gray-50 rounded-lg prose prose-sm max-w-none">
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};
```

## 9. Tratamento de Erros e Limitações

Considere adicionar tratamento para:

- **Rate Limiting:** Implemente um sistema de fila para não sobrecarregar a API
- **Timeout:** Adicione timeout para requisições que demoram muito
- **Cache:** Armazene respostas para perguntas repetidas
- **Validação:** Valide os dados antes de enviar para o Gemini

```typescript
// Exemplo de rate limiting simples
const requestQueue: Array<() => Promise<void>> = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing || requestQueue.length === 0) return;
  
  isProcessing = true;
  const request = requestQueue.shift();
  
  if (request) {
    await request();
  }
  
  isProcessing = false;
  processQueue();
}
```

## 10. Testes

Crie testes para validar o serviço:

```typescript
// backend/src/services/__tests__/geminiService.test.ts

import { analyzeFinances } from '../geminiService';
import { Account, Transaction, Goal } from '../../types';

describe('GeminiService', () => {
  it('deve retornar uma análise válida', async () => {
    const mockAccounts: Account[] = [
      {
        id: 'acc-1',
        name: 'Nubank',
        type: 'corrente',
        balance: 1000,
        institution: 'Nubank',
      },
    ];

    const mockTransactions: Transaction[] = [
      {
        id: 'tx-1',
        description: 'iFood',
        amount: 50,
        date: new Date(),
        category: 'Alimentação',
        accountId: 'acc-1',
        type: 'saida',
      },
    ];

    const result = await analyzeFinances({
      userQuestion: 'Quanto gastei com alimentação?',
      accounts: mockAccounts,
      transactions: mockTransactions,
      goals: [],
    });

    expect(result.response).toBeTruthy();
    expect(result.timestamp).toBeInstanceOf(Date);
  });
});
```

---

## Conclusão

Com essa implementação, você terá um serviço robusto e escalável para integrar o Gemini ao seu dashboard financeiro. O serviço suporta tanto requisições simples quanto streaming em tempo real, oferecendo flexibilidade para diferentes casos de uso.
