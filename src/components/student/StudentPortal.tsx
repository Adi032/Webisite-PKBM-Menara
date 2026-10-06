import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Award,
  MessageSquare,
  Search,
  HardDriveDownload,
  CheckCircle2,
  Clock,
  Send,
  Printer,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  FileText,
  User,
  Users,
  GraduationCap,
  Calendar,
  AlertCircle,
  HelpCircle,
  Link as LinkIcon,
  ExternalLink,
  Pencil,
  Phone,
  Mail,
  Camera,
  Save,
  X,
} from 'lucide-react';
import {
  LearningModule,
  StudentGrade,
  ChatMessage,
  PackageType,
  StudentProgress,
  TeacherTutor,
} from '../../types';
import { storageService } from '../../services/storageService';
import { ModuleReaderModal } from './ModuleReaderModal';
import { ReportCardModal } from './ReportCardModal';
import { TeacherUploadMaterialModal } from './TeacherUploadMaterialModal';

interface StudentPortalProps {
  modules: LearningModule[];
  grades: StudentGrade[];
  chats: ChatMessage[];
  studentsProgress?: StudentProgress[];
  teachers?: TeacherTutor[];
  onRefreshData: () => void;
  onOpenPushTest?: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  modules,
  grades,
  chats,
  studentsProgress,
  teachers,
  onRefreshData,
  onOpenPushTest,
}) => {
  const [activeTab, setActiveTab] = useState<'modules' | 'grades' | 'chat' | 'teachers'>('modules');
  
  // Available students from Real-Time Monitoring
  const allStudents = (studentsProgress && studentsProgress.length > 0)
    ? studentsProgress
    : storageService.getStudentsProgress();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    allStudents[0]?.studentId || 'std-01'
  );

  // Sync if allStudents updates (e.g. when a student is newly added)
  useEffect(() => {
    if (allStudents.length > 0 && !allStudents.some((s: StudentProgress) => s.studentId === selectedStudentId)) {
      setSelectedStudentId(allStudents[0].studentId);
    }
  }, [allStudents, selectedStudentId]);

  const activeStudent =
    allStudents.find((s: StudentProgress) => s.studentId === selectedStudentId) || allStudents[0];

  // Dynamic correlated tutors from teachers database
  const allTeachers = (teachers && teachers.length > 0)
    ? teachers
    : storageService.getTeachers();

  const assignedTutor = activeStudent
    ? allTeachers.find((t) => t.isWaliKelas && t.waliKelasForPackage === activeStudent.packageType) ||
      allTeachers.find((t) => t.packageTypes.includes(activeStudent.packageType)) ||
      allTeachers[0]
    : allTeachers[0];

  const packageTutors = activeStudent
    ? allTeachers.filter((t) => t.packageTypes.includes(activeStudent.packageType))
    : allTeachers;

  // Correlated student grades loaded directly from storage for the selected student
  const studentGrades = activeStudent
    ? storageService.getStudentGrades(activeStudent.studentId, activeStudent.packageType)
    : grades;

  // Modules filter
  const [selectedPackage, setSelectedPackage] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null);
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState<LearningModule | null>(null);

  // Photo Upload Modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoUploadPreview, setPhotoUploadPreview] = useState<string>('');
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [photoToast, setPhotoToast] = useState<string | null>(null);

  const handleImageFileChange = (file: File, callback: (dataUrl: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDimension = 320;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          callback(compressed);
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStudentPhoto = () => {
    if (!activeStudent || !photoUploadPreview) return;
    setIsSavingPhoto(true);
    storageService.updateStudentAvatar(activeStudent.studentId, photoUploadPreview);
    storageService.addNotification({
      title: `📷 Foto Siswa Diperbarui: ${activeStudent.studentName}`,
      message: `Foto profil peserta didik berhasil diperbarui dan tersinkronisasi ke E-Rapor serta Buku Induk.`,
      category: 'akademik',
      isPushSent: true,
    });
    onRefreshData();
    setIsSavingPhoto(false);
    setIsPhotoModalOpen(false);
    setPhotoToast(`Foto profil ${activeStudent.studentName} berhasil diperbarui!`);
    setTimeout(() => setPhotoToast(null), 3000);
  };

  // Chat message input
  const [chatInput, setChatInput] = useState('');
  const [chatRole, setChatRole] = useState<'student' | 'parent'>('student');

  const filteredModules = modules.filter((m) => {
    const matchesPackage = selectedPackage === 'Semua' || m.packageType === selectedPackage;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tutorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPackage && matchesSearch;
  });

  const handleToggleDownload = (moduleId: string) => {
    storageService.toggleOfflineDownload(moduleId);
    onRefreshData();
    if (activeModule && activeModule.id === moduleId) {
      setActiveModule((prev) =>
        prev ? { ...prev, isDownloadedOffline: !prev.isDownloadedOffline } : null
      );
    }
  };

  const handleUpdateQuizScore = (moduleId: string, score: number) => {
    storageService.updateModuleProgress(moduleId, 3, score);
    onRefreshData();
  };

  const handleDeleteCustomModule = (moduleId: string, title: string) => {
    if (window.confirm(`Hapus materi "${title}" dari daftar modul?`)) {
      storageService.deleteModule(moduleId);
      onRefreshData();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeStudent) return;

    storageService.addChatMessage({
      senderId: chatRole === 'student' ? activeStudent.studentId : `parent-${activeStudent.studentId}`,
      senderName:
        chatRole === 'student'
          ? `${activeStudent.studentName} (Siswa)`
          : `Wali Murid ${activeStudent.studentName}`,
      senderRole: chatRole,
      recipientId: 'teacher-01',
      message: chatInput.trim(),
    });

    setChatInput('');
    onRefreshData();

    // Auto simulated response from teacher after 1.5s
    setTimeout(() => {
      storageService.addChatMessage({
        senderId: assignedTutor?.id || 'teacher-01',
        senderName: `${assignedTutor?.name ? assignedTutor.name.split(',')[0] : 'Ibu Endang'} (Wali Kelas ${activeStudent.packageType})`,
        senderRole: 'teacher',
        recipientId: activeStudent.studentId,
        message:
          `Terima kasih atas pesannya, ananda ${activeStudent.studentName.split(' ')[0]}. Catatan konsultasi telah kami terima. Semangat terus dalam menyelesaikan modul belajarnya!`,
      });
      onRefreshData();
    }, 1500);
  };

  const averageGrade = studentGrades.length > 0
    ? Math.round(studentGrades.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / studentGrades.length)
    : activeStudent?.averageScore || 85;

  const studentInitials = activeStudent?.studentName
    ? activeStudent.studentName
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AF';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Student Selector Bar - Correlated with Real-Time Academic Monitoring */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-md shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                Pilih Profil Siswa (Data Terkorelasi E-Rapor)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                ● {allStudents.length} Siswa Terdaftar
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih data peserta didik untuk melihat modul, transkrip nilai, dan e-rapor resmi yang sinkron dengan dasbor guru.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:min-w-[340px]">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 text-xs font-bold rounded-xl border-2 border-blue-600 bg-blue-50/60 text-blue-950 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer shadow-xs transition"
            >
              {allStudents.map((s: StudentProgress) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.studentName} — {s.gradeLevel || s.packageType} (NISN: {s.nisn}) • Wali: {s.waliKelasName || 'Pendidik'}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-blue-700 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => {
              setPhotoUploadPreview(activeStudent?.avatar || '');
              setIsPhotoModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition active:scale-95 shrink-0"
            title="Upload atau ganti foto profil peserta didik"
          >
            <Camera className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Upload Foto</span>
          </button>
        </div>
      </div>

      {/* Student Profile Header Bar */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-8 flex items-center gap-4 sm:gap-5">
            <div className="relative group shrink-0">
              {activeStudent?.avatar ? (
                <img
                  src={activeStudent.avatar}
                  alt={activeStudent.studentName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-lg shrink-0 border-2 border-amber-400"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                  {studentInitials}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setPhotoUploadPreview(activeStudent?.avatar || '');
                  setIsPhotoModalOpen(true);
                }}
                className="absolute inset-0 bg-slate-900/65 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer text-amber-300"
                title="Klik untuk upload / ganti foto profil siswa"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-bold">Ganti Foto</span>
              </button>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black">{activeStudent?.studentName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  Siswa Aktif
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    activeStudent?.statusKetercapaian === 'Sangat Baik'
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/50'
                      : activeStudent?.statusKetercapaian === 'Optimal'
                      ? 'bg-blue-500/30 text-blue-200 border border-blue-500/50'
                      : 'bg-rose-500/30 text-rose-200 border border-rose-500/50'
                  }`}
                >
                  {activeStudent?.statusKetercapaian}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-200">
                NISN: <span className="font-mono font-bold text-amber-300">{activeStudent?.nisn}</span> •{' '}
                <strong className="text-white font-semibold">
                  {activeStudent?.gradeLevel || (
                    activeStudent?.packageType === 'Paket A'
                      ? 'Kelas 6 (Setara SD)'
                      : activeStudent?.packageType === 'Paket B'
                      ? 'Kelas 9 (Setara SMP)'
                      : 'Kelas 12 IPS (Setara SMA)'
                  )}
                </strong>{' '}
                <span className="text-blue-300">({activeStudent?.packageType})</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                <span>
                  Tutor Wali Kelas: <strong className="text-amber-300 font-bold">{activeStudent?.waliKelasName || assignedTutor?.name || 'Dra. Endang Sulistyowati, M.Pd.'}</strong>
                </span>
                <span>•</span>
                <span>
                  Kehadiran: <strong className="text-emerald-400">{activeStudent?.attendanceRate}%</strong>
                </span>
                <span>•</span>
                <span>
                  Modul Tuntas: <strong className="text-amber-300">{activeStudent?.modulesCompleted} / {activeStudent?.totalModules}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex lg:justify-end gap-3">
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center flex-1 sm:flex-none">
              <span className="text-[10px] text-blue-200 uppercase font-bold block">Rata-rata Nilai</span>
              <span className="text-2xl font-black text-amber-300">{averageGrade}</span>
              <span className="text-[10px] text-emerald-300 block font-semibold">
                Predikat: {averageGrade >= 85 ? 'A' : averageGrade >= 75 ? 'B' : averageGrade >= 60 ? 'C' : 'D'}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center flex-1 sm:flex-none">
              <span className="text-[10px] text-blue-200 uppercase font-bold block">Modul Tersedia</span>
              <span className="text-2xl font-black text-white">{modules.length}</span>
              <span className="text-[10px] text-blue-300 block">Siap Dipelajari</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'modules'
                ? 'bg-blue-800 text-white shadow-md shadow-blue-800/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Portal Materi Belajar ({modules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('grades')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'grades'
                ? 'bg-blue-800 text-white shadow-md shadow-blue-800/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Transkrip & E-Rapor</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'chat'
                ? 'bg-blue-800 text-white shadow-md shadow-blue-800/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Komunikasi & Konseling Belajar</span>
          </button>

          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'teachers'
                ? 'bg-blue-800 text-white shadow-md shadow-blue-800/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Guru & Tutor Pengampu ({packageTutors.length})</span>
          </button>
        </div>

        {/* Upload Button visible directly on Header Actions */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95"
        >
          <Upload className="w-4 h-4 text-amber-300" />
          <span>+ Upload Materi Belajar (Guru)</span>
        </button>
      </div>

      {/* Tab 1: Modules LMS */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          
          {/* Top Banner & Quick Teacher Upload CTA */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold uppercase tracking-wider">
                  Menu Tutor / Guru
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  Kurikulum Merdeka Pendidikan Kesetaraan
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Pusat Unggah & Akses Materi Pembelajaran Terpadu
              </h3>
              <p className="text-xs text-slate-600">
                Bapak/Ibu Guru dapat mengunggah modul baru, materi bacaan PDF, video pembelajaran, dan latihan soal kuis mandiri untuk siswa.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href="https://rumah.pendidikan.go.id/ruang/murid"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-blue-900 border border-blue-200 text-xs sm:text-sm font-bold shadow-2xs transition active:scale-95"
                title="Buka portal materi resmi Kemendikbud: Rumah Pendidikan (Ruang Murid)"
              >
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <span>Rumah Pendidikan (Ruang Murid)</span>
              </a>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95"
              >
                <Upload className="w-4 h-4 text-amber-300" />
                <span>Unggah Materi Baru</span>
              </button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 mr-1">Filter Jenjang:</span>
              {['Semua', 'Paket C', 'Paket B', 'Paket A'].map((pkg) => (
                <button
                  key={pkg}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedPackage === pkg
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pkg}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari mata pelajaran, judul, atau tutor..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((mod) => (
              <div
                key={mod.id}
                className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={mod.coverImage}
                      alt={mod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 max-w-[65%]">
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                        {mod.packageType}
                      </span>
                      {mod.gradeLevel && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-sm flex items-center gap-1 border border-amber-300">
                          <GraduationCap className="w-3 h-3" />
                          <span>{mod.gradeLevel}</span>
                        </span>
                      )}
                    </div>

                    {/* Class description bottom overlay on cover */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-2.5 pt-5 flex items-center justify-between text-white">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Kelas: {mod.gradeLevel || (mod.packageType === 'Paket A' ? 'Setara SD' : mod.packageType === 'Paket B' ? 'Setara SMP' : 'Setara SMA')}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-300 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                        Modul {mod.moduleNumber}
                      </span>
                    </div>

                    {/* Offline Saved Badge & Action */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleDownload(mod.id);
                        }}
                        className={`p-2 rounded-xl backdrop-blur-md transition ${
                          mod.isDownloadedOffline
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-white/80 text-slate-700 hover:bg-white'
                        }`}
                        title={mod.isDownloadedOffline ? 'Tersimpan untuk offline' : 'Unduh untuk akses offline'}
                      >
                        {mod.isDownloadedOffline ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <HardDriveDownload className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModuleToEdit(mod);
                          setIsUploadModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-white/90 text-amber-700 hover:bg-amber-100 shadow-xs transition"
                        title="Edit materi pembelajaran ini"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {mod.id.startsWith('mod-custom-') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomModule(mod.id, mod.title);
                          }}
                          className="p-2 rounded-xl bg-white/80 text-rose-600 hover:bg-rose-50 hover:text-rose-700 shadow-xs transition"
                          title="Hapus modul ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                          {mod.subject}
                        </span>
                        {mod.moduleUrl && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200/80">
                            <LinkIcon className="w-2.5 h-2.5" />
                            <span>Link E-Modul</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-slate-900 leading-snug mt-0.5 group-hover:text-blue-700 transition">
                        {mod.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {mod.description}
                    </p>

                    {/* Progress bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Ketuntasan Bab</span>
                        <span className="font-bold text-slate-800">
                          {mod.completedChapters} / {mod.totalChapters} Bab
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round((mod.completedChapters / mod.totalChapters) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                  <div className="text-[11px] text-slate-500">
                    Tutor: <strong className="text-slate-700">{mod.tutorName.split(',')[0]}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {mod.moduleUrl && (
                      <a
                        href={mod.moduleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition"
                        title="Buka Link Modul di tab baru"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => setActiveModule(mod)}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition active:scale-95 shadow-xs"
                    >
                      <span>Buka Modul</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredModules.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">Tidak Ada Materi Belajar yang Sesuai</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Silakan ubah filter pencarian atau unggah modul baru untuk peserta didik.
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Materi Sekarang</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Grades & E-Rapor */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Transkrip Nilai Akademik & E-Rapor</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
                  {activeStudent?.studentName} ({activeStudent?.packageType})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Data nilai terintegrasi langsung dengan evaluasi tutor pada sistem akademik PKBM Menara.
              </p>
            </div>

            <button
              onClick={() => setShowReportCardModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Cetak / Unduh Format E-Rapor Resmi</span>
            </button>
          </div>

          {/* Grades Table */}
          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-3 text-center">KKM</th>
                    <th className="py-3 px-3 text-center">Tugas 1</th>
                    <th className="py-3 px-3 text-center">Tugas 2</th>
                    <th className="py-3 px-3 text-center">Ujian Modul</th>
                    <th className="py-3 px-3 text-center">Ujian Akhir</th>
                    <th className="py-3 px-3 text-center">Nilai Akhir</th>
                    <th className="py-3 px-3 text-center">Predikat</th>
                    <th className="py-3 px-4">Catatan Perkembangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentGrades.map((g) => (
                    <tr key={g.subjectId} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {g.subjectName}
                        <span className="block text-[10px] text-slate-400 font-normal">Tutor: {g.tutorName}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-500">{g.kkm}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-700">{g.tugas1}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-700">{g.tugas2}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-700">{g.ujianModul}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-700">{g.ujianAkhir}</td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-blue-900 text-sm">
                        {g.nilaiAkhir}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs ${
                            g.predikat === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {g.predikat}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 leading-snug">
                        {g.catatanTutor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Two-Way Communication & Counseling */}
      {activeTab === 'chat' && (
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs flex flex-col h-[650px]">
          
          {/* Chat Header */}
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 border border-blue-200">
                {assignedTutor?.avatar ? (
                  <img src={assignedTutor.avatar} alt={assignedTutor.name} className="w-full h-full object-cover" />
                ) : (
                  'W'
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Ruang Konsultasi & Wali Kelas</h4>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{assignedTutor?.name || 'Dra. Endang Sulistyowati'} (Online)</span>
                </p>
              </div>
            </div>

            {/* Role switch toggle (simulate student vs parent sending message) */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 hidden sm:inline">Kirim Sebagai:</span>
              <button
                type="button"
                onClick={() => setChatRole('student')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  chatRole === 'student' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Siswa ({activeStudent?.studentName ? activeStudent.studentName.split(' ')[0] : 'Siswa'})
              </button>
              <button
                type="button"
                onClick={() => setChatRole('parent')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  chatRole === 'parent' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Wali Murid ({activeStudent?.studentName ? activeStudent.studentName.split(' ')[0] : 'Siswa'})
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
            {chats.map((c) => {
              const isMe = c.senderRole === chatRole || (chatRole === 'student' && c.senderRole === 'parent');
              const isTeacher = c.senderRole === 'teacher';

              return (
                <div
                  key={c.id}
                  className={`flex flex-col ${isTeacher ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-700">{c.senderName}</span>
                    <span>• {c.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isTeacher
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                        : 'bg-blue-700 text-white rounded-tr-none'
                    }`}
                  >
                    {c.message}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Tulis pesan atau konsultasi untuk ${assignedTutor?.name ? assignedTutor.name.split(',')[0] : 'Wali Kelas'} sebagai ${chatRole === 'student' ? (activeStudent?.studentName || 'Siswa') : 'Wali Murid'}...`}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95"
            >
              <span>Kirim</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* Tab 4: Dewan Guru & Tutor Pengampu Siswa */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Users className="w-5 h-5 text-blue-700" />
                <h3 className="text-lg font-bold text-slate-900">
                  Dewan Guru & Tutor Pengampu — {activeStudent?.packageType}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                  ● {packageTutors.length} Pendidik Ditugaskan
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Berikut daftar pendidik, wali kelas, dan tutor vokasi terverifikasi yang mendampingi modul belajar dan penilaian <strong className="text-slate-800">{activeStudent?.studentName}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Jenjang Siswa:</span>
              <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-900 font-bold text-xs border border-blue-200">
                {activeStudent?.packageType}
              </span>
            </div>
          </div>

          {/* Wali Kelas Highlight Banner */}
          {assignedTutor && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img
                  src={assignedTutor.avatar}
                  alt={assignedTutor.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                      ★ Wali Kelas Utama
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[10px] font-bold border border-blue-400/30">
                      {assignedTutor.status}
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-white">{assignedTutor.name}</h4>
                  <p className="text-xs text-blue-200 mt-0.5">{assignedTutor.roleTitle}</p>
                  {assignedTutor.nip && (
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">NIP: {assignedTutor.nip}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <a
                  href={`https://wa.me/${assignedTutor.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Halo ${assignedTutor.name}, saya ${activeStudent?.studentName} (Siswa ${activeStudent?.packageType} PKBM Menara) ingin berkonsultasi mengenai pembelajaran mandiri.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp Wali Kelas</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                  <span>Kirim Pesan Portal</span>
                </button>
              </div>
            </div>
          )}

          {/* Grid of All Teachers for This Package */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-700" />
              <span>Seluruh Tutor Pengampu ({packageTutors.length} Pendidik)</span>
            </h4>

            {packageTutors.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-600">Belum ada tutor terdaftar untuk jenjang ini.</p>
                <p className="text-xs text-slate-400 mt-0.5">Guru dapat menambahkan pendidik melalui Dasbor Guru.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packageTutors.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-start gap-3.5">
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {t.isWaliKelas && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-200">
                                Wali Kelas
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                              {t.status}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-sm mt-1 truncate" title={t.name}>
                            {t.name}
                          </h5>
                          <p className="text-xs text-slate-500 line-clamp-1">{t.roleTitle}</p>
                          {t.nip && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">NIP: {t.nip}</p>
                          )}
                        </div>
                      </div>

                      {/* Subjects tags */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Mata Pelajaran yang Diampu:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {t.subjects.map((sub, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 text-[10px] font-semibold border border-blue-100"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>

                      {t.education && (
                        <p className="text-[11px] text-slate-500 mt-2 italic line-clamp-1">
                          🎓 {t.education}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <a
                        href={`https://wa.me/${t.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Halo ${t.name}, saya ${activeStudent?.studentName} (${activeStudent?.packageType}) ingin berkonsultasi mengenai materi pembelajaran.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Hubungi</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setActiveTab('chat')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span>Chat Portal</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reader Modal */}
      <ModuleReaderModal
        isOpen={!!activeModule}
        onClose={() => setActiveModule(null)}
        module={activeModule}
        onToggleDownload={handleToggleDownload}
        onUpdateQuizScore={handleUpdateQuizScore}
      />

      {/* Report Card Modal */}
      <ReportCardModal
        isOpen={showReportCardModal}
        onClose={() => setShowReportCardModal(false)}
        grades={studentGrades}
        student={activeStudent}
      />

      {/* Teacher Upload & Edit Material Modal */}
      <TeacherUploadMaterialModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setModuleToEdit(null);
        }}
        moduleToEdit={moduleToEdit}
        initialMode={moduleToEdit ? 'edit' : 'create'}
        onMaterialUploaded={(updatedMod) => {
          onRefreshData();
          setActiveModule(updatedMod);
        }}
      />

      {/* Modal Upload / Ganti Foto Profil Siswa */}
      {isPhotoModalOpen && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20 text-white">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Upload Foto Profil Siswa</h3>
                  <p className="text-[11px] text-purple-200">
                    {activeStudent.studentName} ({activeStudent.packageType})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              
              {/* Preview Comparison */}
              <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="relative group">
                  <img
                    src={photoUploadPreview || activeStudent.avatar}
                    alt={activeStudent.studentName}
                    className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-xl ring-2 ring-purple-500"
                  />
                  <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-purple-600 text-white shadow-md">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="font-extrabold text-slate-900 text-sm">{activeStudent.studentName}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">NISN: {activeStudent.nisn}</p>
                  <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-2.5 py-0.5 rounded-full mt-1 inline-block">
                    {activeStudent.gradeLevel || activeStudent.packageType} • Wali: {activeStudent.waliKelasName || 'Pendidik'}
                  </span>
                </div>
              </div>

              {/* File Upload Drop Area */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  Pilih File Foto dari HP / Komputer:
                </label>
                <div className="border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl p-5 text-center transition cursor-pointer bg-purple-50/40 hover:bg-purple-50 relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageFileChange(file, (dataUrl) => setPhotoUploadPreview(dataUrl));
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-purple-600 mx-auto mb-1.5" />
                  <p className="font-bold text-purple-900 text-xs">
                    Klik atau Seret (Drag & Drop) Foto ke Sini
                  </p>
                  <p className="text-[10px] text-purple-600 mt-0.5">
                    Mendukung JPG, PNG, WEBP (Bisa langsung pakai Kamera HP)
                  </p>
                </div>
              </div>

              {/* Quick Preset Avatars */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Atau Pilih Contoh Foto Standar:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Siswa 1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' },
                    { label: 'Siswi 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
                    { label: 'Hijab', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
                    { label: 'Siswa 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUploadPreview(preset.url)}
                      className={`p-1 rounded-xl border text-center transition ${
                        photoUploadPreview === preset.url
                          ? 'border-purple-600 ring-2 ring-purple-400 bg-purple-50'
                          : 'border-slate-200 hover:border-purple-300 bg-white'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-10 h-10 rounded-lg object-cover mx-auto mb-1" />
                      <span className="text-[9px] font-bold text-slate-700 block">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSavingPhoto}
                  onClick={handleSaveStudentPhoto}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Simpan & Terapkan Foto</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {photoToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">{photoToast}</span>
        </div>
      )}

    </div>
  );
};
