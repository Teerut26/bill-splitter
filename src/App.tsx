import { useState, useMemo } from 'react';
import { Plus, Trash2, DollarSign, Users, ArrowRight, PieChart, Check, X, RefreshCw, AlignJustify, Hash } from 'lucide-react';

// --- Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = "primary", className = "", disabled = false }: { 
  onClick?: () => void; 
  children: React.ReactNode; 
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost"; 
  className?: string; 
  disabled?: boolean 
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 disabled:opacity-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50"
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    {...props}
  />
);

// --- Types ---

interface Participant {
  id: number;
  name: string;
}

interface Expense {
  id: number;
  title: string;
  payerId: string;
  amount: number;
  involvedIds: number[];
  splitMode: 'equal' | 'exact';
  customSplits: Record<number, number>;
}

interface NewExpense {
  title: string;
  amount: string;
  payerId: string;
  involvedIds: number[];
  splitMode: 'equal' | 'exact';
  customSplits: Record<number, number>;
}

// --- Main Application ---

export default function EqualityApp() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'people' | 'expenses' | 'report'>('people');
  const [eventName, setEventName] = useState('ทริปกาญจนบุรี');
  
  // Participants: { id, name }
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 1, name: 'อลิซ' },
    { id: 2, name: 'บ๊อบ' },
    { id: 3, name: 'ชาลี' }
  ]);

  // Expenses: { id, title, payerId, amount, involvedIds: [], splitMode: 'equal'|'exact', customSplits: {} }
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // New Expense Form State
  const [newExpense, setNewExpense] = useState<NewExpense>({
    title: '',
    amount: '',
    payerId: '',
    involvedIds: [], // Used for 'equal' mode
    splitMode: 'equal', // 'equal' or 'exact'
    customSplits: {} // { id: amount } used for 'exact' mode
  });

  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);

  // --- Helpers ---

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);
  };

  // --- Handlers ---

  const addParticipant = () => {
    const newId = participants.length > 0 ? Math.max(...participants.map(p => p.id)) + 1 : 1;
    setParticipants([...participants, { id: newId, name: `เพื่อนคนที่ ${newId}` }]);
  };

  const updateParticipantName = (id: number, name: string) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, name } : p));
  };

  const removeParticipant = (id: number) => {
    if (expenses.some(e => e.payerId === String(id) || (e.involvedIds && e.involvedIds.includes(id)) || (e.customSplits && e.customSplits[id] > 0))) {
      alert("ไม่สามารถลบคนนี้ได้เนื่องจากมีรายชื่ออยู่ในรายการค่าใช้จ่าย กรุณาลบรายการค่าใช้จ่ายที่เกี่ยวข้องก่อนครับ");
      return;
    }
    setParticipants(participants.filter(p => p.id !== id));
  };

  const toggleInvolvedInNewExpense = (id: number) => {
    const currentList = newExpense.involvedIds;
    if (currentList.includes(id)) {
      setNewExpense({ ...newExpense, involvedIds: currentList.filter(pid => pid !== id) });
    } else {
      setNewExpense({ ...newExpense, involvedIds: [...currentList, id] });
    }
  };

  const selectAllInvolved = () => {
    setNewExpense({ ...newExpense, involvedIds: participants.map(p => p.id) });
  };

  const handleCustomSplitChange = (id: number, val: string) => {
    const numVal = parseFloat(val) || 0;
    setNewExpense({
      ...newExpense,
      customSplits: {
        ...newExpense.customSplits,
        [id]: numVal
      }
    });
  };

  const submitExpense = () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.payerId) {
      alert("กรุณากรอกชื่อรายการ, จำนวนเงิน, และคนจ่ายให้ครบถ้วนครับ");
      return;
    }
    
    const amountVal = parseFloat(newExpense.amount);
    const expenseData = { ...newExpense };

    // Validation for Unequal Split
    if (expenseData.splitMode === 'exact') {
      const currentSum = Object.values(expenseData.customSplits).reduce((a, b) => a + b, 0);
      if (Math.abs(currentSum - amountVal) > 0.05) {
        alert(`ยอดรวมที่ระบุ (${formatMoney(currentSum)}) ไม่ตรงกับจำนวนเงินทั้งหมด (${formatMoney(amountVal)})`);
        return;
      }
    } else {
      // Logic for Equal Split default selection
      if (expenseData.involvedIds.length === 0) {
        // If visually no one selected in equal mode, implies everyone
        expenseData.involvedIds = participants.map(p => p.id);
      }
    }

    const expense: Expense = {
      id: Date.now(),
      title: expenseData.title,
      amount: amountVal,
      payerId: expenseData.payerId,
      involvedIds: expenseData.splitMode === 'equal' ? expenseData.involvedIds : [],
      splitMode: expenseData.splitMode,
      customSplits: expenseData.splitMode === 'exact' ? expenseData.customSplits : {}
    };

    setExpenses([...expenses, expense]);
    setNewExpense({ 
      title: '', 
      amount: '', 
      payerId: '', 
      involvedIds: [], 
      splitMode: 'equal', 
      customSplits: {} 
    });
    setIsExpenseFormOpen(false);
  };

  const removeExpense = (id: number) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // --- Calculations ---

  const report = useMemo(() => {
    const stats: Record<number, { id: number; name: string; paid: number; share: number; net: number }> = {};
    
    // Initialize
    participants.forEach(p => {
      stats[p.id] = { 
        id: p.id, 
        name: p.name, 
        paid: 0, 
        share: 0, 
        net: 0 
      };
    });

    let totalTripCost = 0;

    expenses.forEach(e => {
      const amount = e.amount;
      totalTripCost += amount;

      // Add to payer's paid total
      const payerId = parseInt(e.payerId);
      if (stats[payerId]) {
        stats[payerId].paid += amount;
      }

      // Calculate Split
      if (e.splitMode === 'exact' && e.customSplits) {
        // Exact amounts logic
        Object.entries(e.customSplits).forEach(([pid, splitVal]) => {
           const numPid = parseInt(pid);
           if (stats[numPid]) {
             stats[numPid].share += splitVal;
           }
        });
      } else {
        // Equal split logic
        const splitAmong = (e.involvedIds && e.involvedIds.length > 0) ? e.involvedIds : participants.map(p => p.id);
        const splitAmount = amount / splitAmong.length;
        splitAmong.forEach(pid => {
          if (stats[pid]) {
            stats[pid].share += splitAmount;
          }
        });
      }
    });

    // Calculate Net
    Object.values(stats).forEach(person => {
      person.net = person.paid - person.share;
    });

    return { stats, totalTripCost };
  }, [participants, expenses]);

  const settlements = useMemo(() => {
    const debtors: { id: number; name: string; paid: number; share: number; net: number }[] = [];
    const creditors: { id: number; name: string; paid: number; share: number; net: number }[] = [];

    Object.values(report.stats).forEach(p => {
      // Fix floating point epsilon errors
      const net = Math.round(p.net * 100) / 100;
      if (net < -0.01) debtors.push({ ...p, net });
      if (net > 0.01) creditors.push({ ...p, net });
    });

    debtors.sort((a, b) => a.net - b.net); // Ascending (most negative first)
    creditors.sort((a, b) => b.net - a.net); // Descending (most positive first)

    const moves: { from: string; to: string; amount: number }[] = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      // The amount to settle is the minimum of what debtor owes and what creditor is owed
      const amount = Math.min(Math.abs(debtor.net), creditor.net);

      // Add settlement
      if (amount > 0.01) {
        moves.push({
          from: debtor.name,
          to: creditor.name,
          amount: amount
        });
      }

      // Adjust remaining balances
      debtor.net += amount;
      creditor.net -= amount;

      // Move indices if settled
      if (Math.abs(debtor.net) < 0.01) i++;
      if (creditor.net < 0.01) j++;
    }

    return moves;
  }, [report]);

  // --- Render Sections ---

  const renderPeopleTab = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
        <h3 className="text-blue-800 font-medium mb-2 flex items-center gap-2">
          <Users size={18} />
          ขั้นตอนที่ 1: ใครไปบ้าง?
        </h3>
        <p className="text-sm text-blue-600">เพิ่มชื่อเพื่อนๆ ทุกคนที่จะหารเงินในทริปนี้ก่อนเริ่มจดรายการจ่ายครับ</p>
      </div>

      <div className="grid gap-3">
        {participants.map((p) => (
          <div key={p.id} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-slate-200">
            <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm">
              {p.name.charAt(0).toUpperCase()}
            </div>
            <Input 
              value={p.name} 
              onChange={(e) => updateParticipantName(p.id, e.target.value)}
              placeholder="ชื่อ"
            />
            <button 
              onClick={() => removeParticipant(p.id)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      
      <Button onClick={addParticipant} variant="secondary" className="w-full border-dashed border-2">
        <Plus size={18} /> เพิ่มชื่อคน
      </Button>

      <div className="mt-8 flex justify-end">
         <Button onClick={() => setActiveTab('expenses')} className="w-full sm:w-auto">
            ถัดไป: จดรายการจ่าย <ArrowRight size={18} />
         </Button>
      </div>
    </div>
  );

  const renderExpensesTab = () => {
    // Helpers for form
    const currentSplitSum = Object.values(newExpense.customSplits).reduce((a, b) => a + b, 0);
    const remainingToSplit = (parseFloat(newExpense.amount) || 0) - currentSplitSum;
    const isExactMode = newExpense.splitMode === 'exact';

    return (
    <div className="space-y-6 animate-fadeIn">
      {/* Summary Header */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">ยอดรวมทั้งหมด</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-800 break-words">{formatMoney(report.totalTripCost)}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">จำนวนรายการ</div>
          <div className="text-2xl font-bold text-blue-800">{expenses.length}</div>
        </div>
      </div>

      {/* Add Expense Button / Form */}
      {!isExpenseFormOpen ? (
        <Button onClick={() => setIsExpenseFormOpen(true)} className="w-full py-4 shadow-lg shadow-blue-200">
          <Plus size={20} /> เพิ่มรายการใหม่
        </Button>
      ) : (
        <Card className="p-4 border-2 border-blue-100 animate-slideDown">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700">รายการใหม่</h3>
            <button onClick={() => setIsExpenseFormOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ค่าอะไร?</label>
              <Input 
                placeholder="เช่น ค่าข้าว, ค่าแท็กซี่, ค่าโรงแรม" 
                value={newExpense.title}
                onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                autoFocus
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">เท่าไหร่?</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400">฿</span>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="pl-8 w-full px-3 py-2 border border-slate-300 rounded-lg"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ใครจ่าย?</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  value={newExpense.payerId}
                  onChange={(e) => setNewExpense({...newExpense, payerId: e.target.value})}
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
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">หารกับใครบ้าง?</label>
              <div className="flex bg-slate-100 p-1 rounded-lg mb-3">
                <button
                  onClick={() => setNewExpense({...newExpense, splitMode: 'equal'})}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                    !isExactMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <AlignJustify size={14} /> หารเท่า
                </button>
                <button
                  onClick={() => setNewExpense({...newExpense, splitMode: 'exact'})}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                    isExactMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
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
                      onClick={selectAllInvolved}
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
                          onClick={() => toggleInvolvedInNewExpense(p.id)}
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
                    <p className="text-xs text-orange-500 mt-2">* ถ้าไม่เลือกใครเลย จะถือว่าหารทุกคนครับ</p>
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
                      <label className="text-sm text-slate-700 w-24 truncate">{p.name}</label>
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-1.5 text-slate-400 text-xs">฿</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          className="w-full pl-6 pr-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                          value={newExpense.customSplits[p.id] || ''}
                          onChange={(e) => handleCustomSplitChange(p.id, e.target.value)}
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

            <Button onClick={submitExpense} className="w-full mt-2">
              บันทึก
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
            <div key={expense.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center group">
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
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-700">{formatMoney(expense.amount)}</span>
                <button 
                  onClick={() => removeExpense(expense.id)}
                  className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
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

  const renderReportTab = () => (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Balances Card */}
      <Card className="p-0">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <PieChart size={18} /> ยอดคงเหลือ
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">ชื่อ</th>
                <th className="px-6 py-3 text-right">จ่ายไป</th>
                <th className="px-6 py-3 text-right">ส่วนที่ต้องออก</th>
                <th className="px-6 py-3 text-right">สุทธิ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {participants.map(p => {
                const stat = report.stats[p.id];
                const isPositive = stat.net > 0;
                const isNegative = stat.net < 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-700">{p.name}</td>
                    <td className="px-6 py-4 text-right text-slate-500">{formatMoney(stat.paid)}</td>
                    <td className="px-6 py-4 text-right text-slate-500">{formatMoney(stat.share)}</td>
                    <td className={`px-6 py-4 text-right font-bold ${
                      isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-slate-400'
                    }`}>
                      {stat.net > 0 ? '+' : ''}{formatMoney(stat.net)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Settlement Plan */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
          <RefreshCw size={20} className="text-blue-500" />
          แผนการเคลียร์เงิน
        </h3>
        
        {settlements.length === 0 ? (
          <div className="bg-emerald-50 text-emerald-700 p-6 rounded-xl border border-emerald-100 text-center">
            <Check size={32} className="mx-auto mb-2 opacity-50" />
            <p className="font-medium">เคลียร์ครบหมดแล้ว! ไม่มีใครติดเงินใคร</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {settlements.map((move, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-red-500">{move.from}</span>
                    <span className="text-xs text-slate-400">จ่ายให้</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-300" />
                  <div className="flex flex-col text-right sm:text-left">
                    <span className="font-bold text-emerald-600">{move.to}</span>
                    <span className="text-xs text-slate-400">รับเงินจาก</span>
                  </div>
                </div>
                <div className="font-mono font-bold text-lg text-slate-700">
                  {formatMoney(move.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-1">
             <div className="bg-blue-600 text-white p-1.5 rounded-lg">
               <DollarSign size={16} strokeWidth={3} />
             </div>
             <h1 className="font-bold text-xl tracking-tight text-slate-800">Equality<span className="text-blue-600">Split</span></h1>
          </div>
          <Input 
             value={eventName}
             onChange={(e) => setEventName(e.target.value)}
             className="text-sm border-none bg-transparent p-0 font-medium text-slate-500 focus:ring-0 placeholder-slate-400 w-full"
             placeholder="ตั้งชื่อทริป..."
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 py-6">
        {activeTab === 'people' && renderPeopleTab()}
        {activeTab === 'expenses' && renderExpensesTab()}
        {activeTab === 'report' && renderReportTab()}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-2xl safe-area-pb">
        <div className="max-w-xl mx-auto flex justify-around p-2">
          <NavButton 
            active={activeTab === 'people'} 
            onClick={() => setActiveTab('people')} 
            icon={<Users size={20} />} 
            label="สมาชิก" 
          />
          <NavButton 
            active={activeTab === 'expenses'} 
            onClick={() => setActiveTab('expenses')} 
            icon={<DollarSign size={20} />} 
            label="จดรายการ" 
          />
          <NavButton 
            active={activeTab === 'report'} 
            onClick={() => setActiveTab('report')} 
            icon={<PieChart size={20} />} 
            label="สรุปผล" 
          />
        </div>
      </nav>

      {/* Styles for animations */}
      <style>{`
        .safe-area-pb { padding-bottom: env(safe-area-inset-bottom); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.2s ease-out; }
      `}</style>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-2 px-1 rounded-xl transition-all ${
      active ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium mt-1">{label}</span>
  </button>
);