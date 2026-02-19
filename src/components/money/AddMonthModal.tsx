import { useState, useEffect } from "react";
import { useMoneyManager } from "../../hooks/useMoneyManager";
import type { DashboardItem } from "../../types/money";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: DashboardItem | null;
}

export function AddMonthModal({ isOpen, onClose, onSuccess, initialData }: Props) {
    const { createMonth, updateMonth, loading } = useMoneyManager();

    // سنستخدم متغير واحد للتاريخ بصيغة "YYYY-MM"
    const [dateValue, setDateValue] = useState("");
    const [income, setIncome] = useState("");
    const [error, setError] = useState("");

    // مصفوفة مساعدة لتحويل رقم الشهر لاسم (لأن الباك إند عندك بيطلب الاسم text)
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // حالة التعديل: نحول "February" و 2026 إلى "2026-02" ليفهمها الانبوت
                const monthIndex = monthNames.indexOf(initialData.month);
                const monthNumber = String(monthIndex + 1).padStart(2, '0'); // يحول 2 إلى "02"
                setDateValue(`${initialData.year}-${monthNumber}`);

                setIncome(initialData.totalIncome.toString());
            } else {
                // حالة الإضافة: نضع التاريخ الحالي افتراضياً
                const now = new Date();
                const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
                const currentYear = now.getFullYear();
                setDateValue(`${currentYear}-${currentMonth}`);

                setIncome("");
            }
            setError("");
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!dateValue) {
            setError("Please select a valid month and year.");
            return;
        }

        try {
            // هنا السحر: نفكك التاريخ "2026-02" لنرسله للباك إند
            const [yearStr, monthStr] = dateValue.split("-");
            const selectedYear = Number(yearStr);
            const selectedMonthName = monthNames[Number(monthStr) - 1]; // نحول "02" إلى "February"

            if (initialData) {
                await updateMonth(initialData.id, {
                    year: selectedYear,
                    month: selectedMonthName,
                    totalIncome: Number(income)
                });
            } else {
                await createMonth({
                    year: selectedYear,
                    month: selectedMonthName,
                    totalIncome: Number(income)
                });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Operation failed");
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <div className="modal-head">
                    <h3 className="modal-title">
                        {initialData ? "✏️ Edit Month" : "📅 Start New Month"}
                    </h3>
                    <button onClick={onClose} className="small-btn">✕</button>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '20px' }}>

                    {/* 👇 الحقل الجديد: يختار السنة والشهر معاً */}
                    <div className="auth-field">
                        <label className="muted small" style={{ marginBottom: '5px', display: 'block' }}>
                            Select Month & Year
                        </label>
                        <input
                            type="month"
                            className="auth-input"
                            value={dateValue}
                            onChange={(e) => setDateValue(e.target.value)}
                            required
                            // 👇 هذا هو السطر السحري
                            onClick={(e) => {
                                try {
                                    // هذه الدالة تجبر المتصفح على فتح التقويم فوراً عند الضغط
                                    e.currentTarget.showPicker();
                                } catch (err) {
                                    // في حال كان المتصفح قديماً جداً ولا يدعمها، لا تفعل شيئاً (سيعمل بشكل طبيعي)
                                }
                            }}
                            style={{
                                colorScheme: 'dark',
                                cursor: 'pointer'
                            }}
                        />
                    </div>

                    <div className="auth-field">
                        <label className="muted small" style={{ marginBottom: '5px', display: 'block' }}>Total Income</label>
                        <input
                            type="number"
                            className="auth-input"
                            placeholder="e.g. 25000"
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="button" onClick={onClose} className="btn ghost" style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn primary-btn" disabled={loading} style={{ flex: 1 }}>
                            {loading ? "Saving..." : (initialData ? "Update" : "Save")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}