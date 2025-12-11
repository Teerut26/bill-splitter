// --- Types ---

export interface Participant {
  id: number;
  name: string;
}

export interface Expense {
  id: number;
  title: string;
  payerId: string;
  amount: number;
  involvedIds: number[];
  splitMode: 'equal' | 'exact';
  customSplits: Record<number, number>;
}

export interface NewExpense {
  title: string;
  amount: string;
  payerId: string;
  involvedIds: number[];
  splitMode: 'equal' | 'exact';
  customSplits: Record<number, number>;
}

export interface PersonStats {
  id: number;
  name: string;
  paid: number;
  share: number;
  net: number;
}

export interface Report {
  stats: Record<number, PersonStats>;
  totalTripCost: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

// --- Session Types ---

/**
 * Session = หนึ่งครั้งของการหารเงิน (เช่น มื้อเช้า, ค่าโรงแรม, ค่าแท็กซี่)
 * แต่ละ session มี participants และ expenses ของตัวเอง
 */
export interface Session {
  id: string;
  name: string;
  createdAt: number;
  participants: Participant[];
  expenses: Expense[];
  paidSettlements: string[]; // Array of settlement keys: "from->to->amount"
}

/**
 * Trip = ทริปหลัก (มีแค่ 1 ทริป ไม่สามารถสร้างเพิ่ม)
 * ประกอบด้วยหลาย sessions
 */
export interface Trip {
  name: string;
  sessions: Session[];
}

// --- View Types ---

export type TabType = 'people' | 'expenses' | 'report';
export type ViewType = 'sessions' | 'session-detail';
