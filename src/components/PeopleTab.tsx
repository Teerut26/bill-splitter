import { Plus, Trash2, Users, ArrowRight } from 'lucide-react';
import { Button, Input } from './ui';
import type { Participant, TabType } from '../types';

interface PeopleTabProps {
  participants: Participant[];
  onAddParticipant: () => void;
  onUpdateParticipantName: (id: number, name: string) => void;
  onRemoveParticipant: (id: number) => boolean;
  onTabChange: (tab: TabType) => void;
}

const PeopleTab = ({
  participants,
  onAddParticipant,
  onUpdateParticipantName,
  onRemoveParticipant,
  onTabChange,
}: PeopleTabProps) => {
  const handleRemove = (id: number) => {
    const success = onRemoveParticipant(id);
    if (!success) {
      alert("ไม่สามารถลบคนนี้ได้เนื่องจากมีรายชื่ออยู่ในรายการค่าใช้จ่าย กรุณาลบรายการค่าใช้จ่ายที่เกี่ยวข้องก่อนครับ");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
        <h3 className="text-blue-800 font-medium mb-2 flex items-center gap-2">
          <Users size={18} />
          ขั้นตอนที่ 1: ใครไปบ้าง?
        </h3>
        <p className="text-sm text-blue-600">
          เพิ่มชื่อเพื่อนๆ ทุกคนที่จะหารเงินในทริปนี้ก่อนเริ่มจดรายการจ่ายครับ
        </p>
      </div>

      <div className="grid gap-3">
        {participants.map((p) => (
          <div 
            key={p.id} 
            className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-slate-200"
          >
            <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm">
              {p.name.charAt(0).toUpperCase()}
            </div>
            <Input 
              value={p.name} 
              onChange={(e) => onUpdateParticipantName(p.id, e.target.value)}
              placeholder="ชื่อ"
            />
            <button 
              onClick={() => handleRemove(p.id)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      
      <Button 
        onClick={onAddParticipant} 
        variant="secondary" 
        className="w-full border-dashed border-2"
      >
        <Plus size={18} /> เพิ่มชื่อคน
      </Button>

      <div className="mt-8 flex justify-end">
        <Button 
          onClick={() => onTabChange('expenses')} 
          className="w-full sm:w-auto"
        >
          ถัดไป: จดรายการจ่าย <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
};

export default PeopleTab;
