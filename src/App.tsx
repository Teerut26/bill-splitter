import { 
  Header, 
  Navigation, 
  PeopleTab, 
  ExpensesTab, 
  ReportTab 
} from './components';
import { 
  useBillSplitterStore, 
  useReport, 
  useSettlements 
} from './stores/useBillSplitterStore';
import type { TabType } from './types';
import { useState } from 'react';

export default function EqualityApp() {
  const [activeTab, setActiveTab] = useState<TabType>('people');

  // Get state from store
  const eventName = useBillSplitterStore(state => state.eventName);
  const participants = useBillSplitterStore(state => state.participants);
  const expenses = useBillSplitterStore(state => state.expenses);
  const newExpense = useBillSplitterStore(state => state.newExpense);
  const isExpenseFormOpen = useBillSplitterStore(state => state.isExpenseFormOpen);

  // Get actions from store
  const setEventName = useBillSplitterStore(state => state.setEventName);
  const addParticipant = useBillSplitterStore(state => state.addParticipant);
  const updateParticipantName = useBillSplitterStore(state => state.updateParticipantName);
  const removeParticipant = useBillSplitterStore(state => state.removeParticipant);
  const setIsExpenseFormOpen = useBillSplitterStore(state => state.setIsExpenseFormOpen);
  const toggleInvolvedInNewExpense = useBillSplitterStore(state => state.toggleInvolvedInNewExpense);
  const selectAllInvolved = useBillSplitterStore(state => state.selectAllInvolved);
  const handleCustomSplitChange = useBillSplitterStore(state => state.handleCustomSplitChange);
  const updateNewExpense = useBillSplitterStore(state => state.updateNewExpense);
  const submitExpense = useBillSplitterStore(state => state.submitExpense);
  const removeExpense = useBillSplitterStore(state => state.removeExpense);

  // Get computed values
  const report = useReport();
  const settlements = useSettlements();

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