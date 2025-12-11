import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Participant, Expense, NewExpense, Report, Settlement } from '../types';

const INITIAL_NEW_EXPENSE: NewExpense = {
  title: '',
  amount: '',
  payerId: '',
  involvedIds: [],
  splitMode: 'equal',
  customSplits: {}
};

interface BillSplitterState {
  // Persisted State
  eventName: string;
  participants: Participant[];
  expenses: Expense[];
  
  // Non-persisted UI State
  newExpense: NewExpense;
  isExpenseFormOpen: boolean;

  // Actions
  setEventName: (name: string) => void;
  
  // Participant actions
  addParticipant: () => void;
  updateParticipantName: (id: number, name: string) => void;
  removeParticipant: (id: number) => boolean;

  // Expense form actions
  setIsExpenseFormOpen: (isOpen: boolean) => void;
  toggleInvolvedInNewExpense: (id: number) => void;
  selectAllInvolved: () => void;
  handleCustomSplitChange: (id: number, val: string) => void;
  updateNewExpense: (updates: Partial<NewExpense>) => void;
  resetNewExpenseForm: () => void;
  submitExpense: (formatMoney: (amount: number) => string) => boolean;
  removeExpense: (id: number) => void;

  // Reset action
  resetAll: () => void;
}

export const useBillSplitterStore = create<BillSplitterState>()(
  persist(
    (set, get) => ({
      // Initial State
      eventName: 'ทริปกาญจนบุรี',
      participants: [
        { id: 1, name: 'อลิซ' },
        { id: 2, name: 'บ๊อบ' },
        { id: 3, name: 'ชาลี' }
      ],
      expenses: [],
      newExpense: INITIAL_NEW_EXPENSE,
      isExpenseFormOpen: false,

      // Actions
      setEventName: (name) => set({ eventName: name }),

      addParticipant: () => {
        const { participants } = get();
        const newId = participants.length > 0 
          ? Math.max(...participants.map(p => p.id)) + 1 
          : 1;
        set({ 
          participants: [...participants, { id: newId, name: `เพื่อนคนที่ ${newId}` }] 
        });
      },

      updateParticipantName: (id, name) => {
        const { participants } = get();
        set({ 
          participants: participants.map(p => p.id === id ? { ...p, name } : p) 
        });
      },

      removeParticipant: (id) => {
        const { participants, expenses } = get();
        if (expenses.some(e => 
          e.payerId === String(id) || 
          (e.involvedIds && e.involvedIds.includes(id)) || 
          (e.customSplits && e.customSplits[id] > 0)
        )) {
          return false;
        }
        set({ participants: participants.filter(p => p.id !== id) });
        return true;
      },

      setIsExpenseFormOpen: (isOpen) => set({ isExpenseFormOpen: isOpen }),

      toggleInvolvedInNewExpense: (id) => {
        const { newExpense } = get();
        const currentList = newExpense.involvedIds;
        if (currentList.includes(id)) {
          set({ 
            newExpense: { 
              ...newExpense, 
              involvedIds: currentList.filter(pid => pid !== id) 
            } 
          });
        } else {
          set({ 
            newExpense: { 
              ...newExpense, 
              involvedIds: [...currentList, id] 
            } 
          });
        }
      },

      selectAllInvolved: () => {
        const { newExpense, participants } = get();
        set({ 
          newExpense: { 
            ...newExpense, 
            involvedIds: participants.map(p => p.id) 
          } 
        });
      },

      handleCustomSplitChange: (id, val) => {
        const { newExpense } = get();
        const numVal = parseFloat(val) || 0;
        set({
          newExpense: {
            ...newExpense,
            customSplits: {
              ...newExpense.customSplits,
              [id]: numVal
            }
          }
        });
      },

      updateNewExpense: (updates) => {
        const { newExpense } = get();
        set({ newExpense: { ...newExpense, ...updates } });
      },

      resetNewExpenseForm: () => {
        set({ 
          newExpense: INITIAL_NEW_EXPENSE, 
          isExpenseFormOpen: false 
        });
      },

      submitExpense: (formatMoney) => {
        const { newExpense, expenses, participants } = get();
        
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

        set({ 
          expenses: [...expenses, expense],
          newExpense: INITIAL_NEW_EXPENSE,
          isExpenseFormOpen: false
        });
        return true;
      },

      removeExpense: (id) => {
        const { expenses } = get();
        set({ expenses: expenses.filter(e => e.id !== id) });
      },

      resetAll: () => {
        set({
          eventName: 'ทริปใหม่',
          participants: [],
          expenses: [],
          newExpense: INITIAL_NEW_EXPENSE,
          isExpenseFormOpen: false
        });
      }
    }),
    {
      name: 'bill-splitter-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        eventName: state.eventName,
        participants: state.participants,
        expenses: state.expenses,
      }),
    }
  )
);

// Selector hooks for computed values
export const useReport = (): Report => {
  const participants = useBillSplitterStore(state => state.participants);
  const expenses = useBillSplitterStore(state => state.expenses);

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
};

export const useSettlements = (): Settlement[] => {
  const report = useReport();

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
};
