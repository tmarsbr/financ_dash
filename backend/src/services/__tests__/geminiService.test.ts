// backend/src/services/__tests__/geminiService.test.ts

import { analyzeFinances } from '../geminiService';
import { Account, Transaction, Goal } from '../../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock setup
const mockGenerateContent = jest.fn();
mockGenerateContent.mockResolvedValue({
    response: {
        text: () => 'Análise simulada do Gemini',
    },
});

const mockGetGenerativeModel = jest.fn().mockReturnValue({
    generateContent: mockGenerateContent,
});

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: () => ({
                    generateContent: mockGenerateContent
                })
            };
        }),
    };
});

describe('GeminiService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar uma análise válida', async () => {
        // Setup mock response
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => 'Análise simulada do Gemini',
            },
        });

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

        expect(result.response).toBe('Análise simulada do Gemini');
        expect(result.timestamp).toBeInstanceOf(Date);
        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });
});
