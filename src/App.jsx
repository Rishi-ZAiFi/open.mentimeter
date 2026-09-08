import React, { useState } from 'react';
import { QuizProvider, useQuiz } from './context/QuizContext';
import Header from './components/common/Header';
import RoleSelection from './components/auth/RoleSelection';
import TrainerLogin from './components/auth/TrainerLogin';
import ParticipantLogin from './components/auth/ParticipantLogin';
import TrainerDashboard from './components/trainer/TrainerDashboard';
import TrainerLiveQuestion from './components/trainer/TrainerLiveQuestion';
import TrainerFinalResults from './components/trainer/TrainerFinalResults';
import ParticipantWaitingRoom from './components/participant/ParticipantWaitingRoom';
import ParticipantQuestionScreen from './components/participant/ParticipantQuestionScreen';
import ParticipantResultScreen from './components/participant/ParticipantResultScreen';
import ParticipantFinalScreen from './components/participant/ParticipantFinalScreen';

function MainApp() {
  const { role, sessionStatus, questionState } = useQuiz();
  const [selectedRolePrompt, setSelectedRolePrompt] = useState(null); // 'trainer' | 'participant' | null

  // Flow 1: No role selected or not authenticated yet
  if (!role) {
    if (selectedRolePrompt === 'trainer') {
      return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
          <Header />
          <main className="flex-1 flex items-center justify-center p-4">
            <TrainerLogin onBack={() => setSelectedRolePrompt(null)} />
          </main>
        </div>
      );
    }

    if (selectedRolePrompt === 'participant') {
      return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
          <Header />
          <main className="flex-1 flex items-center justify-center p-4">
            <ParticipantLogin onBack={() => setSelectedRolePrompt(null)} />
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <RoleSelection onSelectRole={(r) => setSelectedRolePrompt(r)} />
        </main>
      </div>
    );
  }

  // Flow 2: Trainer Experience
  if (role === 'trainer') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {sessionStatus === 'ready' && <TrainerDashboard />}
          {(sessionStatus === 'running' || sessionStatus === 'paused') && <TrainerLiveQuestion />}
          {sessionStatus === 'finished' && <TrainerFinalResults />}
        </main>
      </div>
    );
  }

  // Flow 3: Participant Experience
  if (role === 'participant') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Header />
        <main className="flex-1 p-4 sm:p-6">
          {sessionStatus === 'ready' && <ParticipantWaitingRoom />}
          
          {(sessionStatus === 'running' || sessionStatus === 'paused') && (
            <>
              {questionState === 'active' && <ParticipantQuestionScreen />}
              {(questionState === 'revealed' || questionState === 'closed') && <ParticipantResultScreen />}
            </>
          )}

          {sessionStatus === 'finished' && <ParticipantFinalScreen />}
        </main>
      </div>
    );
  }

  return null;
}

export default function App() {
  return (
    <QuizProvider>
      <MainApp />
    </QuizProvider>
  );
}
