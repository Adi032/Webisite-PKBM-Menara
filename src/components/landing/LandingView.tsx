import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle,
  Clock,
  Briefcase,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Upload,
  MessageSquare,
  FileText,
  Search,
  School,
  Camera,
  RotateCcw,
} from 'lucide-react';
import { ActiveView } from '../common/Header';
import { StudentProgress, AnalyticsSummary, LearningModule } from '../../types';
import { storageService } from '../../services/storageService';

interface LandingViewProps {
  onOpenRegister: () => void;
  onOpenStatusCheck: () => void;
  setActiveView: (view: ActiveView) => void;
  studentsProgress?: StudentProgress[];
  analytics?: AnalyticsSummary;
  modules?: LearningModule[];
}

const DEFAULT_CLASSROOM_PHOTO = '/kelas_pkbm_menara.jpg';

export const LandingView: React.FC<LandingViewProps> = ({
  onOpenRegister,
  onOpenStatusCheck,
  setActiveView,
  studentsProgress = [],
  analytics,
  modules = [],
}) => {
  const [classroomPhoto, setClassroomPhoto] = useState<string>(() => {
    return localStorage.getItem('pkbm_classroom_photo') || DEFAULT_CLASSROOM_PHOTO;
  });

  // Dynamic stats integrated with live students, UPK graduation, and modules
  const currentStudents: StudentProgress[] = (studentsProgress && studentsProgress.length > 0)
    ? studentsProgress
    : storageService.getStudentsProgress();

  const currentAnalytics = analytics || storageService.getAnalytics();
  const currentModules: LearningModule[] = (modules && modules.length > 0)
    ? modules
    : storageService.getModules();

  const totalStudentsCount = currentStudents.length > 0
    ? currentStudents.length
    : currentAnalytics.totalStudents;

  // Real-time UPK Passing Rate calculation from student academic evaluations (KKM >= 75.0)
  const passingStudentsCount = currentStudents.filter(
    (s: StudentProgress) => (s.averageScore || 0) >= 75 && s.statusKetercapaian !== 'Perlu Pendampingan'
  ).length;

  const upkPassingRate = currentStudents.length > 0
    ? ((passingStudentsCount / currentStudents.length) * 100).toFixed(1)
    : (currentAnalytics.passingRateUPK ? currentAnalytics.passingRateUPK.toFixed(1) : '98.2');

  const totalModulesCount = currentModules.length;
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white pt-12 sm:pt-20 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs sm:text-sm font-medium backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Penerimaan Peserta Didik Baru (PPDB) 2026/2027 Dibuka</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none">
                Pendidikan Untuk Semua <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-300 via-sky-200 to-amber-300 bg-clip-text text-transparent">
                  & Raih Masa Depan
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Pusat Kegiatan Belajar Masyarakat (PKBM) Menara menyelenggarakan Pendidikan Kesetaraan <strong>Paket A (SD)</strong>, <strong>Paket B (SMP)</strong>, dan <strong>Paket C (SMA)</strong> dengan metode belajar blended yang fleksibel dan Penarapan Deep Learning, modul online/offline, dan legalitas resmi Kemendikdasmen.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={onOpenRegister}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-300 transition active:scale-95"
                >
                  <GraduationCap className="w-5 h-5 text-slate-950" />
                  <span>Daftar Sekarang (Online)</span>
                </button>

                <button
                  onClick={() => setActiveView('student')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm sm:text-base backdrop-blur-md transition"
                >
                  <BookOpen className="w-4 h-4 text-blue-300" />
                  <span>Masuk Portal Belajar</span>
                </button>

                <button
                  onClick={onOpenStatusCheck}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition"
                >
                  <Search className="w-4 h-4" />
                  <span>Cek Status Berkas</span>
                </button>
              </div>

              {/* Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Ijazah Diakui Negara & CPNS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Jadwal Fleksibel (Pekerja & Dewasa)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>Aplikasi Didukung Akses Offline</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Card with Interactive Highlights */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-slate-800/80 border border-slate-700/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
                
                {/* Floating Top Badge */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/90 border border-blue-400 p-0.5 shadow-md shrink-0">
                      <img src="/logo.png" alt="Logo 3D PKBM Menara" className="w-full h-full object-contain rounded-full drop-shadow-xs" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">PKBM Menara</h3>
                      <p className="text-xs text-slate-400">NPSN: P9954430 • Kab. Konawe Selatan</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                    Aktif Beroperasi
                  </span>
                </div>

                {/* Live Sync Status Indicator */}
                <div className="flex items-center justify-between pb-1 pt-4 text-[11px] text-blue-300">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Data Akademik Terintegrasi Live</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {currentStudents.filter((s: StudentProgress) => s.packageType === 'Paket C').length} C •{' '}
                    {currentStudents.filter((s: StudentProgress) => s.packageType === 'Paket B').length} B •{' '}
                    {currentStudents.filter((s: StudentProgress) => s.packageType === 'Paket A').length} A
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 pb-6 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                        {totalStudentsCount}
                      </span>
                      <span className="text-xs text-amber-300 font-bold">Siswa</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Peserta Didik Aktif</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <span className="text-2xl sm:text-3xl font-extrabold text-blue-400">
                      {upkPassingRate}%
                    </span>
                    <p className="text-xs text-slate-400 mt-1">Tingkat Kelulusan UPK</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                        {totalModulesCount > 0 ? totalModulesCount : '100%'}
                      </span>
                      {totalModulesCount > 0 && (
                        <span className="text-xs text-emerald-300 font-bold">Modul</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Modul Berstandar Nasional</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <span className="text-2xl sm:text-3xl font-extrabold text-purple-400">3 Paket</span>
                    <p className="text-xs text-slate-400 mt-1">Paket A, B, & Paket C</p>
                  </div>
                </div>

                {/* Quick Role Direct Access */}
                <div className="pt-2 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Jelajahi Langsung Berdasarkan Kebutuhan:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActiveView('student')}
                      className="p-3 rounded-xl bg-blue-950/60 hover:bg-blue-900/50 border border-blue-800/50 text-left transition flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">Portal Siswa</div>
                        <div className="text-[10px] text-blue-300">Modul, Nilai & Rapor</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                    <button
                      onClick={() => setActiveView('teacher')}
                      className="p-3 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/50 border border-indigo-800/50 text-left transition flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">Dasbor Guru</div>
                        <div className="text-[10px] text-indigo-300">Presensi & Analitik</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Program Pendidikan Kesetaraan Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Jenjang Program Resmi
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pilih Jalur Pendidikan Kesetaraan Anda
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Seluruh lulusan mendapatkan ijazah negara yang setara dengan pendidikan formal, berhak melanjutkan kuliah ke perguruan tinggi, mengikuti tes CPNS, maupun melamar pekerjaan formal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Paket A (SD) */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition">
                  A
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                  Setara SD / MI
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Program Paket A</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Pendidikan dasar kesetaraan yang berfokus pada literasi, numerasi, pembentukan karakter mandiri, dan pengenalan sains terapan untuk anak usia putus sekolah maupun dewasa.
              </p>
              <div className="space-y-2 border-t border-slate-100 pt-4 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bahasa Indonesia, Matematika Dasar, IPAS</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pendidikan Karakter & Budaya Lokal</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pendampingan intensif & ramah anak</span>
                </div>
              </div>
            </div>
            <button
              onClick={onOpenRegister}
              className="w-full py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs sm:text-sm font-semibold hover:bg-amber-100 transition"
            >
              Daftar Paket A
            </button>
          </div>

          {/* Paket B (SMP) */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition">
                  B
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200">
                  Setara SMP / MTs
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Program Paket B</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Jenjang pendidikan menengah pertama yang membekali peserta didik dengan sains, bahasa internasional, dan teknologi informasi untuk persiapan ke jenjang SMA atau dunia kerja.
              </p>
              <div className="space-y-2 border-t border-slate-100 pt-4 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>IPA Terpadu, IPS, Bahasa Inggris Terapan</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Keterampilan Dasar Komputer & Internet</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Jadwal bimbingan tatap muka akhir pekan</span>
                </div>
              </div>
            </div>
            <button
              onClick={onOpenRegister}
              className="w-full py-2.5 rounded-xl border border-blue-300 bg-blue-50 text-blue-900 text-xs sm:text-sm font-semibold hover:bg-blue-100 transition"
            >
              Daftar Paket B
            </button>
          </div>

          {/* Paket C (SMA) */}
          <div className="rounded-3xl bg-gradient-to-b from-blue-900 to-indigo-950 text-white p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-lg group-hover:scale-105 transition">
                  C
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
                  Paling Populer • Setara SMA
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Program Paket C</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                Pendidikan menengah atas dengan peminatan Ilmu Pengetahuan Sosial (IPS) & Keterampilan Vokasi Terapan yang dirancang khusus bagi pekerja, atlet, wirausahawan, atau santri.
              </p>
              <div className="space-y-2 border-t border-slate-700/60 pt-4 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Bisa Lanjut Kuliah ke PTN / PTS & Tes Kedinasan</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Vokasi Desain Grafis & Digital Marketing Gratis</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Modul belajar mandiri dapat diakses tanpa kuota</span>
                </div>
              </div>
            </div>
            <button
              onClick={onOpenRegister}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs sm:text-sm font-bold shadow-md hover:from-amber-300 hover:to-amber-400 transition"
            >
              Daftar Paket C Sekarang
            </button>
          </div>

        </div>
      </section>

      {/* Ekosistem Fitur Terpadu PKBM Menara */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Sistem Digital Terintegrasi
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white">
              Fitur Lengkap Untuk Siswa, Guru/Tutor, dan Wali Murid
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              PKBM Menara menggabungkan teknologi e-learning terkini dengan kemudahan operasional agar proses belajar tetap berkualitas kapan saja dan di mana saja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Pendaftaran Online (PPDB)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Formulir pendaftaran multi-step dengan upload berkas digital, verifikasi dokumen Dapodik, dan cetak kartu registrasi otomatis berbarcode.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Portal Materi Belajar & E-Modul</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Modul resmi interaktif dengan ringkasan bab, video panduan, latihan kuis mandiri dengan skor instan, dan fitur unduh untuk dibaca offline.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Manajemen Nilai & E-Rapor Resmi</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kalkulasi otomatis nilai tugas, modul, dan UPK. Transkrip nilai digital berstandar kurikulum kesetaraan dengan fitur cetak format rapor resmi.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Dasbor Guru & Analitik Real-Time</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pemantauan keaktifan siswa, rekap presensi tatap muka dan daring, grafik ketuntasan modul, serta peringatan dini siswa butuh pendampingan.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Upload Materi Guru & E-Learning</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tutor dan guru dapat mengunggah modul digital, berkas PDF, video tutorial, serta menyusun kuis evaluasi pemahaman yang langsung terbit di portal siswa.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Komunikasi Dua Arah & Push Alert</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Saluran pesan interaktif antara guru wali kelas, siswa, dan orang tua/wali murid, dilengkapi notifikasi push browser dan suara denting jadwal darurat.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Profil Lembaga & Legalitas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Legalitas & Akreditasi
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Lembaga Pendidikan Resmi & Berizin Operasional
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              PKBM Menara terdaftar secara sah pada basis data Dapodik Kemendikdasmen dengan Nomor Pokok Sekolah Nasional (NPSN) <strong>P9954430</strong>, berdomisili di Jalan Sorumba Desa Langgea, Kec. Ranomeeto, Kab. Konawe Selatan, Sulawesi Tenggara, dan telah Terakreditasi A (Sangat Baik) oleh BAN-PDM.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Hak Lulusan Setara Penuh</h4>
                  <p className="text-xs text-slate-600">Ijazah Paket C berhak untuk mendaftar SNBP/SNBT Perguruan Tinggi Negeri, TNI/Polri, dan formasi ASN/CPNS.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <Briefcase className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Pembekalan Vokasi & Keterampilan Kerja</h4>
                  <p className="text-xs text-slate-600">Setiap siswa Paket B dan C wajib mengikuti 1 mata pelajaran vokasi (Desain Digital, Sablon Digital, Aplikasi Perkantoran).</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 relative group">
              <img
                src={classroomPhoto}
                alt="Suasana Ruang Belajar PKBM Menara"
                className="w-full h-80 sm:h-96 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <label className="bg-slate-900/85 hover:bg-slate-950 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-lg hover:scale-105 border border-white/20">
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <span>Pasang Foto Asli</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const res = event.target?.result as string;
                          if (res) {
                            setClassroomPhoto(res);
                            try {
                              localStorage.setItem('pkbm_classroom_photo', res);
                            } catch {
                              // If image exceeds localStorage quota, still displayed in state
                            }
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                {classroomPhoto !== DEFAULT_CLASSROOM_PHOTO && (
                  <button
                    onClick={() => {
                      try {
                        localStorage.removeItem('pkbm_classroom_photo');
                      } catch {}
                      setClassroomPhoto(DEFAULT_CLASSROOM_PHOTO);
                    }}
                    title="Kembalikan foto asli bawaan"
                    className="bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full text-xs backdrop-blur-md transition-all border border-white/20 shadow-md"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="p-6 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800">Ruang Tutorial & Pembelajaran Digital</span>
                  <span className="text-[11px] text-slate-500">Gedung PKBM Menara</span>
                </div>
                <p className="text-xs text-slate-600">
                  Suasana belajar interaktif berbasis layar pintar digital di ruang kelas PKBM Menara, Jalan Sorumba Desa Langgea.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-800 via-indigo-800 to-blue-900 text-white p-8 sm:p-14 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Mulai Langkah Baru Bersama PKBM Menara
            </h2>
            <p className="text-sm sm:text-base text-blue-100">
              Jangan tunda kesempatan emas menyelesaikan pendidikan dan membuka peluang karir impian Anda. Daftar online sekarang dalam hitungan menit.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition active:scale-95"
            >
              Formulir Pendaftaran Online (PPDB)
            </button>
            <button
              onClick={() => setActiveView('student')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition"
            >
              Kunjungi Portal Belajar Siswa
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
