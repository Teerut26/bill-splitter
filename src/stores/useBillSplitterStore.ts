import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Expense, NewExpense, Report, Settlement, Session } from '../types';
import { exportTripToJson, importTripFromJson, openImportDialog } from '../utils/importExport';

const INITIAL_NEW_EXPENSE: NewExpense = {
  title: '',
  amount: '',
  payerId: '',
  involvedIds: [],
  splitMode: 'equal',
  customSplits: {}
};

const generateId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

interface BillSplitterState {
  // Persisted State - 1 Trip with multiple Sessions
  tripName: string;
  sessions: Session[];
  activeSessionId: string | null;
  
  // Non-persisted UI State
  newExpense: NewExpense;
  isExpenseFormOpen: boolean;

  // Trip Actions (single trip)
  setTripName: (name: string) => void;

  // Session Actions (CRUD for sessions within the trip)
  createSession: (name?: string) => string;
  deleteSession: (id: string) => void;
  selectSession: (id: string | null) => void;
  updateSessionName: (name: string) => void;
  
  // Participant actions (scoped to active session)
  addParticipant: () => void;
  updateParticipantName: (id: number, name: string) => void;
  removeParticipant: (id: number) => boolean;

  // Expense form actions (scoped to active session)
  setIsExpenseFormOpen: (isOpen: boolean) => void;
  toggleInvolvedInNewExpense: (id: number) => void;
  selectAllInvolved: () => void;
  handleCustomSplitChange: (id: number, val: string) => void;
  updateNewExpense: (updates: Partial<NewExpense>) => void;
  resetNewExpenseForm: () => void;
  submitExpense: (formatMoney: (amount: number) => string) => boolean;
  removeExpense: (id: number) => void;

  // Reset action
  resetTrip: () => void;

  // Import/Export actions
  exportTrip: () => void;
  importTrip: () => Promise<void>;
}

// Helper to get active session
const getActiveSession = (state: BillSplitterState): Session | undefined => {
  return state.sessions.find(s => s.id === state.activeSessionId);
};

// Helper to update active session
const updateActiveSession = (
  state: BillSplitterState, 
  updater: (session: Session) => Partial<Session>
): Session[] => {
  return state.sessions.map(s => 
    s.id === state.activeSessionId 
      ? { ...s, ...updater(s) } 
      : s
  );
};

