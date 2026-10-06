import React from 'react';
import { X, Printer, Download, Award, ShieldCheck, CheckCircle } from 'lucide-react';
import { StudentGrade, StudentProgress } from '../../types';
import { storageService } from '../../services/storageService';

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  grades: StudentGrade[];
  student?: StudentProgress;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  grades,
  student,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const averageScore = Math.round(
    grades.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / (grades.length || 1)
  );

  const displayPackage = student?.packageType || 'Paket C';
  const displayName = student?.studentName || 'Ahmad Fauzi Rahman';
  const displayNisn = student?.nisn || '0059124819';
  const waliKelas = storageService.getWaliKelasForPackage(displayPackage) || {
    name: 'Dra. Endang Sulistyowati, M.Pd.',
    nip: '19740512 200003 2 001',
    roleTitle: `Tutor Wali Kelas ${displayPackage}`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Top Control Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm sm:text-base">
              E-Rapor Pendidikan Kesetaraan (Paket C) • Kurikulum Merdeka
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white text-slate-900 space-y-6 print:p-0">
          
          {/* Official Letterhead (KOP PKBM) */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white/90 border border-blue-400 p-0.5 shadow-md shrink-0 mx-auto sm:mx-0">
              <img src="/logo.png" alt="Logo 3D PKBM Menara" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                PUSAT KEGIATAN BELAJAR MASYARAKAT (PKBM) MENARA
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                NPSN: P9954430 • Terakreditasi A (Sangat Baik) BAN-PDM
              </p>
              <p className="text-[11px] text-slate-500">
                Jalan Sorumba Desa Langgea, Kec. Ranomeeto, Kab. Konawe Selatan, Sulawesi Tenggara | Email: pkbmmenaralanggea@gmail.com | WA: +62 852-5519-8598
              </p>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-base sm:text-lg font-black tracking-wide uppercase underline">
              LAPORAN HASIL BELAJAR PESERTA DIDIK (E-RAPOR)
            </h3>
            <p className="text-xs font-semibold text-slate-600 uppercase">
              PROGRAM PENDIDIKAN KESETARAAN {displayPackage} {displayPackage === 'Paket A' ? '(SETARA SD)' : displayPackage === 'Paket B' ? '(SETARA SMP)' : '(SETARA SMA)'}
            </p>
            <p className="text-xs text-slate-500">
              Tahun Pelajaran: 2026/2027 • Semester: 1 (Ganjil)
            </p>
          </div>

          {/* Student Biodata Box */}
          <div className="flex flex-col sm:flex-row gap-4 border border-slate-300 p-4 rounded-xl bg-slate-50/50">
            {/* Student Official Photo */}
            <div className="flex flex-col items-center justify-center shrink-0 border border-slate-300 rounded-lg p-1.5 bg-white shadow-2xs w-28 mx-auto sm:mx-0">
              {student?.avatar ? (
                <img
                  src={student.avatar}
                  alt={displayName}
                  className="w-24 h-32 object-cover rounded border border-slate-200"
                />
              ) : (
                <div className="w-24 h-32 bg-slate-100 rounded border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-[10px] text-center p-2">
                  <span>Foto 3x4 Resmi</span>
                </div>
              )}
              <span className="text-[9px] text-slate-500 font-bold uppercase mt-1">Pas Foto 3x4</span>
            </div>

            {/* Biodata Details */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div className="flex">
                <span className="w-36 text-slate-500">Nama Peserta Didik</span>
                <span className="font-bold text-slate-900">: {displayName}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500">Nomor Induk Siswa (NISN)</span>
                <span className="font-mono font-bold text-slate-900">: {displayNisn}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500">Rombel / Kelas</span>
                <span className="font-bold text-blue-900">
                  : {student?.gradeLevel || (displayPackage === 'Paket A' ? 'Kelas 6 (Setara SD)' : displayPackage === 'Paket B' ? 'Kelas 9 (Setara SMP)' : 'Kelas 12 IPS (Setara SMA)')}
                </span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500">Tingkat / Derajat</span>
                <span className="font-semibold text-slate-800">
                  : {displayPackage === 'Paket A' ? 'Tingkat 2 / Derajat Awal (Setara SD)' : displayPackage === 'Paket B' ? 'Tingkat 4 / Derajat Terampil (Setara SMP)' : 'Tingkat 6 / Derajat Mahir (Kelas XII)'}
                </span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500">Wali Kelas Pendamping</span>
                <span className="font-bold text-slate-900">
                  : {student?.waliKelasName || waliKelas.name}
                </span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500">Peminatan / Vokasi</span>
                <span className="font-semibold text-slate-800">
                  : {displayPackage === 'Paket A' ? 'Dasar Literasi & Numerasi' : displayPackage === 'Paket B' ? 'Prakarya & Kewirausahaan Mandiri' : 'IPS & Desain Grafis Digital'}
                </span>
              </div>
            </div>
          </div>

          {/* Grades Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold">
                  <th className="border border-slate-300 px-2.5 py-2 text-center w-10">No</th>
                  <th className="border border-slate-300 px-3 py-2 text-left">Mata Pelajaran</th>
                  <th className="border border-slate-300 px-2.5 py-2 text-center w-14">KKM</th>
                  <th className="border border-slate-300 px-2.5 py-2 text-center w-16">Nilai Akhir</th>
                  <th className="border border-slate-300 px-2.5 py-2 text-center w-14">Predikat</th>
                  <th className="border border-slate-300 px-3 py-2 text-left">Capaian Kompetensi / Catatan Tutor</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g, idx) => (
                  <tr key={g.subjectId} className="hover:bg-slate-50/50">
                    <td className="border border-slate-300 px-2.5 py-2.5 text-center font-medium">{idx + 1}</td>
                    <td className="border border-slate-300 px-3 py-2.5 font-bold text-slate-800">
                      {g.subjectName}
                      <span className="block text-[10px] font-normal text-slate-500">Tutor: {g.tutorName}</span>
                    </td>
                    <td className="border border-slate-300 px-2.5 py-2.5 text-center font-mono">{g.kkm}</td>
                    <td className="border border-slate-300 px-2.5 py-2.5 text-center font-mono font-bold text-blue-900 text-sm">
                      {g.nilaiAkhir}
                    </td>
                    <td className="border border-slate-300 px-2.5 py-2.5 text-center font-bold">
                      <span className="inline-block w-6 py-0.5 rounded bg-slate-100 text-slate-800 font-mono">
                        {g.predikat}
                      </span>
                    </td>
                    <td className="border border-slate-300 px-3 py-2.5 text-slate-700 leading-snug">
                      {g.catatanTutor}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold">
                  <td colSpan={3} className="border border-slate-300 px-3 py-2 text-right">Rata-rata Nilai Akhir:</td>
                  <td className="border border-slate-300 px-2.5 py-2 text-center text-sm font-mono text-emerald-800 font-extrabold">
                    {averageScore}
                  </td>
                  <td colSpan={2} className="border border-slate-300 px-3 py-2 text-slate-700 font-normal">
                    Predikat Rata-Rata: <strong>A (Sangat Memuaskan / Tuntas)</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Attendance and Character Records */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-300 rounded-xl p-3.5 space-y-2">
              <h5 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                Kehadiran & Keaktifan Tutorial:
              </h5>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>Persentase Hadir: <strong>94.5%</strong></div>
                <div>Sakit: <strong>2 Hari</strong></div>
                <div>Izin: <strong>1 Hari</strong></div>
                <div>Tanpa Keterangan: <strong>0 Hari</strong></div>
              </div>
            </div>

            <div className="border border-slate-300 rounded-xl p-3.5 space-y-2">
              <h5 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                Progres Vokasi & Keterampilan:
              </h5>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                Peserta didik telah menyelesaikan Uji Keterampilan Vokasi Desain Grafis Digital dengan predikat <strong>KOMPETEN</strong> dan berhak menerima sertifikat pendamping ijazah.
              </p>
            </div>
          </div>

          {/* Official Signatures & Digital Stamp */}
          <div className="pt-4 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-semibold text-slate-800">Tutor Wali Kelas {displayPackage}</p>
              <div className="h-16 flex items-center justify-center font-serif italic text-blue-900 text-sm">
                (Digital Verified)
              </div>
              <p className="font-bold underline text-slate-900">{waliKelas.name}</p>
              <p className="text-[10px] text-slate-500">NIP. {waliKelas.nip || '-'}</p>
            </div>

            <div className="relative">
              <p className="text-slate-500">Konawe Selatan, 01 Oktober 2026</p>
              <p className="font-semibold text-slate-800">Kepala PKBM Menara</p>
              <div className="h-16 flex items-center justify-center relative">
                {/* Simulated Digital School Stamp */}
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-600/60 flex items-center justify-center text-[7px] font-bold text-blue-800 rotate-12 absolute opacity-80 uppercase tracking-tighter text-center">
                  PKBM MENARA<br/>RANOMEETO<br/>P9954430
                </div>
                <span className="font-serif italic text-blue-900 text-sm relative z-10">
                  (Digital Verified)
                </span>
              </div>
              <p className="font-bold underline text-slate-900">Dr. H. Ruswandi Suryanegara, M.M.</p>
              <p className="text-[10px] text-slate-500">NIP. 19680315 199302 1 002</p>
            </div>
          </div>

          {/* Validation note */}
          <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-400 text-center flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dokumen ini dicetak melalui Sistem E-Rapor PKBM Menara dan sah tanpa cap basah.</span>
          </div>

        </div>

      </div>
    </div>
  );
};
