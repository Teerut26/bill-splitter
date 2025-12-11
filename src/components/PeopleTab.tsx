import { Plus, Trash2, Users, ArrowRight, UserPlus } from 'lucide-react';
import { Button, Input } from './ui';
import type { Participant, TabType } from '../types';
import { useState } from 'react';

interface PeopleTabProps {
  participants: Participant[];
  participantsFromOtherSessions: Participant[];
  onAddParticipant: () => void;
  onAddExistingParticipant: (participant: Participant) => void;
  onUpdateParticipantName: (id: number, name: string) => void;
  onRemoveParticipant: (id: number) => boolean;
  onTabChange: (tab: TabType) => void;
}

const PeopleTab = ({
  participants,
  participantsFromOtherSessions,
  onAddParticipant,
  onAddExistingParticipant,
  onUpdateParticipantName,
  onRemoveParticipant,
  onTabChange,
}: PeopleTabProps) => {
  const [showExistingPicker, setShowExistingPicker] = useState(false);

  const handleRemove = (id: number) => {
    const success = onRemoveParticipant(id);
    if (!success) {
      alert("ไม่สามารถลบคนนี้ได้เนื่องจากมีรายชื่ออยู่ในรายการค่าใช้จ่าย กรุณาลบรายการค่าใช้จ่ายที่เกี่ยวข้องก่อนครับ");
    }
  };

  const handleAddExisting = (participant: Participant) => {
    onAddExistingParticipant(participant);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
        <h3 className="text-blue-800 font-medium mb-2 flex items-center gap-2">
          <Users size={18} />
          ขั้นตอนที่ 1: ใครไปบ้าง?
        </h3>
        <p className="text-sm text-blue-600">
          เพิ่มชื่อเพื่อนๆ ทุกคนที่จะหารเงินในการหารนี้
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
      
      <div className="flex gap-2">
        <Button 
          onClick={onAddParticipant} 
          variant="secondary" 
          className="flex-1 border-dashed border-2"
        >
          <Plus size={18} /> เพิ่มคนใหม่
        </Button>
        
        {participantsFromOtherSessions.length > 0 && (
          <Button 
            onClick={() => setShowExistingPicker(!showExistingPicker)} 
            variant={showExistingPicker ? "primary" : "secondary"}
            className="flex-1"
          >
            <UserPlus size={18} /> จาก session อื่น ({participantsFromOtherSessions.length})
          </Button>
        )}
      </div>

      {/* Existing Participants Picker */}
      {showExistingPicker && participantsFromOtherSessions.length > 0 && (
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 animate-slideDown">
          <h4 className="text-amber-800 font-medium mb-3 text-sm">
            เลือกคนจาก session อื่น
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {participantsFromOtherSessions.map((p) => (
              <button
                key={`existing-${p.id}-${p.name}`}
                onClick={() => handleAddExisting(p)}
                className="px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm text-amber-800 hover:bg-amber-100 hover:border-amber-400 transition-all text-left truncate flex items-center gap-2"
              >
                <div className="h-6 w-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-xs flex-shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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
