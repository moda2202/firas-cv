import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import type { FinancialMonth } from '../../types/money';

interface Props {
    monthData: FinancialMonth;
}

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <g>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
            <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16} fill={fill} />
        </g>
    );
};

export function MonthSummaryChart({ monthData }: Props) {
    const [activeIndex, setActiveIndex] = useState(-1);

    const FALLBACK_COLORS = ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#c084fc', '#f87171', '#2dd4bf'];
    const REMAINING_BALANCE_COLOR = '#10b981'; 

    // 👇 1. حساب إجمالي المصاريف لمعرفة حالة الميزانية
    const totalExpenses = useMemo(() => {
        if (!monthData || !monthData.bills) return 0;
        return monthData.bills.reduce((sum, b) => sum + b.amount, 0);
    }, [monthData]);

    // 👇 2. تحديد ما إذا كان المستخدم تجاوز الميزانية (الدين)
    const isOverBudget = totalExpenses > monthData.totalIncome;

    // 👇 3. الأساس الذي سنحسب عليه النسبة المئوية (الراتب أم المصاريف؟)
    const percentageBase = isOverBudget ? totalExpenses : monthData.totalIncome;

    const chartData = useMemo(() => {
        if (!monthData) return [];
        
        const groupedBills = monthData.bills.reduce((acc, bill) => {
            const type = bill.type.charAt(0).toUpperCase() + bill.type.slice(1).toLowerCase();
            if (!acc[type]) {
                acc[type] = {
                    value: 0,
                    color: bill.color || FALLBACK_COLORS[Object.keys(acc).length % FALLBACK_COLORS.length]
                };
            }
            acc[type].value += bill.amount;
            return acc;
        }, {} as Record<string, { value: number, color: string }>);

        const data = Object.keys(groupedBills).map(key => ({
            name: key, 
            value: groupedBills[key].value,
            color: groupedBills[key].color 
        }));

        if (monthData.remainingBalance > 0) {
            data.push({ 
                name: 'Remaining Balance', 
                value: monthData.remainingBalance,
                color: REMAINING_BALANCE_COLOR
            });
        }
        return data.sort((a, b) => b.value - a.value);
    }, [monthData]);

    if (chartData.length === 0) return null;

    return (
        <div 
            className="card" 
            style={{ padding: '20px', marginBottom: '30px' }}
            onClick={() => setActiveIndex(-1)} 
        >
            <h3 className="h2" style={{ fontSize: '1.1rem', marginBottom: '20px', textAlign: 'center' }}>
                Expense Breakdown
            </h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                
                <div style={{ width: '250px', height: '250px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                                // @ts-ignore
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(-1)}
                                onClick={(_, index, e) => {
                                    if (e && e.stopPropagation) e.stopPropagation();
                                    setActiveIndex(index);
                                }}
                                style={{ outline: 'none', cursor: 'pointer' }}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        textAlign: 'center', pointerEvents: 'none', width: '130px'
                    }}>
                        {activeIndex === -1 ? (
                            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                {/* 👇 4. النص يتغير للأحمر إذا تجاوز الميزانية */}
                                <div className="muted" style={{ fontSize: '0.8rem', color: isOverBudget ? '#fca5a5' : undefined }}>
                                    {isOverBudget ? 'Total Expenses' : 'Total Income'}
                                </div>
                                <div style={{ fontWeight: 'bold', color: isOverBudget ? '#f87171' : '#4ade80', fontSize: '1.1rem' }}>
                                    {isOverBudget 
                                        ? (totalExpenses >= 1000 ? `${(totalExpenses / 1000).toFixed(1)}k` : totalExpenses)
                                        : (monthData.totalIncome >= 1000 ? `${(monthData.totalIncome / 1000).toFixed(1)}k` : monthData.totalIncome)
                                    }
                                </div>
                            </div>
                        ) : (
                            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                <div style={{ 
                                    fontSize: '0.9rem', 
                                    fontWeight: 'bold', 
                                    color: chartData[activeIndex]?.color, 
                                    marginBottom: '4px'
                                }}>
                                    {chartData[activeIndex]?.name}
                                </div>
                                <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.2rem' }}>
                                    {chartData[activeIndex]?.value.toLocaleString()} kr
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {chartData.map((entry, index) => (
                        <div 
                            key={entry.name} 
                            style={{ 
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '6px 10px', borderRadius: '6px',
                                background: activeIndex === index ? 'rgba(255,255,255,0.05)' : 'transparent',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(-1)}
                            onClick={(e) => {
                                e.stopPropagation(); 
                                setActiveIndex(index);
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ 
                                    width: '12px', height: '12px', borderRadius: '50%', 
                                    background: entry.color, 
                                    boxShadow: activeIndex === index ? `0 0 8px ${entry.color}` : 'none'
                                }}></div>
                                <span style={{ 
                                    fontSize: '0.9rem', 
                                    color: entry.name === 'Remaining Balance' ? REMAINING_BALANCE_COLOR : '#e2e8f0', 
                                    fontWeight: activeIndex === index ? 'bold' : 'normal' 
                                }}>
                                    {entry.name}
                                </span>
                            </div>
                            
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                                    {entry.value.toLocaleString()} kr
                                </span>
                                {/* 👇 5. القسمة تتم على الـ percentageBase الذي حددناه مسبقاً */}
                                <span className="muted" style={{ fontSize: '0.8rem', marginLeft: '8px' }}>
                                    ({((entry.value / percentageBase) * 100).toFixed(1)}%)
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}