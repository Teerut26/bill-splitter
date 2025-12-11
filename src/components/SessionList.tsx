import { Plus, Users, DollarSign, Layers } from 'lucide-react';
import { Button, Input } from './ui';
import SessionCard from './SessionCard';
import type { Session } from '../types';

interface SessionListProps {
  tripName: string;
  sessions: Session[];
  onTripNameChange: (name: string) => void;
  onCreateSession: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

const SessionList = ({
  tripName,
  sessions,
  onTripNameChange,
  onCreateSession,
  onSelectSession,
  onDeleteSession,
}: SessionListProps) => {
  const sortedSessions = [...sessions].sort((a, b) => b.createdAt - a.createdAt);
  const totalAmount = sessions.reduce(
    (sum, s) => sum + s.expenses.reduce((eSum, e) => eSum + e.amount, 0),
    0
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Trip Header - Fixed, cannot create new trips */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div className="flex-1">
            <Input 
              value={tripName}
              onChange={(e) => onTripNameChange(e.target.value)}
              className="text-xl font-bold bg-transparent border-none p-0 text-white placeholder-white/60 focus:ring-0 w-full"
              placeholder="ชื่อทริป..."
            />
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Layers size={14} />
            <span>{sessions.length} การหาร</span>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <DollarSign size={14} />
            <span>รวม ฿{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Create New Session Button */}
      <Button 
        onClick={onCreateSession} 
        className="w-full py-4 shadow-lg shadow-blue-200"
      >
        <Plus size={20} /> สร้างการหารใหม่
      </Button>

      {/* Session List */}
      {sessions.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Users size={64} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">ยังไม่มีการหาร</p>
          <p className="text-sm">กดปุ่มด้านบนเพื่อสร้างการหารใหม่</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            รายการการหารทั้งหมด
          </h3>
          {sortedSessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              onSelect={() => onSelectSession(session.id)}
              onDelete={() => onDeleteSession(session.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionList;
