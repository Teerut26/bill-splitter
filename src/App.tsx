import { useState, useEffect } from 'react';
import { 
  Header, 
  Navigation, 
  PeopleTab, 
  ExpensesTab, 
  ReportTab,
  SessionList
} from './components';
import { 
  useBillSplitterStore, 
  useActiveSession,
  useReport, 
  useSettlements 
} from './stores/useBillSplitterStore';
import type { TabType } from './types';

export default function EqualityApp() {
  const [activeTab, setActiveTab] = useState<TabType>('people');

  // Get state from store
  const tripName = useBillSplitterStore(state => state.tripName);
  const sessions = useBillSplitterStore(state => state.sessions);
  const activeSessionId = useBillSplitterStore(state => state.activeSessionId);
  const newExpense = useBillSplitterStore(state => state.newExpense);
  const isExpenseFormOpen = useBillSplitterStore(state => state.isExpenseFormOpen);

  // Get actions from store
  const setTripName = useBillSplitterStore(state => state.setTripName);
  const createSession = useBillSplitterStore(state => state.createSession);
  const deleteSession = useBillSplitterStore(state => state.deleteSession);
  const selectSession = useBillSplitterStore(state => state.selectSession);
  const updateSessionName = useBillSplitterStore(state => state.updateSessionName);
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

  // Get active session data
  const activeSession = useActiveSession();
  const report = useReport();
  const settlements = useSettlements();

  // Reset to people tab when switching sessions
  useEffect(() => {
    setActiveTab('people');
  }, [activeSessionId]);

  const handleBackToSessions = () => {
    selectSession(null);
  };

  const isInSession = activeSessionId !== null && activeSession !== undefined;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      <Header 
        eventName={isInSession ? activeSession.name : undefined}
        onEventNameChange={isInSession ? updateSessionName : undefined}
        showBackButton={isInSession}
        onBack={handleBackToSessions}
      />

      <main className="max-w-xl mx-auto px-4 py-6">
        {!isInSession ? (
          <SessionList
            tripName={tripName}
            sessions={sessions}
            onTripNameChange={setTripName}
            onCreateSession={() => createSession()}
            onSelectSession={selectSession}
            onDeleteSession={deleteSession}
          />
        ) : (
          <>
            {activeTab === 'people' && (
              <PeopleTab
                participants={activeSession.participants}
                onAddParticipant={addParticipant}
                onUpdateParticipantName={updateParticipantName}
                onRemoveParticipant={removeParticipant}
                onTabChange={setActiveTab}
              />
            )}
            
            {activeTab === 'expenses' && (
              <ExpensesTab
                participants={activeSession.participants}
                expenses={activeSession.expenses}
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
                participants={activeSession.participants}
                report={report}
                settlements={settlements}
              />
            )}
          </>
        )}
      </main>

      {isInSession && (
        <Navigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      )}

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