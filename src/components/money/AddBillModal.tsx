import { useState, useEffect } from "react";
import { useMoneyManager } from "../../hooks/useMoneyManager";
import type { Bill } from "../../types/money";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    financialMonthId: number;
    initialData?: Bill | null;
}

export function AddBillModal({ isOpen, onClose, onSuccess, financialMonthId, initialData }: Props) {
    const { addBill, updateBill, loading } = useMoneyManager();
    
    const [type, setType] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("#60a5fa");
    const [error, setError] = useState("");

    const defaultColors = ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#c084fc', '#f87171', '#2dd4bf'];
    
    useEffect(() => {
        if (initialData) {
            setType(initialData.type);
            setAmount(initialData.amount.toString());
            setDescription(initialData.description || "");
            setColor(initialData.color || "#60a5fa"); // 👈 جلب اللون لو كان موجود بتعديل الفاتورة
        } else {
            setType("");
            setAmount("");
            setDescription("");
            // 👈 إعطاء لون عشوائي للفاتورة الجديدة كقيمة افتراضية
            setColor(defaultColors[Math.floor(Math.random() * defaultColors.length)]);
        }
        setError("");
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // 1. تنظيف النص
        const cleanType = type.trim();
        const cleanDescription = description.trim();

        // 2. التحقق من الطول
        if (cleanType.length < 2 || cleanType.length > 30) {
            setError("Category name must be between 2 and 30 characters.");
            return;
        }

        // 3. التحقق من الرموز (نفس الـ Regex الموجود في الباك إند)
        // يقبل فقط: أحرف إنجليزية، أحرف عربية، أرقام، ومسافات. يمنع الرموز الخبيثة.
        const isValidCategory = /^[\w\s\u0600-\u06FF]+$/.test(cleanType);
        if (!isValidCategory) {
            setError("Invalid characters! Please use only letters and numbers (e.g., Food, Gym).");
            return;
        }

        try {
            const billData = {
                financialMonthId,
                type: cleanType,
                amount: Number(amount),
                description: cleanDescription,
                color // 👈 إرسال اللون الجديد مع البيانات
            };

            if (initialData) {
                await updateBill(initialData.id, billData);
            } else {
                await addBill(billData);
            }
            
            onSuccess();
            onClose();
        } catch (err: any) {
            // إذا أفلت الخطأ من الفرونت إند ورفضه الباك إند
            setError(err.message || "Operation failed. Please check your inputs.");
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <div className="modal-head">
                    <h3 className="modal-title">{initialData ? "✏️ Edit Expense" : "💸 Add Expense"}</h3>
                    <button type="button" onClick={onClose} className="small-btn">✕</button>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '20px' }}>
                    
                    {/* 👇 دمجنا الاسم واللون ليكونوا متجاورين بدون تخريب التنسيق */}
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div className="auth-field" style={{ flex: '1' }}>
                            {/* أيقونة المساعدة بجانب الـ Label محفوظة كما هي */}
                            <label className="muted small" style={{ marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Category Name
                                <span 
                                    title="Suggestions: Food, Home, Car, Shopping, Gym, Health, Bills, Internet" 
                                    style={{ 
                                        cursor: 'help', 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        width: '16px', 
                                        height: '16px', 
                                        borderRadius: '50%', 
                                        background: 'rgba(255,255,255,0.15)', 
                                        fontSize: '11px', 
                                        color: '#fff',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ?
                                </span>
                            </label>
                            <input 
                                type="text" 
                                className="auth-input" 
                                placeholder="e.g. Groceries, Gym"
                                value={type} 
                                onChange={(e) => setType(e.target.value)} 
                                maxLength={30} 
                                required 
                            />
                        </div>

                        {/* 👇 حقل اختيار اللون الجديد */}
                        <div className="auth-field" style={{ width: '60px' }}>
                            <label className="muted small" style={{ marginBottom: '5px', display: 'block' }}>Color</label>
                            <input 
                                type="color" 
                                className="auth-input" 
                                value={color} 
                                onChange={(e) => setColor(e.target.value)} 
                                style={{ padding: '0', height: '42px', cursor: 'pointer', borderRadius: '8px', border: 'none' }}
                                title="Choose a color"
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label className="muted small" style={{ marginBottom: '5px', display: 'block' }}>Amount (kr)</label>
                        <input 
                            type="number" 
                            className="auth-input" 
                            placeholder="e.g. 500"
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="auth-field">
                        <label className="muted small" style={{ marginBottom: '5px', display: 'block' }}>Description (Optional)</label>
                        <input 
                            type="text" 
                            className="auth-input" 
                            placeholder="e.g. Weekly shopping"
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            maxLength={150} 
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="button" onClick={onClose} className="btn ghost" style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" className="btn primary-btn" disabled={loading} style={{ flex: 1 }}>
                            {loading ? "Processing..." : (initialData ? "Update Bill" : "Add Bill")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}