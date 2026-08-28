/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClassroomProvider, useClassroom } from './context/ClassroomContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AttendanceView } from './components/Attendance/AttendanceView';
import { SeatingChartView } from './components/Seating/SeatingChartView';
import { RewardStoreView } from './components/Rewards/RewardStoreView';
import { TimetableView } from './components/Timetable/TimetableView';
import { StudentsListView } from './components/Students/StudentsListView';
import { LeaderboardView } from './components/Leaderboard/LeaderboardView';
import { DashboardView } from './components/Dashboard/DashboardView';
import { StudentProfileModal } from './components/StudentProfileModal';
import { AvatarCropModal } from './components/AvatarCropModal';
import { QuickPointModal } from './components/QuickPointModal';
import { LuckyWheelModal } from './components/LuckyWheelModal';
import { AIAssistantModal } from './components/AIAssistantModal';

const AppContent: React.FC = () => {
  const { currentTab } = useClassroom();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100/60 font-sans text-slate-900 antialiased">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <Header />

        {/* Dynamic View Panel */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'attendance' && <AttendanceView />}
          {currentTab === 'seating' && <SeatingChartView />}
          {currentTab === 'rewards' && <RewardStoreView />}
          {currentTab === 'timetable' && <TimetableView />}
          {currentTab === 'students' && <StudentsListView />}
          {currentTab === 'leaderboard' && <LeaderboardView />}
          {currentTab === 'dashboard' && <DashboardView />}
        </main>
      </div>

      {/* Global Modals */}
      <StudentProfileModal />
      <AvatarCropModal />
      <QuickPointModal />
      <LuckyWheelModal />
      <AIAssistantModal />
    </div>
  );
};

export default function App() {
  return (
    <ClassroomProvider>
      <AppContent />
    </ClassroomProvider>
  );
}

