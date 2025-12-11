import { useState } from 'react';
import { 
  Header, 
  Navigation, 
  PeopleTab, 
  ExpensesTab, 
  ReportTab 
} from './components';
import { useBillSplitter } from './hooks/useBillSplitter';
import type { TabType } from './types';

export default function EqualityApp() {
  const [activeTab, setActiveTab] = useState<TabType>('people');
  const [eventName, setEventName] = useState('ทริปกาญจนบุรี');

  const {
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
  } = useBillSplitter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      <Header 
        eventName={eventName} 
        onEventNameChange={setEventName} 
      />

      <main className="max-w-xl mx-auto px-4 py-6">
        {activeTab === 'people' && (
          <PeopleTab
            participants={participants}
            onAddParticipant={addParticipant}
            onUpdateParticipantName={updateParticipantName}
            onRemoveParticipant={removeParticipant}
            onTabChange={setActiveTab}
          />
        )}
        
        {activeTab === 'expenses' && (
          <ExpensesTab
            participants={participants}
            expenses={expenses}
            newExpense={newExpense}
            isExpenseFormOpen={isExpenseFormOpen}
            report={report}
            onSetIsExpenseFormOpen={setIsExpenseFormOpen}
            onToggleInvolvedInNewExpense={toggleInvolvedInNewExpense}
            onSelectAllInvolved={selectAllInvolved}
            onHandleCustomSplitChange={handleCustomSplitChange}
            onUpdateNewExpense={updateNewExpense}
            onSubmitExpense={submitExpense}
            onRemoveExpense={removeExpense}
          />
        )}
        
        {activeTab === 'report' && (
          <ReportTab
            participants={participants}
            report={report}
            settlements={settlements}
          />
        )}
      </main>

      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

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