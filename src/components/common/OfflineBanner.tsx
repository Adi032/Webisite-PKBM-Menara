import React from 'react';
import { WifiOff, HardDriveDownload } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-600 text-white px-4 py-2 text-xs md:text-sm font-medium sticky top-0 z-50 shadow-md flex items-center justify-between transition-all">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-200"></span>
          </span>
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            <strong>Mode Akses Offline Aktif:</strong> Koneksi internet sedang terbatas/terputus. Anda tetap dapat membaca modul yang telah diunduh dan mengisi draft pendaftaran.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs bg-amber-700/60 px-2.5 py-1 rounded-full text-amber-100 border border-amber-500/40">
          <HardDriveDownload className="w-3.5 h-3.5" />
          <span>Data tersimpan lokal</span>
        </div>
      </div>
    </div>
  );
};
