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
