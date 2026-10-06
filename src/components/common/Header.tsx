import React from 'react';
import {
  GraduationCap,
  Bell,
  BookOpen,
  LayoutDashboard,
  UserCheck,
  Globe,
  Wifi,
  WifiOff,
  Menu,
  X,
  FileCheck2,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export type ActiveView = 'landing' | 'student' | 'teacher';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenRegisterModal: () => void;
  onOpenStatusModal: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenRegisterModal,
  onOpenStatusModal,
  onOpenNotifications,
  unreadNotificationsCount,
}) => {
  const isOnline = useOnlineStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & School Branding */}
          <div 
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white/90 border border-blue-200 shadow-md group-hover:scale-105 transition shrink-0 p-0.5">
              <img
                src="/logo.png"
                alt="Logo 3D PKBM Menara"
                className="w-full h-full object-contain rounded-full drop-shadow-xs"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-blue-800 transition">
                  PKBM MENARA
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold tracking-wide uppercase">
                  NPSN: P9954430
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-none mt-0.5">
                Desa Langgea, Kec. Ranomeeto, Kab. Konawe Selatan
              </p>
            </div>
          </div>

          {/* Navigation Mode Pill Switches (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveView('landing')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'landing'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Profil & Info PPDB</span>
            </button>
            <button
              onClick={() => setActiveView('student')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'student'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Portal Belajar Siswa</span>
            </button>
            <button
              onClick={() => setActiveView('teacher')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'teacher'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dasbor Guru & Analitik</span>
            </button>
          </nav>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Online/Offline status indicator */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
              }`}
              title={isOnline ? 'Terhubung ke server PKBM Menara' : 'Mode Offline — Data tersimpan di perangkat'}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-600" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95"
              aria-label="Buka notifikasi"
            >
              <Bell className="w-5 h-5 text-slate-700" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* PPDB Button */}
            <button
              onClick={onOpenRegisterModal}
              className="hidden md:flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:from-blue-800 hover:to-indigo-800 transition active:scale-95"
            >
              <UserCheck className="w-4 h-4 text-amber-300" />
              <span>Daftar Siswa Baru</span>
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top duration-200">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
            Navigasi Portal
          </div>
          <button
            onClick={() => {
              setActiveView('landing');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activeView === 'landing' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Beranda & Profil Sekolah</span>
          </button>
          <button
            onClick={() => {
              setActiveView('student');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activeView === 'student' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Portal Siswa (Materi, Nilai)</span>
          </button>
          <button
            onClick={() => {
              setActiveView('teacher');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activeView === 'teacher' ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-600" />
            <span>Dasbor Guru & Analitik Real-Time</span>
          </button>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenRegisterModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
            >
              <UserCheck className="w-4 h-4 text-amber-300" />
              <span>Daftar Siswa Baru (PPDB Online)</span>
            </button>
            <button
              onClick={() => {
                onOpenStatusModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>Cek Status Pendaftaran</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
