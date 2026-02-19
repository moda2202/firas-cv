// src/pages/MoneyManagerPage.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMoneyManager } from "../hooks/useMoneyManager";
import type { DashboardItem } from "../types/money";
import { AddMonthModal } from "../components/money/AddMonthModal";
import { AuthHeader } from "../components/layout/AuthHeader";

import { useTranslation } from "react-i18next";

export function MoneyManagerPage() {
    const navigate = useNavigate();
    const { getDashboard, deleteMonth, loading: pageLoading } = useMoneyManager();
    const [months, setMonths] = useState<DashboardItem[]>([]);
    
    const { t } = useTranslation();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMonth, setEditingMonth] = useState<DashboardItem | null>(null);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const data = await getDashboard();
            setMonths(data);
        } catch (error) { console.error(error); }
    }

    const groupedAndSortedMonths = useMemo(() => {
        const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const groups = months.reduce((acc, item) => {
            if (!acc[item.year]) acc[item.year] = [];
            acc[item.year].push(item);
            return acc;
        }, {} as Record<number, DashboardItem[]>);

        const sortedYears = Object.keys(groups).map(Number).sort((a, b) => b - a);

        sortedYears.forEach(year => {
            groups[year].sort((a, b) => {
                return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
            });
        });

        return { sortedYears, groups };
    }, [months]);

    const handleAdd = () => {
        setEditingMonth(null); 
        setIsModalOpen(true);
    };

    const handleEdit = (e: React.MouseEvent, item: DashboardItem) => {
        e.stopPropagation();
        setEditingMonth(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); 
        if (window.confirm(t('mm_delete_confirm', "Are you sure you want to delete this month? All bills inside it will be lost."))) {
            await deleteMonth(id);
            loadData();
        }
    };

    return (
        <div className="app">
              <AuthHeader />
        <div className="page-center page-top">
            
            <div style={{ maxWidth: '800px', width: '100%' }}>
                <div className="section-head" style={{ marginBottom: '30px' }}>
                    <div>
                        <h2 className="h2">💰 {t('mm_title', 'Money Manager')}</h2>
                        <span className="muted">{t('mm_subtitle', 'Track your income and expenses')}</span>
                    </div>
                    <button className="btn primary-btn" onClick={handleAdd}>
                        {t('mm_start_new', '+ Start New Month')}
                    </button>
                </div>

                {pageLoading && months.length === 0 && <div className="spinner"></div>}

                {groupedAndSortedMonths.sortedYears.map((year) => (
                    <div key={year} style={{ marginBottom: '40px' }}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ fontSize: '1.3rem', color: '#e2e8f0', margin: 0 }}>📅 {year}</h3>
                            <span className="muted" style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px' }}>
                                {groupedAndSortedMonths.groups[year].length} {t('mm_months', 'Months')}
                            </span>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                            {groupedAndSortedMonths.groups[year].map((item) => (
                                <div 
                                    key={item.id} 
                                    className="card tile"
                                    onClick={() => navigate(`/money-manager/${item.id}`)}
                                    style={{ cursor: 'pointer', position: 'relative' }}
                                >

                                    {/* 👇 1. استخدمنا insetInlineEnd بدل right عشان تفهم عربي وإنجليزي */}
                                    <div style={{ position: 'absolute', top: '10px', insetInlineEnd: '10px', display: 'flex', gap: '8px' }}>
                                        <button 
                                            onClick={(e) => handleEdit(e, item)}
                                            className="btn ghost small-btn"
                                            style={{ padding: '4px', color: '#fbbf24' }}
                                            title={t('mm_edit_tooltip', "Edit")}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        
                                        <button 
                                            onClick={(e) => handleDelete(e, item.id)}
                                            className="btn ghost small-btn"
                                            style={{ padding: '4px', color: '#f87171' }}
                                            title={t('mm_delete_tooltip', "Delete")}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </div>

                                    {/* 👇 2. استخدمنا paddingInlineEnd بدل paddingRight لنفس السبب */}
                                    <div className="tile-title" style={{ fontSize: '1.2rem', paddingInlineEnd: '60px' }}>
                                        {t(item.month, item.month)}
                                    </div>
                                    <div className="tile-meta" style={{ marginTop: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span className="muted">{t('mm_income', 'Income:')}</span>
                                            <span style={{ color: '#4ade80', fontWeight: 'bold' }}>
                                                {item.totalIncome.toLocaleString()} kr
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {!pageLoading && months.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                        <p className="muted">{t('mm_no_records', 'No records yet. Click the button above to start!')}</p>
                    </div>
                )}

                <AddMonthModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={loadData}
                    initialData={editingMonth}
                />
            </div>
        </div>
        </div>
    );
}