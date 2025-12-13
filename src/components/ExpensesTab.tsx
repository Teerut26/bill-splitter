import { Plus, Trash2, DollarSign, X, Check, AlignJustify, Hash, Pencil } from 'lucide-react';
import { Button, Card, Input } from './ui';
import { formatMoney } from '../utils/formatMoney';
import type { Participant, Expense, NewExpense, Report } from '../types';

interface ExpensesTabProps {
  participants: Participant[];
  expenses: Expense[];
  newExpense: NewExpense;
  isExpenseFormOpen: boolean;
  editingExpenseId: number | null;
  report: Report;
  onSetIsExpenseFormOpen: (isOpen: boolean) => void;
  onToggleInvolvedInNewExpense: (id: number) => void;
  onSelectAllInvolved: () => void;
  onHandleCustomSplitChange: (id: number, val: string) => void;
  onUpdateNewExpense: (updates: Partial<NewExpense>) => void;
  onSubmitExpense: (formatMoney: (amount: number) => string) => boolean;
  onRemoveExpense: (id: number) => void;
  onStartEditExpense: (id: number) => void;
  onUpdateExpense: (formatMoney: (amount: number) => string) => boolean;
  onCancelEditExpense: () => void;
}

const ExpensesTab = ({
  participants,
  expenses,
  newExpense,
  isExpenseFormOpen,
  editingExpenseId,
  report,
  onSetIsExpenseFormOpen,
  onToggleInvolvedInNewExpense,
  onSelectAllInvolved,
  onHandleCustomSplitChange,
  onUpdateNewExpense,
  onSubmitExpense,
  onRemoveExpense,
  onStartEditExpense,
  onUpdateExpense,
  onCancelEditExpense,
}: ExpensesTabProps) => {
  const currentSplitSum = Object.values(newExpense.customSplits).reduce((a, b) => a + b, 0);
  const remainingToSplit = (parseFloat(newExpense.amount) || 0) - currentSplitSum;
  const isExactMode = newExpense.splitMode === 'exact';

  const isEditMode = editingExpenseId !== null;

  const handleRemoveExpense = (expense: Expense) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบรายการ "${expense.title}"?`)) {
      onRemoveExpense(expense.id);
    }
  };

  const handleSubmit = () => {
    if (isEditMode) {
      onUpdateExpense(formatMoney);
    } else {
      onSubmitExpense(formatMoney);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      onCancelEditExpense();
    } else {
      onSetIsExpenseFormOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Summary Header */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            ยอดรวมทั้งหมด
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-800 break-words">
            {formatMoney(report.totalTripCost)}
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            จำนวนรายการ
          </div>
          <div className="text-2xl font-bold text-blue-800">{expenses.length}</div>
        </div>
      </div>

      {/* Add Expense Button / Form */}
      {!isExpenseFormOpen ? (
        <Button 
          onClick={() => onSetIsExpenseFormOpen(true)} 
          className="w-full py-4 shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> เพิ่มรายการใหม่
        </Button>
      ) : (
        <Card className="p-4 border-2 border-blue-100 animate-slideDown">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700">
              {isEditMode ? 'แก้ไขรายการ' : 'รายการใหม่'}
            </h3>
            <button 
              onClick={handleCancel} 
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                ค่าอะไร?
              </label>
              <Input 
                placeholder="เช่น ค่าข้าว, ค่าแท็กซี่, ค่าโรงแรม" 
                value={newExpense.title}
                onChange={(e) => onUpdateNewExpense({ title: e.target.value })}
                autoFocus
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  เท่าไหร่?
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400">฿</span>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="pl-8 w-full px-3 py-2 border border-slate-300 rounded-lg"
                    value={newExpense.amount}
                    onChange={(e) => onUpdateNewExpense({ amount: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  ใครจ่าย?
                </label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  value={newExpense.payerId}
                  onChange={(e) => onUpdateNewExpense({ payerId: e.target.value })}
                >
                  <option value="">เลือก...</option>
                  {participants.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Split Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                หารกับใครบ้าง?
              </label>
              <div className="flex bg-slate-100 p-1 rounded-lg mb-3">
                <button
                  onClick={() => onUpdateNewExpense({ splitMode: 'equal' })}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                    !isExactMode 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <AlignJustify size={14} /> หารเท่า
                </button>
                <button
                  onClick={() => onUpdateNewExpense({ splitMode: 'exact' })}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                    isExactMode 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Hash size={14} /> หารไม่เท่า
                </button>
              </div>

              {/* Equal Split UI */}
              {!isExactMode && (
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs text-slate-400">เลือกคนที่ต้องการหาร</span>
                    <button 
                      onClick={onSelectAllInvolved}
                      className="text-xs text-blue-600 font-medium hover:underline"
                    >
                      เลือกทุกคน
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {participants.map(p => {
                      const isSelected = newExpense.involvedIds.includes(p.id);
                      return (
                        <div 
                          key={p.id}
                          onClick={() => onToggleInvolvedInNewExpense(p.id)}
                          className={`cursor-pointer px-3 py-2 rounded-lg border text-sm flex items-center justify-between transition-all ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {p.name}
                          {isSelected && <Check size={14} />}
                        </div>
                      );
                    })}
                  </div>
                  {newExpense.involvedIds.length === 0 && (
                    <p className="text-xs text-orange-500 mt-2">
                      * ถ้าไม่เลือกใครเลย จะถือว่าหารทุกคนครับ
                    </p>
                  )}
                </div>
              )}

              {/* Exact Split UI */}
              {isExactMode && (
                <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>ชื่อ</span>
                    <span>จำนวนเงิน</span>
                  </div>
                  {participants.map(p => (
                    <div key={p.id} className="flex items-center gap-2">
                      <label className="text-sm text-slate-700 w-24 truncate">
                        {p.name}
                      </label>
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-1.5 text-slate-400 text-xs">฿</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          className="w-full pl-6 pr-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                          value={newExpense.customSplits[p.id] || ''}
                          onChange={(e) => onHandleCustomSplitChange(p.id, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  <div className={`flex justify-between text-xs font-bold pt-2 border-t border-slate-200 mt-2 ${
                    Math.abs(remainingToSplit) < 0.05 ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    <span>เหลืออีก:</span>
                    <span>{formatMoney(remainingToSplit)}</span>
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleSubmit} className="w-full mt-2">
              {isEditMode ? 'บันทึกการแก้ไข' : 'บันทึก'}
            </Button>
          </div>
        </Card>
      )}

      {/* Expense List */}
      <div className="space-y-3">
        {expenses.length === 0 && !isExpenseFormOpen && (
          <div className="text-center py-10 text-slate-400">
            <DollarSign size={48} className="mx-auto mb-2 opacity-20" />
            <p>ยังไม่มีรายการค่าใช้จ่าย</p>
          </div>
        )}
        
        {[...expenses].reverse().map(expense => {
          const payer = participants.find(p => String(p.id) === String(expense.payerId));
          const isExact = expense.splitMode === 'exact';
          
          return (
            <div 
              key={expense.id} 
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center group"
            >
              <div>
                <h4 className="font-bold text-slate-800">{expense.title}</h4>
                <div className="text-xs text-slate-500 mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                    {payer ? payer.name : 'ไม่ระบุ'} จ่าย {formatMoney(expense.amount)}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>
                    {isExact 
                      ? 'หารไม่เท่ากัน' 
                      : `หาร ${expense.involvedIds.length === participants.length || expense.involvedIds.length === 0 ? 'ทุกคน' : `${expense.involvedIds.length} คน`}`
                    }
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">
                  {formatMoney(expense.amount)}
                </span>
                <button 
                  onClick={() => onStartEditExpense(expense.id)}
                  className="text-slate-400 hover:text-blue-500 transition-all"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={() => handleRemoveExpense(expense)}
                  className="text-slate-400 hover:text-red-500 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpensesTab;
