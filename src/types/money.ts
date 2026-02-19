// src/types/money.ts

export interface Bill {
    color: string;
    id: number;
    type: string;
    amount: number;
    description?: string;
}

export interface FinancialMonth {
    id: number;
    year: number;
    month: string;
    totalIncome: number;
    totalExpenses: number;
    remainingBalance: number;
    bills: Bill[];
}

export interface DashboardItem {
    id: number;
    year: number;
    month: string;
    totalIncome: number;
}

export interface CreateMonthRequest {
    year: number;
    month: string;
    totalIncome: number;
}

export interface CreateBillRequest {
    financialMonthId: number;
    type: string;
    amount: number;
    description?: string;
}