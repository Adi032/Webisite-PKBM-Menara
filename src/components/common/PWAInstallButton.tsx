import React, { useState } from 'react';
import { Download, CheckCircle2, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, show small badge or hide
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Aplikasi Terpasang</span>
      </div>
    );
  }

  // Chromium / Android / Desktop prompt
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-700 px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:from-blue-800 hover:to-indigo-800 transition active:scale-95"
        title="Pasang aplikasi ke layar utama perangkat Anda untuk akses cepat dan offline"
      >
        <Download className="w-4 h-4" />
        <span className="font-semibold">Install Aplikasi</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50/80 px-3 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-100 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-700" />
          <span>Pasang di iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 mb-4">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Pasang PKBM Menara di iPhone / iPad</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Nikmati akses materi belajar secara cepat dan dapat dibuka saat koneksi internet terbatas:
              </p>
              <ol className="mt-4 space-y-2 text-sm text-slate-700 list-decimal pl-5">
                <li>Buka di browser Safari.</li>
                <li>Ketuk tombol <strong>Bagikan / Share</strong> (ikon kotak bertanda panah ke atas di bilah bawah).</li>
                <li>Gulir ke bawah dan pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.</li>
                <li>Ketuk <strong>Tambah</strong> di sudut kanan atas.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-blue-700 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
