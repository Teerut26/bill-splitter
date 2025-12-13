import { useState, useEffect } from 'react';
import { 
  Header, 
  Navigation, 
  PeopleTab, 
  ExpensesTab, 
  ReportTab,
  SessionList,
  PWAUpdatePrompt
} from './components';
import { 
  useBillSplitterStore, 
  useActiveSession,
  useParticipantsFromOtherSessions,
  useReport, 
  useSettlements,
  usePaidSettlements 
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
  const editingExpenseId = useBillSplitterStore(state => state.editingExpenseId);

  // Get actions from store
  const setTripName = useBillSplitterStore(state => state.setTripName);
  const createSession = useBillSplitterStore(state => state.createSession);
  const deleteSession = useBillSplitterStore(state => state.deleteSession);
  const selectSession = useBillSplitterStore(state => state.selectSession);
  const updateSessionName = useBillSplitterStore(state => state.updateSessionName);
  const addParticipant = useBillSplitterStore(state => state.addParticipant);
  const addExistingParticipant = useBillSplitterStore(state => state.addExistingParticipant);
  const updateParticipantName = useBillSplitterStore(state => state.updateParticipantName);
  const removeParticipant = useBillSplitterStore(state => state.removeParticipant);
  const setIsExpenseFormOpen = useBillSplitterStore(state => state.setIsExpenseFormOpen);
  const toggleInvolvedInNewExpense = useBillSplitterStore(state => state.toggleInvolvedInNewExpense);
  const selectAllInvolved = useBillSplitterStore(state => state.selectAllInvolved);
  const handleCustomSplitChange = useBillSplitterStore(state => state.handleCustomSplitChange);
  const updateNewExpense = useBillSplitterStore(state => state.updateNewExpense);
  const submitExpense = useBillSplitterStore(state => state.submitExpense);
  const removeExpense = useBillSplitterStore(state => state.removeExpense);
  const startEditExpense = useBillSplitterStore(state => state.startEditExpense);
  const updateExpense = useBillSplitterStore(state => state.updateExpense);
  const cancelEditExpense = useBillSplitterStore(state => state.cancelEditExpense);
  const resetTrip = useBillSplitterStore(state => state.resetTrip);
  const exportTrip = useBillSplitterStore(state => state.exportTrip);
  const importTrip = useBillSplitterStore(state => state.importTrip);
  const toggleSettlementPaid = useBillSplitterStore(state => state.toggleSettlementPaid);

  // Get active session data
  const activeSession = useActiveSession();
  const participantsFromOtherSessions = useParticipantsFromOtherSessions();
  const report = useReport();
  const settlements = useSettlements();
  const paidSettlements = usePaidSettlements();

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
            onResetTrip={resetTrip}
            onExportTrip={exportTrip}
            onImportTrip={importTrip}
          />
        ) : (
          <>
            {activeTab === 'people' && (
              <PeopleTab
                participants={activeSession.participants}
                participantsFromOtherSessions={participantsFromOtherSessions}
                onAddParticipant={addParticipant}
                onAddExistingParticipant={addExistingParticipant}
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
                editingExpenseId={editingExpenseId}
                report={report}
                onSetIsExpenseFormOpen={setIsExpenseFormOpen}
                onToggleInvolvedInNewExpense={toggleInvolvedInNewExpense}
                onSelectAllInvolved={selectAllInvolved}
                onHandleCustomSplitChange={handleCustomSplitChange}
                onUpdateNewExpense={updateNewExpense}
                onSubmitExpense={submitExpense}
                onRemoveExpense={removeExpense}
                onStartEditExpense={startEditExpense}
                onUpdateExpense={updateExpense}
                onCancelEditExpense={cancelEditExpense}
              />
            )}
            
            {activeTab === 'report' && (
              <ReportTab
                participants={activeSession.participants}
                report={report}
                settlements={settlements}
                paidSettlements={paidSettlements}
                onTogglePaid={toggleSettlementPaid}
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

      {/* PWA Update Prompt */}
      <PWAUpdatePrompt />
    </div>
  );
}