export const useBillSplitterStore = create<BillSplitterState>()(
  persist(
    (set, get) => ({
      // Initial State - 1 fixed trip with empty sessions
      tripName: 'ทริปกาญจนบุรี',
      sessions: [],
      activeSessionId: null,
      newExpense: INITIAL_NEW_EXPENSE,
      isExpenseFormOpen: false,

      // Trip Actions
      setTripName: (name) => set({ tripName: name }),

      // Session Actions
      createSession: (name) => {
        const id = generateId();
        const newSession: Session = {
          id,
          name: name || `การหาร #${get().sessions.length + 1}`,
          createdAt: Date.now(),
          participants: [],
          expenses: []
        };
        set(state => ({ 
          sessions: [...state.sessions, newSession],
          activeSessionId: id 
        }));
        return id;
      },

      deleteSession: (id) => {
        set(state => ({
          sessions: state.sessions.filter(s => s.id !== id),
          activeSessionId: state.activeSessionId === id ? null : state.activeSessionId
        }));
      },

      selectSession: (id) => {
        set({ 
          activeSessionId: id,
          newExpense: INITIAL_NEW_EXPENSE,
          isExpenseFormOpen: false
        });
      },

      updateSessionName: (name) => {
        set(state => ({
          sessions: updateActiveSession(state, () => ({ name }))
        }));
      },

      // Participant Actions (scoped to active session)
      addParticipant: () => {
        const activeSession = getActiveSession(get());
        if (!activeSession) return;
        
        const newId = activeSession.participants.length > 0 
          ? Math.max(...activeSession.participants.map(p => p.id)) + 1 
          : 1;
        
        set(state => ({
          sessions: updateActiveSession(state, (s) => ({
            participants: [...s.participants, { id: newId, name: `เพื่อนคนที่ ${newId}` }]
          }))
        }));
      },

      updateParticipantName: (id, name) => {
        set(state => ({
          sessions: updateActiveSession(state, (s) => ({
            participants: s.participants.map(p => p.id === id ? { ...p, name } : p)
          }))
        }));
      },

      removeParticipant: (id) => {
        const activeSession = getActiveSession(get());
        if (!activeSession) return false;
        
        if (activeSession.expenses.some(e => 
          e.payerId === String(id) || 
          (e.involvedIds && e.involvedIds.includes(id)) || 
          (e.customSplits && e.customSplits[id] > 0)
        )) {
          return false;
        }
        
        set(state => ({
          sessions: updateActiveSession(state, (s) => ({
            participants: s.participants.filter(p => p.id !== id)
          }))
        }));
        return true;
      },

      // Expense Form Actions
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
        const activeSession = getActiveSession(get());
        if (!activeSession) return;
        
        const { newExpense } = get();
        set({ 
          newExpense: { 
            ...newExpense, 
            involvedIds: activeSession.participants.map(p => p.id) 
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
        const activeSession = getActiveSession(get());
        if (!activeSession) return false;
        
        const { newExpense } = get();
        
        if (!newExpense.title || !newExpense.amount || !newExpense.payerId) {
          alert("กรุณากรอกชื่อรายการ, จำนวนเงิน, และคนจ่ายให้ครบถ้วนครับ");
          return false;
        }
        
        const amountVal = parseFloat(newExpense.amount);
        const expenseData = { ...newExpense };

        if (expenseData.splitMode === 'exact') {
          const currentSum = Object.values(expenseData.customSplits).reduce((a, b) => a + b, 0);
          if (Math.abs(currentSum - amountVal) > 0.05) {
            alert(`ยอดรวมที่ระบุ (${formatMoney(currentSum)}) ไม่ตรงกับจำนวนเงินทั้งหมด (${formatMoney(amountVal)})`);
            return false;
          }
        } else {
          if (expenseData.involvedIds.length === 0) {
            expenseData.involvedIds = activeSession.participants.map(p => p.id);
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

        set(state => ({ 
          sessions: updateActiveSession(state, (s) => ({
            expenses: [...s.expenses, expense]
          })),
          newExpense: INITIAL_NEW_EXPENSE,
          isExpenseFormOpen: false
        }));
        return true;
      },

      removeExpense: (id) => {
        set(state => ({
          sessions: updateActiveSession(state, (s) => ({
            expenses: s.expenses.filter(e => e.id !== id)
          }))
        }));
      },

      resetTrip: () => {
        if (confirm('ต้องการรีเซ็ตทริปหรือไม่? ข้อมูลทั้งหมดจะถูกลบ')) {
          set({
            tripName: 'ทริปใหม่',
            sessions: [],
            activeSessionId: null,
            newExpense: INITIAL_NEW_EXPENSE,
            isExpenseFormOpen: false
          });
        }
      },

      exportTrip: () => {
        const { tripName, sessions } = get();
        exportTripToJson(tripName, sessions);
      },

      importTrip: async () => {
        const file = await openImportDialog();
        if (!file) return;

        try {
          const data = await importTripFromJson(file);
          
          if (confirm(`ต้องการนำเข้าข้อมูลจาก "${data.tripName}" หรือไม่? ข้อมูลปัจจุบันจะถูกแทนที่`)) {
            set({
              tripName: data.tripName,
              sessions: data.sessions,
              activeSessionId: null,
              newExpense: INITIAL_NEW_EXPENSE,
              isExpenseFormOpen: false
            });
            alert('นำเข้าข้อมูลสำเร็จ!');
          }
        } catch (error) {
          alert(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
        }
      },
    }),
    {
      name: 'bill-splitter-storage-v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tripName: state.tripName,
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
    }
  )
);

// Selector hooks for computed values
export const useActiveSession = (): Session | undefined => {
  const sessions = useBillSplitterStore(state => state.sessions);
  const activeSessionId = useBillSplitterStore(state => state.activeSessionId);
  return sessions.find(s => s.id === activeSessionId);
};

export const useReport = (): Report => {
  const activeSession = useActiveSession();
  const participants = activeSession?.participants || [];
  const expenses = activeSession?.expenses || [];

  const stats: Report['stats'] = {};
  
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

    const payerId = parseInt(e.payerId);
    if (stats[payerId]) {
      stats[payerId].paid += amount;
    }

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
