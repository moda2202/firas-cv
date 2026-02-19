import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import type { DashboardItem, FinancialMonth, CreateMonthRequest, CreateBillRequest } from "../types/money";
import { API_BASE } from '../config';
const BASE_URL = `${API_BASE}/api/MoneyManager`;

export function useMoneyManager() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // دالة مساعدة للاتصال (عشان ما نكرر الهيدر)
    const authFetch = async (endpoint: string, options: RequestInit = {}) => {
        if (!token) throw new Error("No token found");

        const res = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // التوكن يرسل هنا
                ...options.headers,
            },
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || "Something went wrong");
        }
        return res.json();
    };

    // 1. جلب الداشبورد
    const getDashboard = useCallback(async (): Promise<DashboardItem[]> => {
        setLoading(true);
        try {
            const data = await authFetch("/dashboard");
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token]);

    // 2. جلب تفاصيل شهر معين
    const getMonthDetails = useCallback(async (id: number): Promise<FinancialMonth> => {
        setLoading(true);
        try {
            const data = await authFetch(`/month/${id}`);
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token]);

    // 3. إنشاء شهر جديد
    const createMonth = useCallback(async (data: CreateMonthRequest) => {
        setLoading(true);
        try {
            await authFetch("/create-month", {
                method: "POST",
                body: JSON.stringify(data),
            });
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token]);

    // 4. إضافة فاتورة
    const addBill = useCallback(async (data: CreateBillRequest) => {
        setLoading(true);
        try {
            await authFetch("/add-bill", {
                method: "POST",
                body: JSON.stringify(data),
            });
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token]);

    const deleteMonth = useCallback(async (id: number) => {
        setLoading(true);
        try {
            await authFetch(`/${id}`, {
                method: "DELETE",
            });
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token]);

    // 5. دالة تعديل شهر
    const updateMonth = useCallback(async (id: number, data: CreateMonthRequest) => {
        setLoading(true);
        try {
            await authFetch(`/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token]);

    // ... داخل الدالة useMoneyManager

    // 6. حذف فاتورة
    const deleteBill = useCallback(async (id: number) => {
        setLoading(true);
        try {
            await authFetch(`/bill/${id}`, { method: "DELETE" });
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token]);

    // 7. تعديل فاتورة
    const updateBill = useCallback(async (id: number, data: CreateBillRequest) => {
        setLoading(true);
        try {
            await authFetch(`/bill/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token]);

    // أضفهم للـ return
    return {
        getDashboard, getMonthDetails, createMonth, addBill, deleteMonth, updateMonth,
        deleteBill, // 👈 جديد
        updateBill, // 👈 جديد
        loading, error
    };
}