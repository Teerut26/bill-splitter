import { Trash2, Users, DollarSign, ChevronRight } from 'lucide-react';
import { formatMoney } from '../utils/formatMoney';
import type { Session } from '../types';

interface SessionCardProps {
  session: Session;
  onSelect: () => void;
  onDelete: () => void;
}

const SessionCard = ({ session, onSelect, onDelete }: SessionCardProps) => {
  const totalAmount = session.expenses.reduce((sum, e) => sum + e.amount, 0);
  const createdDate = new Date(session.createdAt).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`ต้องการลบทริป "${session.name}" หรือไม่?`)) {
      onDelete();
    }
  };

  return (
    <div 
      onClick={onSelect}
      className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
            {session.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{createdDate}</p>
          
          <div className="flex gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
              <Users size={12} />
              {session.participants.length} คน
            </span>
            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
              <DollarSign size={12} />
              {session.expenses.length} รายการ
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">ยอดรวม</div>
            <div className="font-bold text-slate-700">{formatMoney(totalAmount)}</div>
          </div>
          
          <button 
            onClick={handleDelete}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <Trash2 size={16} />
          </button>
          
          <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
