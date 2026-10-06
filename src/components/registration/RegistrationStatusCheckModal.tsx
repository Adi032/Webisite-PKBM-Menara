import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, AlertCircle, FileText, QrCode } from 'lucide-react';
import { StudentRegistration } from '../../types';
import { storageService } from '../../services/storageService';

interface RegistrationStatusCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationStatusCheckModal: React.FC<RegistrationStatusCheckModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [foundRecord, setFoundRecord] = useState<StudentRegistration | null>(null);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const registrations = storageService.getRegistrations();
    const cleanQuery = query.trim().toLowerCase();
    const found = registrations.find(
      (r) =>
        r.regNumber.toLowerCase() === cleanQuery ||
        r.nik.toLowerCase() === cleanQuery ||
        r.phone.includes(cleanQuery)
    );
    setFoundRecord(found || null);
  };

  const getStatusBadge = (status: StudentRegistration['status']) => {
    switch (status) {
      case 'Diterima':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            DITERIMA RESMI
          </span>
        );
      case 'Diverifikasi':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            BERKAS DIVERIFIKASI
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            MENUNGGU VERIFIKASI TATA USAHA
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-300">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Cek Status Pendaftaran PPDB</h3>
              <p className="text-xs text-slate-400">Verifikasi berkas & status kelulusan berkas Dapodik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Masukkan Nomor Registrasi (REG-2026-...) atau NIK KTP Anda:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Contoh: REG-2026-PKBM-0101 atau 3201..."
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Cari</span>
              </button>
            </div>
          </form>

          {searched && (
            <div>
              {foundRecord ? (
                <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">NOMOR PENDAFTARAN</span>
                      <strong className="text-sm font-mono text-blue-900">{foundRecord.regNumber}</strong>
                    </div>
                    {getStatusBadge(foundRecord.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-200/80 py-3">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Nama Calon Siswa:</span>
                      <strong className="text-slate-800">{foundRecord.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Program Jenjang:</span>
                      <strong className="text-slate-800">{foundRecord.packageType}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Jalur Belajar:</span>
                      <span className="text-slate-700">{foundRecord.track}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Tanggal Pengajuan:</span>
                      <span className="text-slate-700">{foundRecord.submittedAt}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                    <p className="font-semibold text-slate-800 mb-1">Catatan Panitia PPDB:</p>
                    <p>
                      {foundRecord.status === 'Diterima'
                        ? 'Selamat! Berkas Anda dinyatakan lengkap dan telah dimasukkan ke dalam Dapodik Kemdikbudristek. Silakan lakukan aktivasi akun Portal Siswa Anda.'
                        : foundRecord.status === 'Diverifikasi'
                        ? 'Berkas awal Anda memenuhi syarat administrasi. Mohon nantikan jadwal wawancara pemetaan minat & bakat yang dikirimkan melalui WhatsApp.'
                        : 'Berkas pendaftaran sedang dalam antrean verifikasi oleh petugas tata usaha PKBM Menara (maksimal 1x24 jam kerja).'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-xs font-medium">
                    Data pendaftaran dengan kata kunci "{query}" tidak ditemukan.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Pastikan nomor registrasi atau NIK yang Anda masukkan sudah sesuai.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Demo Credentials */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-[11px] text-blue-900">
            <span className="font-bold">Contoh No. Registrasi Demo untuk Dicoba:</span>
            <div className="mt-1 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setQuery('REG-2026-PKBM-0101');
                }}
                className="px-2 py-0.5 bg-white border border-blue-300 rounded font-mono hover:bg-blue-100"
              >
                REG-2026-PKBM-0101
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('REG-2026-PKBM-0102');
                }}
                className="px-2 py-0.5 bg-white border border-blue-300 rounded font-mono hover:bg-blue-100"
              >
                REG-2026-PKBM-0102
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
