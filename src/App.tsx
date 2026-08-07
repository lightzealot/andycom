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
import { MemberProfileModal } from './components/Members/MemberProfileModal';
import { XPToast } from './components/XP/XPToast';
import { PublicPreviewLanding } from './components/Landing/PublicPreviewLanding';

const MainLayout: React.FC = () => {
  const { tabActual, estaAutenticado } = useApp();

  // Si no está registrado o autenticado, muestra la página de vista previa pública
  if (!estaAutenticado) {
    return <PublicPreviewLanding />;
  }

  // Si ya es miembro registrado, accede a todo el contenido y aula
  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-900 flex flex-col font-sans">
      <Header />
      <main className="flex-1 pb-12">
        {tabActual === 'comunidad' && <Feed />}
        {tabActual === 'aula' && <ClassroomView />}
        {tabActual === 'calendario' && <CalendarView />}
        {tabActual === 'miembros' && <MembersView />}
        {tabActual === 'clasificacion' && <LeaderboardView />}
        {tabActual === 'acerca' && <AboutPage />}
        {tabActual === 'configuracion' && <AdminStudio />}
      </main>
      <DirectMessagesDrawer />
      <MemberProfileModal />
      <XPToast />
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
