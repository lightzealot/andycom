import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Feed } from './components/CommunityFeed/Feed';
import { ClassroomView } from './components/Classroom/ClassroomView';
import { LeaderboardView } from './components/Leaderboard/LeaderboardView';
import { CalendarView } from './components/Calendar/CalendarView';
import { MembersView } from './components/Members/MembersView';
import { AboutPage } from './components/About/AboutPage';
import { AdminStudio } from './components/Admin/AdminStudio';
import { DirectMessagesDrawer } from './components/DirectMessages/DirectMessagesDrawer';

const MainLayout: React.FC = () => {
  const { tabActual } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Header />
      <main className="flex-1">
        {tabActual === 'comunidad' && <Feed />}
        {tabActual === 'classroom' && <ClassroomView />}
        {tabActual === 'calendario' && <CalendarView />}
        {tabActual === 'leaderboard' && <LeaderboardView />}
        {tabActual === 'miembros' && <MembersView />}
        {tabActual === 'about' && <AboutPage />}
        {tabActual === 'admin' && <AdminStudio />}
      </main>
      <DirectMessagesDrawer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
