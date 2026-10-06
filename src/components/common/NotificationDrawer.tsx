import React from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  Calendar,
  BookOpen,
  Volume2,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { usePushNotifications } from '../../hooks/usePushNotifications';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onTriggerTestPush?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onTriggerTestPush,
}) => {
  const { permission, requestPermission } = usePushNotifications();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getCategoryBadge = (category: NotificationItem['category']) => {
    switch (category) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Mendesak
          </span>
        );
      case 'jadwal':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
            <Calendar className="w-3 h-3 text-indigo-600" />
            Jadwal Belajar
          </span>
        );
      case 'akademik':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <BookOpen className="w-3 h-3 text-emerald-600" />
            Akademik / Modul
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
            <Bell className="w-3 h-3 text-blue-600" />
            Pengumuman
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Notifikasi & Pengumuman</h2>
                <p className="text-xs text-slate-500">
                  {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua telah dibaca'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Push permission banner */}
          {permission !== 'granted' && (
            <div className="m-4 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3 text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Aktifkan notifikasi push browser untuk info jadwal mendesak?</span>
              </div>
              <button
                onClick={requestPermission}
                className="px-2.5 py-1 rounded-lg bg-blue-700 text-white font-medium hover:bg-blue-800 shrink-0 transition"
              >
                Aktifkan
              </button>
            </div>
          )}

          {/* Quick actions */}
          <div className="px-5 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={onMarkAllRead}
              className="text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Tandai Semua Dibaca
            </button>
            {onTriggerTestPush && (
              <button
                onClick={onTriggerTestPush}
                className="text-slate-600 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded text-[11px] font-medium transition"
              >
                Uji Suara & Push
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Tidak ada notifikasi saat ini.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`pt-3 first:pt-0 p-3 rounded-xl transition ${
                    !notif.isRead
                      ? 'bg-blue-50/50 border border-blue-100'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    {getCategoryBadge(notif.category)}
                    <span className="text-[11px] text-slate-400">{notif.timestamp}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  {notif.category === 'urgent' && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-700 font-medium">
                      <span>Harap perhatikan batas waktu pengumuman</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 text-center">
            Pembaruan sistem notifikasi otomatis PKBM Menara • Didukung Service Worker PWA
          </div>
        </div>
      </div>
    </div>
  );
};
