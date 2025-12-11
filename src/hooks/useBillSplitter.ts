import { useState, useMemo } from 'react';
import type { Participant, Expense, NewExpense, Report, Settlement } from '../types';

const INITIAL_PARTICIPANTS: Participant[] = [
  { id: 1, name: 'อลิซ' },
  { id: 2, name: 'บ๊อบ' },
  { id: 3, name: 'ชาลี' }
];

const INITIAL_NEW_EXPENSE: NewExpense = {
  title: '',
  amount: '',
  payerId: '',
  involvedIds: [],
  splitMode: 'equal',
  customSplits: {}
};

export const useBillSplitter = () => {
  // --- State ---
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState<NewExpense>(INITIAL_NEW_EXPENSE);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);

  // --- Participant Actions ---
  const addParticipant = () => {
    const newId = participants.length > 0 ? Math.max(...participants.map(p => p.id)) + 1 : 1;
    setParticipants([...participants, { id: newId, name: `เพื่อนคนที่ ${newId}` }]);
  };

  const updateParticipantName = (id: number, name: string) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, name } : p));
  };

  const removeParticipant = (id: number): boolean => {
    if (expenses.some(e => 
      e.payerId === String(id) || 
      (e.involvedIds && e.involvedIds.includes(id)) || 
      (e.customSplits && e.customSplits[id] > 0)
    )) {
      return false;
    }
    setParticipants(participants.filter(p => p.id !== id));
    return true;
  };

  // --- Expense Form Actions ---
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

  const updateNewExpense = (updates: Partial<NewExpense>) => {
    setNewExpense({ ...newExpense, ...updates });
  };

  const resetNewExpenseForm = () => {
    setNewExpense(INITIAL_NEW_EXPENSE);
    setIsExpenseFormOpen(false);
  };

  const submitExpense = (formatMoney: (amount: number) => string): boolean => {
    if (!newExpense.title || !newExpense.amount || !newExpense.payerId) {
      alert("กรุณากรอกชื่อรายการ, จำนวนเงิน, และคนจ่ายให้ครบถ้วนครับ");
      return false;
    }
    
    const amountVal = parseFloat(newExpense.amount);
    const expenseData = { ...newExpense };

    // Validation for Unequal Split
    if (expenseData.splitMode === 'exact') {
      const currentSum = Object.values(expenseData.customSplits).reduce((a, b) => a + b, 0);
      if (Math.abs(currentSum - amountVal) > 0.05) {
        alert(`ยอดรวมที่ระบุ (${formatMoney(currentSum)}) ไม่ตรงกับจำนวนเงินทั้งหมด (${formatMoney(amountVal)})`);
        return false;
      }
    } else {
      // Logic for Equal Split default selection
      if (expenseData.involvedIds.length === 0) {
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
    resetNewExpenseForm();
    return true;
  };

  const removeExpense = (id: number) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // --- Calculations ---
  const report = useMemo((): Report => {
    const stats: Report['stats'] = {};
    
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
        Object.entries(e.customSplits).forEach(([pid, splitVal]) => {
          const numPid = parseInt(pid);
          if (stats[numPid]) {
            stats[numPid].share += splitVal;
          }
        });
      } else {
        const splitAmong = (e.involvedIds && e.involvedIds.length > 0) 
          ? e.involvedIds 
          : participants.map(p => p.id);
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

  const settlements = useMemo((): Settlement[] => {
    const debtors: { id: number; name: string; paid: number; share: number; net: number }[] = [];
    const creditors: { id: number; name: string; paid: number; share: number; net: number }[] = [];

    Object.values(report.stats).forEach(p => {
      const net = Math.round(p.net * 100) / 100;
      if (net < -0.01) debtors.push({ ...p, net });
      if (net > 0.01) creditors.push({ ...p, net });
    });

    debtors.sort((a, b) => a.net - b.net);
    creditors.sort((a, b) => b.net - a.net);

    const moves: Settlement[] = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amount = Math.min(Math.abs(debtor.net), creditor.net);

      if (amount > 0.01) {
        moves.push({
          from: debtor.name,
          to: creditor.name,
          amount: amount
        });
      }

      debtor.net += amount;
      creditor.net -= amount;

      if (Math.abs(debtor.net) < 0.01) i++;
      if (creditor.net < 0.01) j++;
    }

    return moves;
  }, [report]);

  return {
    // State
    participants,
    expenses,
    newExpense,
    isExpenseFormOpen,
    report,
    settlements,

    // Participant actions
    addParticipant,
    updateParticipantName,
    removeParticipant,

    // Expense form actions
    setIsExpenseFormOpen,
    toggleInvolvedInNewExpense,
    selectAllInvolved,
    handleCustomSplitChange,
    updateNewExpense,
    submitExpense,
    removeExpense,
  };
};
