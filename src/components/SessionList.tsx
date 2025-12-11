import { Plus, Users, DollarSign, Calendar } from 'lucide-react';
import { Button } from './ui';
import SessionCard from './SessionCard';
import type { Session } from '../types';

interface SessionListProps {
  sessions: Session[];
  onCreateSession: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

const SessionList = ({
  sessions,
  onCreateSession,
  onSelectSession,
  onDeleteSession,
}: SessionListProps) => {
  const sortedSessions = [...sessions].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 p-2 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Equality<span className="text-blue-200">Split</span></h2>
            <p className="text-blue-100 text-sm">จัดการทริปทั้งหมดของคุณ</p>
          </div>
        </div>
        <div className="flex gap-4 mt-4 text-sm">
          <div className="bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Calendar size={14} />
            <span>{sessions.length} ทริป</span>
          </div>
        </div>
      </div>

      {/* Create New Session Button */}
      <Button 
        onClick={onCreateSession} 
        className="w-full py-4 shadow-lg shadow-blue-200"
      >
        <Plus size={20} /> สร้างทริปใหม่
      </Button>

      {/* Session List */}
      {sessions.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Users size={64} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">ยังไม่มีทริป</p>
          <p className="text-sm">กดปุ่มด้านบนเพื่อสร้างทริปใหม่</p>
        </div>
      ) : (
        <div className="space-y-3">
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
