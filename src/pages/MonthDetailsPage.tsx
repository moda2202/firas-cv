import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMoneyManager } from "../hooks/useMoneyManager";
import type { FinancialMonth, Bill } from "../types/money";
import { AddBillModal } from "../components/money/AddBillModal";
import { MonthSummaryChart } from "../components/money/MonthSummaryChart";

// 👇 استيراد مكتبة الترجمة
import { useTranslation } from "react-i18next";

export function MonthDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getMonthDetails, deleteBill, loading } = useMoneyManager();

    // 👇 تفعيل الترجمة
    const { t } = useTranslation();

    const [monthData, setMonthData] = useState<FinancialMonth | null>(null);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<Bill | null>(null); 

    useEffect(() => {
        if (id) loadData(Number(id));
    }, [id]);

    async function loadData(monthId: number) {
        try {
            const data = await getMonthDetails(monthId);
            setMonthData(data);
        } catch (error) {
            console.error("Error loading month details", error);
        }
    }

    const handleAddBill = () => {
        setEditingBill(null);
        setIsBillModalOpen(true);
    };

    const handleEditBill = (bill: Bill) => {
        setEditingBill(bill);
        setIsBillModalOpen(true);
    };

    const handleDeleteBill = async (billId: number) => {
        // 👇 ترجمة رسالة التأكيد
        if (window.confirm(t('mm_delete_bill_confirm', "Are you sure you want to delete this bill?"))) {
            await deleteBill(billId);
            if (monthData) loadData(monthData.id);
        }
    };

    const handleSuccess = () => {
        if (id) loadData(Number(id));
    };

    if (loading && !monthData) return <div className="page-center"><div className="spinner"></div></div>;
    if (!monthData) return null;

    return (
        <div className="page-center page-top">
            <div style={{ maxWidth: '800px', width: '100%' }}>

                {/* Header & Back Button */}
                <div style={{ marginBottom: '20px' }}>
                    <button onClick={() => navigate("/money-manager")} className="btn ghost small" style={{ marginBottom: '10px' }}>
                        {t('mm_back_dashboard', '← Back to Dashboard')}
                    </button>
                    <div className="section-head">
                        <div>
                            {/* 👇 ترجمة اسم الشهر هنا أيضاً */}
                            <h2 className="h2">{t(monthData.month, monthData.month)} {monthData.year}</h2>
                            <span className="muted">{t('mm_financial_overview', 'Financial Overview')}</span>
                        </div>
                        <button className="btn primary-btn" onClick={handleAddBill}>
                            {t('mm_add_bill', '+ Add Bill')}
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div className="muted small">{t('mm_total_income', 'Total Income')}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4ade80' }}>
                            {monthData.totalIncome.toLocaleString()} kr
                        </div>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div className="muted small">{t('mm_expenses', 'Expenses')}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f87171' }}>
                            {monthData.totalExpenses.toLocaleString()} kr
                        </div>
                    </div>
                    <div className="card" style={{ textAlign: 'center', borderColor: 'rgba(99, 102, 241, 0.5)' }}>
                        <div className="muted small">{t('mm_balance', 'Balance')}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#818cf8' }}>
                            {monthData.remainingBalance.toLocaleString()} kr
                        </div>
                    </div>
                </div>

                {/* الشارت */}
                {monthData.bills.length > 0 && (
                    <MonthSummaryChart monthData={monthData} />
                )}

                {/* Bills List */}
                <h3 className="h2" style={{ fontSize: '1.1rem', marginBottom: '15px' }}>{t('mm_transactions_history', 'Transactions History')}</h3>

                {monthData.bills.length === 0 ? (
                    <div className="card" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
                        {t('mm_no_bills', 'No bills added yet.')}
                    </div>
                ) : (
                    <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '10px' }}>
                        {monthData.bills.map(bill => (
                            <div key={bill.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }}>
                                {/* Left Side: Icon + Info */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center', fontSize: '1.2rem'
                                    }}>
                                        {bill.type === 'Home' ? '🏠' :
                                            bill.type === 'Food' ? '🍔' :
                                                bill.type === 'Car' ? '🚗' :
                                                    bill.type === 'Shopping' ? '🛍️' : '💸'}
                                    </div>
                                    <div>
                                        {/* 👇 ترجمة نوع الفاتورة */}
                                        <div style={{ fontWeight: 'bold' }}>{t(bill.type, bill.type)}</div>
                                        {bill.description && <div className="muted small">{bill.description}</div>}
                                    </div>
                                </div>

                                {/* Right Side: Amount + Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ fontWeight: 'bold', color: '#f87171', direction: 'ltr' }}>
                                        - {bill.amount.toLocaleString()} kr
                                    </div>

                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button
                                            onClick={() => handleEditBill(bill)}
                                            className="btn ghost small-btn"
                                            style={{ padding: '4px', color: '#fbbf24' }}
                                            title={t('mm_edit_tooltip', "Edit")}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBill(bill.id)}
                                            className="btn ghost small-btn"
                                            style={{ padding: '4px', color: '#f87171' }}
                                            title={t('mm_delete_tooltip', "Delete")}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <AddBillModal
                    isOpen={isBillModalOpen}
                    onClose={() => setIsBillModalOpen(false)}
                    onSuccess={handleSuccess}
                    financialMonthId={monthData.id}
                    initialData={editingBill} 
                />
            </div>
        </div>
    );
}