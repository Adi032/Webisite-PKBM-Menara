/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, ActiveView } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { OfflineBanner } from './components/common/OfflineBanner';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { LandingView } from './components/landing/LandingView';
import { StudentPortal } from './components/student/StudentPortal';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { RegistrationModal } from './components/registration/RegistrationModal';
import { RegistrationStatusCheckModal } from './components/registration/RegistrationStatusCheckModal';
import { storageService } from './services/storageService';
import { usePushNotifications } from './hooks/usePushNotifications';
import {
  LearningModule,
  StudentGrade,
  ChatMessage,
  NotificationItem,
  StudentProgress,
  AnalyticsSummary,
  StudentRegistration,
  TeacherTutor,
} from './types';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  
  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isStatusCheckOpen, setIsStatusCheckOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // App data state
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [studentsProgress, setStudentsProgress] = useState<StudentProgress[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(storageService.getAnalytics());
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
  const [teachers, setTeachers] = useState<TeacherTutor[]>([]);

  const { sendPush } = usePushNotifications();

  // Load from local storage
  const loadAllData = () => {
    setModules(storageService.getModules());
    setGrades(storageService.getGrades());
    setChats(storageService.getChats());
    setNotifications(storageService.getNotifications());
    setStudentsProgress(storageService.getStudentsProgress());
    setAnalytics(storageService.getAnalytics());
    setRegistrations(storageService.getRegistrations());
    setTeachers(storageService.getTeachers());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllNotificationsRead = () => {
    const updated = storageService.markAllNotificationsRead();
    setNotifications(updated);
  };

  const handleTestPushNotification = () => {
    sendPush(
      '🔔 Pengingat Tutorial Tatap Muka',
      'Kelas bimbingan Modul Vokasi Desain Digital dimulai pukul 13.30 WIB di Lab PKBM Menara.',
      'jadwal'
    );
    storageService.addNotification({
      title: '🔔 Pengingat Tutorial Tatap Muka',
      message: 'Kelas bimbingan Modul Vokasi Desain Digital dimulai pukul 13.30 WIB di Lab PKBM Menara.',
      category: 'jadwal',
      isPushSent: true,
    });
    loadAllData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Offline Connectivity Banner */}
      <OfflineBanner />

      {/* Main Header & Nav */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenRegisterModal={() => setIsRegisterOpen(true)}
        onOpenStatusModal={() => setIsStatusCheckOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={unreadCount}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'landing' && (
          <LandingView
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenStatusCheck={() => setIsStatusCheckOpen(true)}
            setActiveView={setActiveView}
            studentsProgress={studentsProgress}
            analytics={analytics}
            modules={modules}
          />
        )}

        {activeView === 'student' && (
          <StudentPortal
            modules={modules}
            grades={grades}
            chats={chats}
            studentsProgress={studentsProgress}
            teachers={teachers}
            onRefreshData={loadAllData}
            onOpenPushTest={handleTestPushNotification}
          />
        )}

        {activeView === 'teacher' && (
          <TeacherDashboard
            studentsProgress={studentsProgress}
            grades={grades}
            analytics={analytics}
            registrations={registrations}
            teachers={teachers}
            onRefreshData={loadAllData}
          />
        )}
      </main>

      {/* Common Footer */}
      <Footer />

      {/* Modals & Slide-overs */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={() => {
          loadAllData();
        }}
      />

      <RegistrationStatusCheckModal
        isOpen={isStatusCheckOpen}
        onClose={() => setIsStatusCheckOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onTriggerTestPush={handleTestPushNotification}
      />
    </div>
  );
}
