import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  LayoutDashboard,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Award,
  Bell,
  Send,
  Calendar,
  Search,
  Check,
  X,
  FileCheck2,
  Clock,
  Volume2,
  Save,
  UserCheck,
  BookOpen,
  Filter,
  Upload,
  Pencil,
  Trash2,
  ExternalLink,
  Link as LinkIcon,
  FileText,
  UserPlus,
  Plus,
  GraduationCap,
  BookPlus,
  Copy,
  Share2,
  Phone,
  Mail,
  Camera,
  Image as ImageIcon,
  Grid,
  List,
} from 'lucide-react';
import {
  StudentProgress,
  StudentGrade,
  AnalyticsSummary,
  NotificationItem,
  StudentRegistration,
  LearningModule,
  PackageType,
  TeacherTutor,
} from '../../types';
import { storageService, TeacherProfile, DEFAULT_TEACHER_PROFILE } from '../../services/storageService';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { TeacherUploadMaterialModal } from '../student/TeacherUploadMaterialModal';

interface TeacherDashboardProps {
  studentsProgress: StudentProgress[];
  grades: StudentGrade[];
  analytics: AnalyticsSummary;
  registrations: StudentRegistration[];
  teachers?: TeacherTutor[];
  onRefreshData: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  studentsProgress,
  grades,
  analytics,
  registrations,
  teachers,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'grades' | 'teachers' | 'analytics' | 'modules' | 'announcements' | 'ppdb'>('students');
  
  // Selected student for correlated grades
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    studentsProgress[0]?.studentId || 'std-01'
  );
  const selectedStudent =
    studentsProgress.find((s) => s.studentId === selectedStudentId) || studentsProgress[0];

  // Student directory & filter states
  const [studentFilterPackage, setStudentFilterPackage] = useState<string>('Semua');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentFilterStatus, setStudentFilterStatus] = useState<string>('Semua');
  const [studentViewMode, setStudentViewMode] = useState<'cards' | 'table'>('table');

  // Photo Upload Modal state
  const [studentForPhotoUpload, setStudentForPhotoUpload] = useState<StudentProgress | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isPhotoSaving, setIsPhotoSaving] = useState(false);

  // Edit Student Modal state
  const [editingStudentData, setEditingStudentData] = useState<StudentProgress | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentNisn, setEditStudentNisn] = useState('');
  const [editStudentPackage, setEditStudentPackage] = useState<PackageType>('Paket C');
  const [editStudentGradeLevel, setEditStudentGradeLevel] = useState('');
  const [editStudentWaliKelas, setEditStudentWaliKelas] = useState('');
  const [editStudentPhone, setEditStudentPhone] = useState('');
  const [editStudentGender, setEditStudentGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [editStudentAttendance, setEditStudentAttendance] = useState(90);
  const [editStudentStatus, setEditStudentStatus] = useState<'Sangat Baik' | 'Optimal' | 'Perlu Pendampingan'>('Optimal');
  const [editStudentAvatar, setEditStudentAvatar] = useState('');

  // Delete Student state
  const [studentToDelete, setStudentToDelete] = useState<StudentProgress | null>(null);
  const [studentToast, setStudentToast] = useState<string | null>(null);

  // Modules management state
  const [editingModule, setEditingModule] = useState<LearningModule | null>(null);
  const [moduleSearch, setModuleSearch] = useState('');
  const [modulePackageFilter, setModulePackageFilter] = useState('Semua');

  // Grade editing state
  const [editingGrades, setEditingGrades] = useState<StudentGrade[]>(grades);
  const [gradeSavedToast, setGradeSavedToast] = useState(false);
  const [isUploadMaterialOpen, setIsUploadMaterialOpen] = useState(false);

  // Modal Tambah Siswa Baru state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNisn, setNewStudentNisn] = useState('');
  const [newStudentPackage, setNewStudentPackage] = useState<PackageType>('Paket C');
  const [newStudentGradeLevel, setNewStudentGradeLevel] = useState('Kelas 12 IPS (Setara SMA)');
  const [newStudentWaliKelas, setNewStudentWaliKelas] = useState('Dra. Endang Sulistyowati, M.Pd.');
  const [newStudentPhone, setNewStudentPhone] = useState('+62 812-3456-7890');
  const [newStudentGender, setNewStudentGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [newStudentAvatar, setNewStudentAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
  const [newStudentAttendance, setNewStudentAttendance] = useState(90);
  const [newStudentStatus, setNewStudentStatus] = useState<'Sangat Baik' | 'Optimal' | 'Perlu Pendampingan'>('Optimal');
  const [newStudentAbsenUrl, setNewStudentAbsenUrl] = useState('');

  // Modal Tambah Mata Pelajaran Baru state
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectTutor, setNewSubjectTutor] = useState('Dra. Endang Sulistyowati, M.Pd.');
  const [newSubjectKkm, setNewSubjectKkm] = useState(75);
  const [newSubjectTugas1, setNewSubjectTugas1] = useState(85);
  const [newSubjectTugas2, setNewSubjectTugas2] = useState(85);
  const [newSubjectUjianModul, setNewSubjectUjianModul] = useState(85);
  const [newSubjectUjianAkhir, setNewSubjectUjianAkhir] = useState(85);
  const [newSubjectCatatan, setNewSubjectCatatan] = useState('Aktif mengikuti kegiatan pembelajaran.');

  // Modal Edit Mata Pelajaran state
  const [editingSubject, setEditingSubject] = useState<StudentGrade | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editSubjectTutor, setEditSubjectTutor] = useState('Dra. Endang Sulistyowati, M.Pd.');
  const [editSubjectKkm, setEditSubjectKkm] = useState(75);
  const [editSubjectTugas1, setEditSubjectTugas1] = useState(85);
  const [editSubjectTugas2, setEditSubjectTugas2] = useState(85);
  const [editSubjectUjianModul, setEditSubjectUjianModul] = useState(85);
  const [editSubjectUjianAkhir, setEditSubjectUjianAkhir] = useState(85);
  const [editSubjectCatatan, setEditSubjectCatatan] = useState('');

  // Modal Hapus Mata Pelajaran state
  const [subjectToDelete, setSubjectToDelete] = useState<StudentGrade | null>(null);

  // Teacher identity/profile state
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(() => {
    return storageService.getTeacherProfile();
  });
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [formTeacherName, setFormTeacherName] = useState(teacherProfile.name);
  const [formTeacherRole, setFormTeacherRole] = useState(teacherProfile.role);
  const [formTeacherBadge, setFormTeacherBadge] = useState(teacherProfile.badge);
  const [formTeacherAvatar, setFormTeacherAvatar] = useState(teacherProfile.avatarText || 'TG');
  const [formTeacherNip, setFormTeacherNip] = useState(teacherProfile.nip || '');
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Teacher / Tutor Management state
  const initialTeachers = (teachers && teachers.length > 0)
    ? teachers
    : storageService.getTeachers();
  const [teacherList, setTeacherList] = useState<TeacherTutor[]>(initialTeachers);

  useEffect(() => {
    if (teachers && teachers.length > 0) {
      setTeacherList(teachers);
    }
  }, [teachers]);

  const [teacherFilterPackage, setTeacherFilterPackage] = useState<string>('Semua');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherOnlyWaliKelas, setTeacherOnlyWaliKelas] = useState(false);

  // Modal Tambah / Edit Guru
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacherData, setEditingTeacherData] = useState<TeacherTutor | null>(null);
  const [teacherNameInput, setTeacherNameInput] = useState('');
  const [teacherNipInput, setTeacherNipInput] = useState('');
  const [teacherRoleInput, setTeacherRoleInput] = useState('');
  const [teacherPackagesInput, setTeacherPackagesInput] = useState<PackageType[]>(['Paket C']);
  const [teacherSubjectsInput, setTeacherSubjectsInput] = useState('');
  const [teacherIsWaliKelasInput, setTeacherIsWaliKelasInput] = useState(false);
  const [teacherWaliPackageInput, setTeacherWaliPackageInput] = useState<PackageType>('Paket C');
  const [teacherPhoneInput, setTeacherPhoneInput] = useState('+62 812-3456-7890');
  const [teacherEmailInput, setTeacherEmailInput] = useState('tutor@pkbmmenara.sch.id');
  const [teacherAvatarInput, setTeacherAvatarInput] = useState('');
  const [teacherStatusInput, setTeacherStatusInput] = useState<'Aktif Mengajar' | 'Cuti' | 'Tugas Belajar'>('Aktif Mengajar');
  const [teacherEducationInput, setTeacherEducationInput] = useState('S1 Pendidikan');
  const [teacherBioInput, setTeacherBioInput] = useState('');

  // Modal Delete Guru
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherTutor | null>(null);
  const [teacherToast, setTeacherToast] = useState<string | null>(null);

  // Sync grades whenever selected student changes or studentsProgress changes
  useEffect(() => {
    if (selectedStudent) {
      const studentGrades = storageService.getStudentGrades(
        selectedStudent.studentId,
        selectedStudent.packageType
      );
      setEditingGrades(studentGrades);
    }
  }, [selectedStudentId, studentsProgress]);

  // Push notification creator state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifCategory, setNotifCategory] = useState<'urgent' | 'jadwal' | 'pengumuman' | 'akademik'>('urgent');
  const [sendSuccessToast, setSendSuccessToast] = useState(false);

  const { sendPush, permission, requestPermission } = usePushNotifications();

  const handleGradeInputChange = (subjectId: string, field: keyof StudentGrade, value: number) => {
    setEditingGrades((prev) =>
      prev.map((g) => {
        if (g.subjectId === subjectId) {
          const updated = { ...g, [field]: value };
          const finalScore = Math.round(
            (updated.tugas1 || 0) * 0.2 +
            (updated.tugas2 || 0) * 0.2 +
            (updated.ujianModul || 0) * 0.3 +
            (updated.ujianAkhir || 0) * 0.3
          );
          let predikat: 'A' | 'B' | 'C' | 'D' = 'D';
          if (finalScore >= 85) predikat = 'A';
          else if (finalScore >= 75) predikat = 'B';
          else if (finalScore >= 60) predikat = 'C';
          return { ...updated, nilaiAkhir: finalScore, predikat };
        }
        return g;
      })
    );
  };

  const handleSaveAllGrades = () => {
    if (selectedStudent) {
      storageService.saveStudentGrades(selectedStudent.studentId, editingGrades);
    } else {
      storageService.saveGrades(editingGrades);
    }
    setGradeSavedToast(true);
    setTimeout(() => setGradeSavedToast(false), 3000);
    onRefreshData();
  };

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

  const handleOpenAddStudent = () => {
    setNewStudentName('');
    setNewStudentNisn('');
    setNewStudentPackage('Paket C');
    setNewStudentGradeLevel('Kelas 12 IPS (Setara SMA)');
    setNewStudentWaliKelas('Dra. Endang Sulistyowati, M.Pd.');
    setNewStudentPhone('+62 812-3456-7890');
    setNewStudentGender('Laki-laki');
    setNewStudentAvatar('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
    setNewStudentAttendance(90);
    setNewStudentStatus('Optimal');
    setNewStudentAbsenUrl('');
    setIsAddStudentOpen(true);
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newId = `std-${Date.now()}`;
    const generatedNisn = newStudentNisn.trim() || `00${Math.floor(10000000 + Math.random() * 90000000)}`;
    const student: StudentProgress = {
      studentId: newId,
      studentName: newStudentName.trim(),
      packageType: newStudentPackage,
      gradeLevel: newStudentGradeLevel.trim() || (newStudentPackage === 'Paket C' ? 'Kelas 12 IPS (Setara SMA)' : newStudentPackage === 'Paket B' ? 'Kelas 9 (Setara SMP)' : 'Kelas 6 (Setara SD)'),
      waliKelasName: newStudentWaliKelas.trim() || (newStudentPackage === 'Paket C' ? 'Dra. Endang Sulistyowati, M.Pd.' : newStudentPackage === 'Paket B' ? 'Siti Rahmawati, S.Pd.' : 'Rahmat Hidayat, M.Pd.'),
      phone: newStudentPhone.trim() || '+62 812-3456-7890',
      gender: newStudentGender,
      nisn: generatedNisn,
      avatar: newStudentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      attendanceRate: Number(newStudentAttendance) || 90,
      modulesCompleted: 0,
      totalModules: newStudentPackage === 'Paket A' ? 8 : 10,
      averageScore: 82.5,
      statusKetercapaian: newStudentStatus,
      lastActive: 'Baru saja ditambahkan',
      attendanceUrl: newStudentAbsenUrl.trim() || undefined,
    };

    storageService.addStudentProgress(student);
    storageService.addNotification({
      title: `👤 Peserta Didik Baru Ditambahkan: ${student.studentName}`,
      message: `Siswa baru telah didaftarkan ke monitoring akademik pada program ${student.packageType} (${student.gradeLevel}) dengan NISN ${student.nisn}.`,
      category: 'akademik',
      isPushSent: true,
    });

    onRefreshData();
    setSelectedStudentId(newId);
    setIsAddStudentOpen(false);
    setStudentToast(`Siswa "${student.studentName}" berhasil didaftarkan!`);
    setTimeout(() => setStudentToast(null), 3000);
  };

  const handleOpenEditStudent = (s: StudentProgress) => {
    setEditingStudentData(s);
    setEditStudentName(s.studentName);
    setEditStudentNisn(s.nisn);
    setEditStudentPackage(s.packageType);
    setEditStudentGradeLevel(
      s.gradeLevel ||
      (s.packageType === 'Paket C'
        ? 'Kelas 12 IPS (Setara SMA)'
        : s.packageType === 'Paket B'
        ? 'Kelas 9 (Setara SMP)'
        : 'Kelas 6 (Setara SD)')
    );
    setEditStudentWaliKelas(
      s.waliKelasName ||
      (s.packageType === 'Paket C'
        ? 'Dra. Endang Sulistyowati, M.Pd.'
        : s.packageType === 'Paket B'
        ? 'Siti Rahmawati, S.Pd.'
        : 'Rahmat Hidayat, M.Pd.')
    );
    setEditStudentPhone(s.phone || '+62 812-3456-7890');
    setEditStudentGender(s.gender || 'Laki-laki');
    setEditStudentAttendance(s.attendanceRate || 90);
    setEditStudentStatus(s.statusKetercapaian || 'Optimal');
    setEditStudentAvatar(s.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
  };

  const handleSaveEditStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentData || !editStudentName.trim()) return;

    storageService.updateStudentProgress(editingStudentData.studentId, {
      studentName: editStudentName.trim(),
      nisn: editStudentNisn.trim() || editingStudentData.nisn,
      packageType: editStudentPackage,
      gradeLevel: editStudentGradeLevel.trim(),
      waliKelasName: editStudentWaliKelas.trim(),
      phone: editStudentPhone.trim(),
      gender: editStudentGender,
      attendanceRate: Number(editStudentAttendance) || editingStudentData.attendanceRate,
      statusKetercapaian: editStudentStatus,
      avatar: editStudentAvatar || editingStudentData.avatar,
    });

    storageService.addNotification({
      title: `✏️ Data Peserta Didik Diperbarui: ${editStudentName.trim()}`,
      message: `Informasi kelas, wali kelas, dan profil siswa telah diperbarui secara real-time.`,
      category: 'akademik',
      isPushSent: true,
    });

    onRefreshData();
    setEditingStudentData(null);
    setStudentToast(`Data siswa "${editStudentName.trim()}" berhasil disimpan!`);
    setTimeout(() => setStudentToast(null), 3000);
  };

  const handleDeleteStudentConfirm = () => {
    if (!studentToDelete) return;

    storageService.deleteStudentProgress(studentToDelete.studentId);
    storageService.addNotification({
      title: `🗑️ Siswa Dihapus: ${studentToDelete.studentName}`,
      message: `Data siswa ${studentToDelete.studentName} (${studentToDelete.packageType}) telah dihapus dari sistem.`,
      category: 'akademik',
      isPushSent: true,
    });

    onRefreshData();
    setStudentToast(`Siswa "${studentToDelete.studentName}" telah dihapus.`);
    setTimeout(() => setStudentToast(null), 3000);
    setStudentToDelete(null);
  };

  const handleOpenPhotoUpload = (s: StudentProgress) => {
    setStudentForPhotoUpload(s);
    setPhotoPreview(s.avatar);
  };

  const handleSavePhotoUpload = () => {
    if (!studentForPhotoUpload || !photoPreview) return;
    setIsPhotoSaving(true);
    storageService.updateStudentAvatar(studentForPhotoUpload.studentId, photoPreview);
    
    storageService.addNotification({
      title: `📷 Foto Profil Siswa Diperbarui: ${studentForPhotoUpload.studentName}`,
      message: `Foto siswa berhasil diunggah dan tersinkronisasi ke E-Rapor dan portal siswa.`,
      category: 'akademik',
      isPushSent: true,
    });

    onRefreshData();
    setIsPhotoSaving(false);
    setStudentForPhotoUpload(null);
    setStudentToast(`Foto siswa "${studentForPhotoUpload.studentName}" berhasil diperbarui!`);
    setTimeout(() => setStudentToast(null), 3000);
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !selectedStudent) return;

    const updated = storageService.addSubjectToStudent(selectedStudent.studentId, {
      subjectId: `sub-custom-${Date.now()}`,
      subjectName: newSubjectName.trim(),
      packageType: selectedStudent.packageType,
      tutorName: newSubjectTutor.trim(),
      kkm: Number(newSubjectKkm) || 75,
      tugas1: Number(newSubjectTugas1) || 0,
      tugas2: Number(newSubjectTugas2) || 0,
      ujianModul: Number(newSubjectUjianModul) || 0,
      ujianAkhir: Number(newSubjectUjianAkhir) || 0,
      catatanTutor: newSubjectCatatan.trim() || 'Aktif mengikuti kegiatan pembelajaran.',
    });

    setEditingGrades(updated);
    setIsAddSubjectOpen(false);
    setGradeSavedToast(true);
    setTimeout(() => setGradeSavedToast(false), 3000);
    onRefreshData();

    setNewSubjectName('');
    setNewSubjectTugas1(85);
    setNewSubjectTugas2(85);
    setNewSubjectUjianModul(85);
    setNewSubjectUjianAkhir(85);
  };

  const handleOpenEditSubject = (subject: StudentGrade) => {
    setEditingSubject(subject);
    setEditSubjectName(subject.subjectName);
    setEditSubjectTutor(subject.tutorName || 'Dra. Endang Sulistyowati, M.Pd.');
    setEditSubjectKkm(subject.kkm || 75);
    setEditSubjectTugas1(subject.tugas1 ?? 0);
    setEditSubjectTugas2(subject.tugas2 ?? 0);
    setEditSubjectUjianModul(subject.ujianModul ?? 0);
    setEditSubjectUjianAkhir(subject.ujianAkhir ?? 0);
    setEditSubjectCatatan(subject.catatanTutor || 'Aktif mengikuti kegiatan pembelajaran.');
  };

  const handleEditSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !selectedStudent || !editSubjectName.trim()) return;

    const updated = storageService.updateSubjectInStudent(
      selectedStudent.studentId,
      editingSubject.subjectId,
      {
        subjectName: editSubjectName.trim(),
        tutorName: editSubjectTutor.trim() || 'Dra. Endang Sulistyowati, M.Pd.',
        kkm: Number(editSubjectKkm) || 75,
        tugas1: Number(editSubjectTugas1) || 0,
        tugas2: Number(editSubjectTugas2) || 0,
        ujianModul: Number(editSubjectUjianModul) || 0,
        ujianAkhir: Number(editSubjectUjianAkhir) || 0,
        catatanTutor: editSubjectCatatan.trim() || 'Aktif mengikuti kegiatan pembelajaran.',
      }
    );

    setEditingGrades(updated);
    storageService.addNotification({
      title: `✏️ Mata Pelajaran Diperbarui: ${editSubjectName.trim()}`,
      message: `Data dan komponen penilaian mata pelajaran ${editSubjectName.trim()} (${selectedStudent.studentName}) berhasil diperbarui.`,
      category: 'akademik',
      isPushSent: true,
    });

    setGradeSavedToast(true);
    setTimeout(() => setGradeSavedToast(false), 3000);
    setEditingSubject(null);
    onRefreshData();
  };

  const handleDeleteSubjectConfirm = () => {
    if (!subjectToDelete || !selectedStudent) return;

    const updated = storageService.deleteSubjectFromStudent(
      selectedStudent.studentId,
      subjectToDelete.subjectId
    );

    setEditingGrades(updated);
    storageService.addNotification({
      title: `🗑️ Mata Pelajaran Dihapus: ${subjectToDelete.subjectName}`,
      message: `Mata pelajaran ${subjectToDelete.subjectName} telah dihapus dari daftar penilaian siswa ${selectedStudent.studentName}.`,
      category: 'akademik',
      isPushSent: true,
    });

    setSubjectToDelete(null);
    onRefreshData();
  };

  const handleSendBroadcastPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    // Trigger local push sound & system alert
    sendPush(notifTitle, notifMessage, notifCategory);

    // Save to notifications store
    storageService.addNotification({
      title: notifTitle,
      message: notifMessage,
      category: notifCategory,
      isPushSent: true,
    });

    setSendSuccessToast(true);
    setNotifTitle('');
    setNotifMessage('');
    setTimeout(() => setSendSuccessToast(false), 3500);
    onRefreshData();
  };

  const handleVerifyApplicant = (id: string, newStatus: StudentRegistration['status']) => {
    const list = storageService.getRegistrations();
    const updated = list.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
    storageService.saveRegistrations(updated);
    onRefreshData();
  };

  const handleOpenEditProfile = () => {
    setFormTeacherName(teacherProfile.name);
    setFormTeacherRole(teacherProfile.role);
    setFormTeacherBadge(teacherProfile.badge);
    setFormTeacherAvatar(teacherProfile.avatarText || 'TG');
    setFormTeacherNip(teacherProfile.nip || '');
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeacherName.trim()) return;

    const updated: TeacherProfile = {
      name: formTeacherName.trim(),
      role: formTeacherRole.trim() || 'Koordinator Kurikulum & Tutor Paket C',
      badge: formTeacherBadge.trim() || 'Pendidik Bersertifikasi',
      avatarText: formTeacherAvatar.trim().toUpperCase() || 'TG',
      nip: formTeacherNip.trim() || undefined,
    };

    storageService.saveTeacherProfile(updated);
    setTeacherProfile(updated);
    setIsEditProfileOpen(false);
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);

    storageService.addNotification({
      title: `👤 Identitas Pendidik Diperbarui`,
      message: `Profil tutor berhasil diubah menjadi ${updated.name} (${updated.role}).`,
      category: 'akademik',
      isPushSent: true,
    });
  };

  const handleResetProfile = () => {
    setFormTeacherName(DEFAULT_TEACHER_PROFILE.name);
    setFormTeacherRole(DEFAULT_TEACHER_PROFILE.role);
    setFormTeacherBadge(DEFAULT_TEACHER_PROFILE.badge);
    setFormTeacherAvatar(DEFAULT_TEACHER_PROFILE.avatarText || 'TG');
    setFormTeacherNip(DEFAULT_TEACHER_PROFILE.nip || '');
  };

  const handleOpenAddTeacher = () => {
    setEditingTeacherData(null);
    setTeacherNameInput('');
    setTeacherNipInput('');
    setTeacherRoleInput('Tutor Pengampu & Pembimbing');
    setTeacherPackagesInput(['Paket C']);
    setTeacherSubjectsInput('Bahasa Indonesia, Matematika Terapan');
    setTeacherIsWaliKelasInput(false);
    setTeacherWaliPackageInput('Paket C');
    setTeacherPhoneInput('+62 812-3456-7890');
    setTeacherEmailInput('tutor@pkbmmenara.sch.id');
    setTeacherAvatarInput('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
    setTeacherStatusInput('Aktif Mengajar');
    setTeacherEducationInput('S1 Pendidikan');
    setTeacherBioInput('Pendidik pendidikan nonformal kesetaraan berdedikasi tinggi.');
    setIsTeacherModalOpen(true);
  };

  const handleOpenEditTeacher = (t: TeacherTutor) => {
    setEditingTeacherData(t);
    setTeacherNameInput(t.name);
    setTeacherNipInput(t.nip || '');
    setTeacherRoleInput(t.roleTitle);
    setTeacherPackagesInput(t.packageTypes || ['Paket C']);
    setTeacherSubjectsInput(t.subjects.join(', '));
    setTeacherIsWaliKelasInput(!!t.isWaliKelas);
    setTeacherWaliPackageInput(t.waliKelasForPackage || 'Paket C');
    setTeacherPhoneInput(t.phone);
    setTeacherEmailInput(t.email);
    setTeacherAvatarInput(t.avatar);
    setTeacherStatusInput(t.status);
    setTeacherEducationInput(t.education);
    setTeacherBioInput(t.bio || '');
    setIsTeacherModalOpen(true);
  };

  const handleSaveTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherNameInput.trim()) return;

    const subjectsArr = teacherSubjectsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: teacherNameInput.trim(),
      nip: teacherNipInput.trim() || undefined,
      roleTitle: teacherRoleInput.trim() || 'Tutor Pengampu',
      packageTypes: teacherPackagesInput.length > 0 ? teacherPackagesInput : ['Paket C' as PackageType],
      subjects: subjectsArr.length > 0 ? subjectsArr : ['Materi Umum Kesetaraan'],
      isWaliKelas: teacherIsWaliKelasInput,
      waliKelasForPackage: teacherIsWaliKelasInput ? teacherWaliPackageInput : undefined,
      phone: teacherPhoneInput.trim() || '+62 812-0000-0000',
      email: teacherEmailInput.trim() || 'tutor@pkbmmenara.sch.id',
      avatar: teacherAvatarInput.trim() || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      status: teacherStatusInput,
      education: teacherEducationInput.trim() || 'S1 Pendidikan',
      bio: teacherBioInput.trim() || undefined,
    };

    if (editingTeacherData) {
      const updated = storageService.updateTeacher(editingTeacherData.id, payload);
      setTeacherList(updated);
      setTeacherToast(`Data guru "${payload.name}" berhasil diperbarui!`);
      storageService.addNotification({
        title: `✏️ Data Guru Diperbarui: ${payload.name}`,
        message: `Profil pendidik dan penugasan mengajar telah disinkronkan ke portal siswa.`,
        category: 'akademik',
        isPushSent: true,
      });
    } else {
      const updated = storageService.addTeacher(payload);
      setTeacherList(updated);
      setTeacherToast(`Guru baru "${payload.name}" berhasil didaftarkan!`);
      storageService.addNotification({
        title: `👨‍🏫 Guru Baru Didaftarkan: ${payload.name}`,
        message: `Pendidik baru resmi tercatat di database dan terkorelasi ke portal siswa.`,
        category: 'akademik',
        isPushSent: true,
      });
    }

    setTimeout(() => setTeacherToast(null), 3000);
    setIsTeacherModalOpen(false);
    onRefreshData();
  };

  const handleDeleteTeacherConfirm = () => {
    if (!teacherToDelete) return;
    const updated = storageService.deleteTeacher(teacherToDelete.id);
    setTeacherList(updated);
    setTeacherToast(`Guru "${teacherToDelete.name}" telah dihapus.`);
    storageService.addNotification({
      title: `🗑️ Data Guru Dihapus: ${teacherToDelete.name}`,
      message: `Pendidik telah dinonaktifkan dari sistem penugasan mengajar.`,
      category: 'akademik',
      isPushSent: true,
    });
    setTimeout(() => setTeacherToast(null), 3000);
    setTeacherToDelete(null);
    onRefreshData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleOpenEditProfile}
            className="relative group cursor-pointer text-left focus:outline-none shrink-0"
            title="Klik untuk ubah nama, gelar, dan inisial avatar pendidik"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shrink-0 group-hover:ring-2 group-hover:ring-amber-400 transition">
              {teacherProfile.avatarText || 'TG'}
            </div>
            <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150">
              <Pencil className="w-5 h-5 text-amber-300" />
            </div>
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black">Dasbor Guru & Pengelola Akademik</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                {teacherProfile.badge}
              </span>
              {profileSavedToast && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 animate-in fade-in flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Identitas Diperbarui</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs sm:text-sm text-slate-300">
                <span className="text-white font-semibold">{teacherProfile.name}</span> • {teacherProfile.role}
              </p>
              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 hover:text-amber-200 text-[11px] font-bold border border-white/15 transition active:scale-95 shadow-2xs group"
                title="Ganti / Kustomisasi Keterangan Nama, Gelar, dan Jabatan Guru"
              >
                <Pencil className="w-3 h-3 group-hover:rotate-12 transition duration-150" />
                <span>Ubah Keterangan</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingModule(null);
              setIsUploadMaterialOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            <Upload className="w-4 h-4 text-amber-300" />
            <span>Upload Materi Belajar Baru</span>
          </button>

          <button
            onClick={() => {
              const allMods = storageService.getModules();
              setEditingModule(allMods[0] || null);
              setIsUploadMaterialOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Materi Pembelajaran</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            <Bell className="w-4 h-4" />
            <span>Kirim Notifikasi Push Mendesak</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'students'
              ? 'bg-blue-800 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Daftar Siswa & Kelas ({studentsProgress.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('grades')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'grades'
              ? 'bg-blue-800 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Input & Manajemen Nilai</span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'teachers'
              ? 'bg-blue-800 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Guru & Tutor ({teacherList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'analytics'
              ? 'bg-blue-800 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analitik Real-Time</span>
        </button>

        <button
          onClick={() => setActiveTab('modules')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'modules'
              ? 'bg-blue-800 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Kelola Materi Belajar</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'announcements'
              ? 'bg-blue-800 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Broadcast Pengumuman</span>
        </button>

        <button
          onClick={() => setActiveTab('ppdb')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'ppdb'
              ? 'bg-blue-800 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Verifikasi PPDB ({registrations.length})</span>
        </button>
      </div>

      {/* Tab: Daftar Peserta Didik, Kelas & Wali Kelas */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="p-2 rounded-xl bg-white/10 text-amber-300">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Daftar Peserta Didik, Kelas & Wali Kelas
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-blue-200 max-w-2xl">
                Buku induk digital peserta didik PKBM Menara: pantau rombongan belajar (kelas), tutor wali kelas pendamping, foto profil siswa resmi, dan riwayat ketercapaian belajar.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/15">
                  ● {studentsProgress.length} Siswa Terdaftar
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                  {studentsProgress.filter((s) => s.packageType === 'Paket C').length} Siswa Paket C (SMA)
                </span>
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                  {studentsProgress.filter((s) => s.packageType === 'Paket B').length} Siswa Paket B (SMP)
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  {studentsProgress.filter((s) => s.packageType === 'Paket A').length} Siswa Paket A (SD)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddStudent}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-lg transition active:scale-95 flex items-center gap-2 shrink-0"
            >
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span>+ Tambah Siswa Baru</span>
            </button>
          </div>

          {/* Filter & Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Jenjang/Kelas:</span>
              </span>
              {['Semua', 'Paket A', 'Paket B', 'Paket C'].map((pkg) => (
                <button
                  key={pkg}
                  type="button"
                  onClick={() => setStudentFilterPackage(pkg)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    studentFilterPackage === pkg
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pkg}
                </button>
              ))}

              <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

              <span className="text-xs font-bold text-slate-500 mr-1">Status:</span>
              {['Semua', 'Sangat Baik', 'Optimal', 'Perlu Pendampingan'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStudentFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    studentFilterStatus === st
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="Cari nama, NISN, wali kelas..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setStudentViewMode('table')}
                  className={`p-1.5 rounded-lg transition ${
                    studentViewMode === 'table'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan Tabel Rinci"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setStudentViewMode('cards')}
                  className={`p-1.5 rounded-lg transition ${
                    studentViewMode === 'cards'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan Kartu Foto"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Student Content: Filtered List */}
          {(() => {
            const filteredStudents = studentsProgress.filter((s) => {
              const matchPkg =
                studentFilterPackage === 'Semua' || s.packageType === studentFilterPackage;
              const matchStatus =
                studentFilterStatus === 'Semua' || s.statusKetercapaian === studentFilterStatus;
              const q = studentSearchQuery.toLowerCase();
              const matchQuery =
                s.studentName.toLowerCase().includes(q) ||
                s.nisn.toLowerCase().includes(q) ||
                (s.gradeLevel && s.gradeLevel.toLowerCase().includes(q)) ||
                (s.waliKelasName && s.waliKelasName.toLowerCase().includes(q));
              return matchPkg && matchStatus && matchQuery;
            });

            if (filteredStudents.length === 0) {
              return (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                  <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-base">Tidak ada siswa yang sesuai filter</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Silakan ubah kata kunci pencarian atau filter jenjang, atau tambahkan siswa baru.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentFilterPackage('Semua');
                      setStudentFilterStatus('Semua');
                      setStudentSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                  >
                    Reset Filter
                  </button>
                </div>
              );
            }

            // View 1: Detailed Table View
            if (studentViewMode === 'table') {
              return (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-4 py-3.5">Foto Siswa</th>
                          <th className="px-4 py-3.5">Nama & NISN</th>
                          <th className="px-4 py-3.5">Kelas & Jenjang</th>
                          <th className="px-4 py-3.5">Wali Kelas Pendamping</th>
                          <th className="px-3 py-3.5 text-center">Kehadiran</th>
                          <th className="px-3 py-3.5 text-center">Rata-rata Nilai</th>
                          <th className="px-3 py-3.5 text-center">Status</th>
                          <th className="px-4 py-3.5 text-center">Aksi & Upload Foto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map((s) => {
                          const displayGradeLevel =
                            s.gradeLevel ||
                            (s.packageType === 'Paket C'
                              ? 'Kelas 12 IPS (Setara SMA)'
                              : s.packageType === 'Paket B'
                              ? 'Kelas 9 (Setara SMP)'
                              : 'Kelas 6 (Setara SD)');
                          
                          const displayWaliKelas =
                            s.waliKelasName ||
                            (s.packageType === 'Paket C'
                              ? 'Dra. Endang Sulistyowati, M.Pd.'
                              : s.packageType === 'Paket B'
                              ? 'Siti Rahmawati, S.Pd.'
                              : 'Rahmat Hidayat, M.Pd.');

                          return (
                            <tr key={s.studentId} className="hover:bg-blue-50/40 transition group">
                              {/* Foto with quick upload overlay */}
                              <td className="px-4 py-3">
                                <div className="relative group/avatar inline-block">
                                  <img
                                    src={s.avatar}
                                    alt={s.studentName}
                                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPhotoUpload(s)}
                                    className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition duration-150 cursor-pointer text-amber-300"
                                    title="Upload / Ganti Foto Siswa Ini"
                                  >
                                    <Camera className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>

                              {/* Nama & NISN */}
                              <td className="px-4 py-3">
                                <div className="space-y-0.5">
                                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">
                                    {s.studentName}
                                  </span>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold border border-slate-200">
                                      NISN: {s.nisn}
                                    </span>
                                    {s.gender && (
                                      <span className="text-[10px] text-slate-400">
                                        • {s.gender}
                                      </span>
                                    )}
                                  </div>
                                  {s.phone && (
                                    <span className="text-[10px] text-slate-400 font-mono block">
                                      {s.phone}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Kelas & Jenjang */}
                              <td className="px-4 py-3">
                                <div className="space-y-1">
                                  <span className="font-bold text-slate-800 block">
                                    {displayGradeLevel}
                                  </span>
                                  <span
                                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                      s.packageType === 'Paket C'
                                        ? 'bg-blue-50 text-blue-900 border-blue-200'
                                        : s.packageType === 'Paket B'
                                        ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                                        : 'bg-amber-50 text-amber-900 border-amber-200'
                                    }`}
                                  >
                                    {s.packageType}
                                  </span>
                                </div>
                              </td>

                              {/* Wali Kelas Pendamping */}
                              <td className="px-4 py-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-blue-950">
                                      {displayWaliKelas}
                                    </span>
                                  </div>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 font-bold text-[10px] border border-amber-200">
                                    <span>★ Wali Kelas {s.packageType}</span>
                                  </span>
                                </div>
                              </td>

                              {/* Kehadiran */}
                              <td className="px-3 py-3 text-center">
                                <span className="font-bold font-mono text-emerald-700 block">
                                  {s.attendanceRate}%
                                </span>
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${Math.min(100, s.attendanceRate)}%` }}
                                  />
                                </div>
                              </td>

                              {/* Rata-rata Nilai */}
                              <td className="px-3 py-3 text-center">
                                <span className="font-black font-mono text-slate-900 text-xs">
                                  {s.averageScore}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  {s.modulesCompleted}/{s.totalModules} Modul
                                </span>
                              </td>

                              {/* Status */}
                              <td className="px-3 py-3 text-center">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                    s.statusKetercapaian === 'Sangat Baik'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : s.statusKetercapaian === 'Optimal'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}
                                >
                                  {s.statusKetercapaian}
                                </span>
                              </td>

                              {/* Action Buttons */}
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                  {/* Upload Foto Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPhotoUpload(s)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] transition border border-purple-200 shadow-2xs"
                                    title="Upload / Ganti Foto Profil Siswa"
                                  >
                                    <Camera className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Upload Foto</span>
                                  </button>

                                  {/* Edit Siswa Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditStudent(s)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] transition border border-amber-200 shadow-2xs"
                                    title="Edit Biodata Siswa, Kelas & Wali Kelas"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>

                                  {/* Input Nilai Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedStudentId(s.studentId);
                                      setActiveTab('grades');
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] transition border border-blue-200 shadow-2xs"
                                    title="Input dan Kelola Nilai E-Rapor Siswa Ini"
                                  >
                                    <Award className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Kelola Nilai</span>
                                  </button>

                                  {/* Hapus Siswa Button */}
                                  <button
                                    type="button"
                                    onClick={() => setStudentToDelete(s)}
                                    className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition border border-rose-200 shadow-2xs"
                                    title="Hapus Peserta Didik"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }

            // View 2: Cards / Album Grid View
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((s) => {
                  const displayGradeLevel =
                    s.gradeLevel ||
                    (s.packageType === 'Paket C'
                      ? 'Kelas 12 IPS (Setara SMA)'
                      : s.packageType === 'Paket B'
                      ? 'Kelas 9 (Setara SMP)'
                      : 'Kelas 6 (Setara SD)');
                  
                  const displayWaliKelas =
                    s.waliKelasName ||
                    (s.packageType === 'Paket C'
                      ? 'Dra. Endang Sulistyowati, M.Pd.'
                      : s.packageType === 'Paket B'
                      ? 'Siti Rahmawati, S.Pd.'
                      : 'Rahmat Hidayat, M.Pd.');

                  return (
                    <div
                      key={s.studentId}
                      className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-4 group"
                    >
                      <div className="space-y-4">
                        {/* Avatar & Header */}
                        <div className="flex items-start gap-4">
                          <div className="relative group/avatar shrink-0">
                            <img
                              src={s.avatar}
                              alt={s.studentName}
                              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-200 shadow-md"
                            />
                            <button
                              type="button"
                              onClick={() => handleOpenPhotoUpload(s)}
                              className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition duration-150 cursor-pointer text-amber-300"
                              title="Upload / Ganti Foto Siswa"
                            >
                              <Camera className="w-6 h-6" />
                            </button>
                          </div>

                          <div className="min-w-0 flex-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border mb-1 inline-block ${
                                s.statusKetercapaian === 'Sangat Baik'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : s.statusKetercapaian === 'Optimal'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {s.statusKetercapaian}
                            </span>
                            <h4 className="font-black text-slate-900 text-base leading-snug line-clamp-1" title={s.studentName}>
                              {s.studentName}
                            </h4>
                            <p className="text-[11px] font-mono text-slate-400 mt-0.5">NISN: {s.nisn}</p>
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-bold mt-1 inline-block">
                              {s.packageType}
                            </span>
                          </div>
                        </div>

                        {/* Kelas & Wali Kelas */}
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">
                              Rombel / Kelas:
                            </span>
                            <strong className="text-slate-800 text-xs">{displayGradeLevel}</strong>
                          </div>

                          <div className="pt-1.5 border-t border-slate-200/60">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">
                              Wali Kelas Pendamping:
                            </span>
                            <strong className="text-blue-900 text-xs flex items-center gap-1">
                              <span>★ {displayWaliKelas}</span>
                            </strong>
                          </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Kehadiran:</span>
                            <strong className="text-emerald-700 font-mono">{s.attendanceRate}%</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Rata-rata Nilai:</span>
                            <strong className="text-amber-700 font-mono">{s.averageScore}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenPhotoUpload(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] transition border border-purple-200 shadow-2xs"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Ganti Foto</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditStudent(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] transition border border-amber-200 shadow-2xs"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentId(s.studentId);
                              setActiveTab('grades');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] transition shadow-2xs"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-300" />
                            <span>Nilai</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentToDelete(s)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition border border-rose-200 shadow-2xs"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

        </div>
      )}

      {/* Tab: Grade Management & E-Rapor Input */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          {/* Student Selector Card for Grade Management */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {selectedStudent?.avatar ? (
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.studentName}
                  className="w-12 h-12 rounded-2xl object-cover shadow-sm shrink-0 border border-blue-200"
                />
              ) : (
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Pilih Siswa yang Dikelola Nilainya
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    {selectedStudent?.packageType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    NISN: {selectedStudent?.nisn}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nilai yang diinput akan otomatis tersinkronisasi ke E-Rapor resmi dan portal belajar siswa.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full sm:w-auto pl-3.5 pr-8 py-2.5 text-xs font-bold rounded-xl border-2 border-blue-600 bg-blue-50/60 text-blue-950 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-xs"
              >
                {studentsProgress.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.studentName} — {s.packageType} (NISN: {s.nisn})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setIsAddStudentOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold shadow-md transition active:scale-95 shrink-0"
                title="Daftarkan Siswa Baru"
              >
                <UserPlus className="w-4 h-4 text-amber-300" />
                <span>+ Tambah Siswa</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Input Nilai & Manajemen E-Rapor</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                  {selectedStudent?.studentName} ({editingGrades.length} Mapel)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Nilai Akhir dihitung otomatis dengan formula: 20% Tugas 1 + 20% Tugas 2 + 30% Ujian Modul + 30% UPK.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {gradeSavedToast && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
                  <CheckCircle className="w-4 h-4" />
                  <span>Nilai Berhasil Disimpan!</span>
                </span>
              )}

              <button
                onClick={() => setIsAddSubjectOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md transition active:scale-95"
              >
                <BookPlus className="w-4 h-4 text-amber-300" />
                <span>+ Tambah Mata Pelajaran</span>
              </button>

              <button
                onClick={handleSaveAllGrades}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition active:scale-95"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Simpan Perubahan Nilai</span>
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-3 text-center">KKM</th>
                    <th className="py-3 px-3 text-center">Tugas 1 (20%)</th>
                    <th className="py-3 px-3 text-center">Tugas 2 (20%)</th>
                    <th className="py-3 px-3 text-center">Ujian Modul (30%)</th>
                    <th className="py-3 px-3 text-center">Ujian Akhir (30%)</th>
                    <th className="py-3 px-3 text-center">Nilai Akhir</th>
                    <th className="py-3 px-3 text-center">Predikat</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {editingGrades.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-slate-600">Belum ada mata pelajaran untuk siswa ini.</p>
                        <p className="text-xs text-slate-400 mt-0.5">Klik "+ Tambah Mata Pelajaran" untuk menambahkan mata pelajaran baru.</p>
                      </td>
                    </tr>
                  ) : (
                    editingGrades.map((g) => (
                      <tr key={g.subjectId} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {g.subjectName}
                          <span className="block text-[10px] text-slate-400 font-normal">Tutor: {g.tutorName}</span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-slate-500">{g.kkm}</td>
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={g.tugas1}
                            onChange={(e) =>
                              handleGradeInputChange(g.subjectId, 'tugas1', parseInt(e.target.value) || 0)
                            }
                            className="w-16 px-2 py-1 text-center font-mono font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={g.tugas2}
                            onChange={(e) =>
                              handleGradeInputChange(g.subjectId, 'tugas2', parseInt(e.target.value) || 0)
                            }
                            className="w-16 px-2 py-1 text-center font-mono font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={g.ujianModul}
                            onChange={(e) =>
                              handleGradeInputChange(g.subjectId, 'ujianModul', parseInt(e.target.value) || 0)
                            }
                            className="w-16 px-2 py-1 text-center font-mono font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={g.ujianAkhir}
                            onChange={(e) =>
                              handleGradeInputChange(g.subjectId, 'ujianAkhir', parseInt(e.target.value) || 0)
                            }
                            className="w-16 px-2 py-1 text-center font-mono font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-extrabold text-blue-900 text-sm">
                          {g.nilaiAkhir}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded font-mono font-bold text-xs ${
                              g.predikat === 'A'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {g.predikat}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditSubject(g)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 text-xs font-bold transition shadow-2xs active:scale-95 group"
                              title={`Edit detail mata pelajaran ${g.subjectName}`}
                            >
                              <Pencil className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition duration-150" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSubjectToDelete(g)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-800 text-xs font-bold transition shadow-2xs active:scale-95 group"
                              title={`Hapus mata pelajaran ${g.subjectName}`}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition duration-150" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Manajemen & Edit Materi Belajar Guru */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-700" />
                <h3 className="text-lg font-black text-slate-900">Manajemen Materi & E-Modul Pembelajaran</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bapak/Ibu Guru dapat mengunggah modul baru, menautkan link cloud/Kemdikbud, atau mengedit materi yang sudah ada.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://rumah.pendidikan.go.id/ruang/murid"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold shadow-2xs transition active:scale-95"
                title="Buka portal materi resmi Kemendikbud: Rumah Pendidikan (Ruang Murid)"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-700" />
                <span>Rumah Pendidikan (Ruang Murid)</span>
              </a>

              <button
                onClick={() => {
                  setEditingModule(null);
                  setIsUploadMaterialOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>+ Upload Materi Baru</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari judul modul, mapel, atau tutor..."
                  value={moduleSearch}
                  onChange={(e) => setModuleSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['Semua', 'Paket A', 'Paket B', 'Paket C'].map((pkg) => (
                <button
                  key={pkg}
                  onClick={() => setModulePackageFilter(pkg)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    modulePackageFilter === pkg
                      ? 'bg-blue-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pkg}
                </button>
              ))}
            </div>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {storageService.getModules()
              .filter((m) => {
                const matchPkg = modulePackageFilter === 'Semua' || m.packageType === modulePackageFilter;
                const matchQuery =
                  m.title.toLowerCase().includes(moduleSearch.toLowerCase()) ||
                  m.subject.toLowerCase().includes(moduleSearch.toLowerCase()) ||
                  m.tutorName.toLowerCase().includes(moduleSearch.toLowerCase());
                return matchPkg && matchQuery;
              })
              .map((mod) => (
                <div
                  key={mod.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Cover thumbnail */}
                    <div className="relative h-36 bg-slate-900 overflow-hidden">
                      <img
                        src={mod.coverImage}
                        alt={mod.title}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold border border-white/20">
                          {mod.packageType}
                        </span>
                        {mod.gradeLevel && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold shadow-xs flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            <span>{mod.gradeLevel}</span>
                          </span>
                        )}
                      </div>

                      {/* Class description bottom overlay on cover */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-2.5 pt-4 flex items-center justify-between text-white z-10">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Kelas: {mod.gradeLevel || (mod.packageType === 'Paket A' ? 'Setara SD' : mod.packageType === 'Paket B' ? 'Setara SMP' : 'Setara SMA')}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-300 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                          Modul {mod.moduleNumber}
                        </span>
                      </div>

                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
                        <button
                          onClick={() => {
                            setEditingModule(mod);
                            setIsUploadMaterialOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-md transition flex items-center gap-1 active:scale-95"
                          title="Edit materi pembelajaran ini"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4.5 space-y-2.5">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                          {mod.subject}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                          {mod.title}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {mod.description}
                      </p>

                      <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          {mod.chapters?.length || 0} Bab Bacaan
                        </span>
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                          {mod.quiz?.questionsCount || 0} Soal Kuis
                        </span>
                        {mod.moduleUrl && (
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                            <LinkIcon className="w-2.5 h-2.5" />
                            <span>Link E-Modul</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
                    <span className="text-[11px] text-slate-500 truncate">
                      Tutor: <strong className="text-slate-700">{mod.tutorName.split(',')[0]}</strong>
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {mod.moduleUrl && (
                        <a
                          href={mod.moduleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-blue-700 hover:border-blue-400 transition"
                          title="Buka link modul"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setEditingModule(mod);
                          setIsUploadMaterialOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-2xs"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit Materi</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 3: Real-Time Analytics & Correlation Dashboard */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Top Live Sync Header */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sinkronisasi Real-Time Aktif</span>
                </span>
                <span className="text-xs text-slate-400">
                  Data E-Rapor & Direktori Guru Terkoneksi Langsung
                </span>
              </div>
              <h3 className="text-xl font-black text-white">
                Analitik Real-Time: Performa Akademik & Beban Pendidik
              </h3>
              <p className="text-xs text-slate-300">
                Memantau capaian belajar peserta didik, korelasi nilai per guru pengampu, serta efisiensi pendampingan tutor per program kesetaraan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRefreshData}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition active:scale-95 flex items-center gap-1.5"
              >
                <span>Perbarui Data Real-Time</span>
              </button>
            </div>
          </div>

          {/* Quick Dynamic Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Siswa Aktif
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {studentsProgress.length}
                </span>
                <span className="text-xs text-emerald-600 font-bold">Peserta Didik</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {studentsProgress.filter((s) => s.packageType === 'Paket C').length} Paket C •{' '}
                {studentsProgress.filter((s) => s.packageType === 'Paket B').length} Paket B •{' '}
                {studentsProgress.filter((s) => s.packageType === 'Paket A').length} Paket A
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Guru / Tutor
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-blue-700">
                  {teacherList.length}
                </span>
                <span className="text-xs text-blue-600 font-bold">Pendidik</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Rasio: 1 Guru : {(studentsProgress.length / (teacherList.length || 1)).toFixed(1)} Siswa
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Rata-rata Nilai Siswa
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-600">
                  {(
                    studentsProgress.reduce((acc, s) => acc + (s.averageScore || 80), 0) /
                    (studentsProgress.length || 1)
                  ).toFixed(1)}
                </span>
                <span className="text-xs text-amber-700 font-bold">Predikat Baik (B+)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                KKM Standar: 75.0 (Kelulusan UPK: {analytics.passingRateUPK}%)
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Tingkat Kehadiran Live
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                  {(
                    studentsProgress.reduce((acc, s) => acc + (s.attendanceRate || 85), 0) /
                    (studentsProgress.length || 1)
                  ).toFixed(1)}%
                </span>
                <span className="text-xs text-emerald-700 font-bold">Optimal</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {analytics.moduleCompletionRate}% Target Modul Terselesaikan
              </p>
            </div>
          </div>

          {/* Real-Time Correlation Section: Student & Tutor Live Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-base">
                      Korelasi Real-Time: Siswa & Guru Pengampu
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Terkorelasi Portal Siswa
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pilih nama peserta didik untuk meninjau korelasi nilai mata pelajaran, guru pengampu yang membimbing, dan status rapor.
                  </p>
                </div>
              </div>

              {/* Student Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 shrink-0">Pilih Siswa:</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="pl-3.5 pr-8 py-2 text-xs font-bold rounded-xl border-2 border-blue-600 bg-blue-50/70 text-blue-950 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  {studentsProgress.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.studentName} ({s.packageType}) — {s.statusKetercapaian}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Student Real-Time Banner */}
            {selectedStudent && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedStudent.avatar}
                    alt={selectedStudent.studentName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="font-black text-lg text-white">{selectedStudent.studentName}</h5>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold">
                        {selectedStudent.packageType}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        {selectedStudent.statusKetercapaian}
                      </span>
                    </div>
                    <p className="text-xs text-blue-200 mt-0.5">
                      NISN: <span className="font-mono text-amber-300 font-bold">{selectedStudent.nisn}</span> • Kehadiran: <strong className="text-emerald-400">{selectedStudent.attendanceRate}%</strong> • Modul Tuntas: <strong className="text-amber-300">{selectedStudent.modulesCompleted}/{selectedStudent.totalModules}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/15 text-center">
                    <span className="text-[10px] text-blue-200 uppercase font-bold block">Rata-rata Nilai</span>
                    <span className="text-2xl font-black text-amber-300">
                      {editingGrades.length > 0
                        ? Math.round(editingGrades.reduce((a, b) => a + b.nilaiAkhir, 0) / editingGrades.length)
                        : selectedStudent.averageScore}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('grades')}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition active:scale-95"
                  >
                    Input Nilai Siswa Ini
                  </button>
                </div>
              </div>
            )}

            {/* Correlated Subject Grades Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Transkrip Nilai & Guru Pengampu ({editingGrades.length} Mata Pelajaran)
                </span>
                <span className="text-[11px] text-slate-400">
                  Sinkron langsung ke E-Rapor siswa
                </span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Mata Pelajaran</th>
                      <th className="px-4 py-3">Guru / Tutor Pengampu</th>
                      <th className="px-3 py-3 text-center">KKM</th>
                      <th className="px-3 py-3 text-center">Tugas 1</th>
                      <th className="px-3 py-3 text-center">Tugas 2</th>
                      <th className="px-3 py-3 text-center">Ujian Modul</th>
                      <th className="px-3 py-3 text-center">Ujian Akhir</th>
                      <th className="px-3 py-3 text-center">Nilai Akhir</th>
                      <th className="px-3 py-3 text-center">Predikat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {editingGrades.map((g, idx) => (
                      <tr key={g.subjectId || idx} className="hover:bg-blue-50/40 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {g.subjectName}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-blue-900">{g.tutorName}</span>
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-slate-600">{g.kkm}</td>
                        <td className="px-3 py-3 text-center font-mono">{g.tugas1}</td>
                        <td className="px-3 py-3 text-center font-mono">{g.tugas2}</td>
                        <td className="px-3 py-3 text-center font-mono">{g.ujianModul}</td>
                        <td className="px-3 py-3 text-center font-mono">{g.ujianAkhir}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-lg font-mono font-black text-xs ${
                            g.nilaiAkhir >= g.kkm
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {g.nilaiAkhir}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-black text-xs text-slate-800">{g.predikat}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Section: Matriks Beban Mengajar & Direktori Tutor */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-700" />
                  <span>Matriks Beban Mengajar Seluruh Guru ({teacherList.length} Tutor)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekapitulasi penugasan mata pelajaran, jenjang paket binaan, dan beban jam tatap muka per minggu.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('teachers')}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Users className="w-4 h-4" />
                <span>Buka Menu Kelola Guru</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Nama Guru / Tutor</th>
                    <th className="px-4 py-3">Jabatan & Kualifikasi</th>
                    <th className="px-3 py-3">Jenjang Paket</th>
                    <th className="px-4 py-3">Mata Pelajaran yang Diampu</th>
                    <th className="px-3 py-3 text-center">Siswa Binaan</th>
                    <th className="px-3 py-3 text-center">Tatap Muka/Mg</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-center">Aksi Kontak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teacherList.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={t.avatar}
                            alt={t.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{t.name}</span>
                            {t.nip && (
                              <span className="text-[10px] text-slate-400 font-mono">NIP: {t.nip}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800 block">{t.roleTitle}</span>
                        <span className="text-[10px] text-slate-400 italic">{t.education}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {t.packageTypes.map((p, pIdx) => (
                            <span
                              key={pIdx}
                              className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold"
                            >
                              {p}
                            </span>
                          ))}
                          {t.isWaliKelas && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                              Wali Kelas
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-600 line-clamp-1">{t.subjects.join(', ')}</span>
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-slate-800">
                        {t.totalStudentsMentored || 20} Siswa
                      </td>
                      <td className="px-3 py-3 text-center font-mono text-slate-600">
                        {t.attendanceHoursPerWeek || 16} Jam
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                          {t.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <a
                          href={`https://wa.me/${t.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition"
                        >
                          <Phone className="w-3 h-3" />
                          <span>WA</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enrollment Distribution & School Program Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Enrollment Distribution */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Distribusi Siswa Menurut Paket</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Paket C (Setara SMA)</span>
                    <span className="text-blue-900 font-bold">{analytics.activeStudentsPaketC} Siswa (50%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Paket B (Setara SMP)</span>
                    <span className="text-indigo-900 font-bold">{analytics.activeStudentsPaketB} Siswa (31%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '31%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Paket A (Setara SD)</span>
                    <span className="text-amber-900 font-bold">{analytics.activeStudentsPaketA} Siswa (19%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '19%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Indikator Mutu & Kelulusan</h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <span className="font-medium text-emerald-900">Kelulusan Ujian UPK:</span>
                  <strong className="text-emerald-700 text-base">{analytics.passingRateUPK}%</strong>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                  <span className="font-medium text-blue-900">Tingkat Kehadiran:</span>
                  <strong className="text-blue-700 text-base">{analytics.averageAttendance}%</strong>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                  <span className="font-medium text-purple-900">Penyelesaian Modul:</span>
                  <strong className="text-purple-700 text-base">{analytics.moduleCompletionRate}%</strong>
                </div>
              </div>
            </div>

            {/* PPDB Admissions summary */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Rekapitulasi Pendaftaran PPDB</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Total Pendaftar Masuk:</span>
                  <strong className="font-bold text-slate-900">{analytics.totalNewApplicants} Calon Siswa</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Berkas Terverifikasi:</span>
                  <strong className="font-bold text-emerald-700">{analytics.verifiedApplicants} Berkas</strong>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-600">Menunggu Tata Usaha:</span>
                  <strong className="font-bold text-amber-600">5 Berkas</strong>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab: Menu Daftar Guru / Tutor */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="p-2 rounded-xl bg-white/10 text-amber-300">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Direktori & Manajemen Guru / Tutor Pengampu
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-blue-200 max-w-2xl">
                Kelola data dewan pendidik PKBM Menara, penugasan mata pelajaran, penunjukan wali kelas per paket, serta nomor kontak bimbingan belajar yang terkorelasi langsung pada portal siswa.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/15">
                  ● {teacherList.length} Pendidik Terdaftar
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                  ★ {teacherList.filter((t) => t.isWaliKelas).length} Wali Kelas Ditugaskan
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  ✓ {teacherList.filter((t) => t.status === 'Aktif Mengajar').length} Aktif Mengajar
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddTeacher}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-lg transition active:scale-95 flex items-center gap-2 shrink-0"
            >
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span>+ Tambah Guru / Tutor Baru</span>
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter Jenjang:</span>
              </span>
              {['Semua', 'Paket A', 'Paket B', 'Paket C'].map((pkg) => (
                <button
                  key={pkg}
                  type="button"
                  onClick={() => setTeacherFilterPackage(pkg)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    teacherFilterPackage === pkg
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pkg}
                </button>
              ))}

              <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={teacherOnlyWaliKelas}
                  onChange={(e) => setTeacherOnlyWaliKelas(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Hanya Wali Kelas</span>
              </label>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                placeholder="Cari nama, NIP, peran, atau mata pelajaran..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Teacher Cards Grid */}
          {(() => {
            const filteredTeachers = teacherList.filter((t) => {
              const matchPkg =
                teacherFilterPackage === 'Semua' ||
                t.packageTypes.includes(teacherFilterPackage as PackageType);
              const matchWali = !teacherOnlyWaliKelas || t.isWaliKelas;
              const q = teacherSearch.toLowerCase();
              const matchSearch =
                t.name.toLowerCase().includes(q) ||
                (t.nip && t.nip.toLowerCase().includes(q)) ||
                t.roleTitle.toLowerCase().includes(q) ||
                t.subjects.some((s) => s.toLowerCase().includes(q));
              return matchPkg && matchWali && matchSearch;
            });

            if (filteredTeachers.length === 0) {
              return (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                  <Users className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-base">Tidak ada guru/tutor yang sesuai filter</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Silakan ubah filter jenjang paket atau kata kunci pencarian Anda, atau tambahkan data guru baru.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherFilterPackage('Semua');
                      setTeacherOnlyWaliKelas(false);
                      setTeacherSearch('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                  >
                    Reset Filter
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeachers.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between gap-5 group"
                  >
                    <div className="space-y-4">
                      {/* Top Header Card */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-100 shadow-sm shrink-0 group-hover:scale-105 transition duration-200"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {t.isWaliKelas && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] border border-amber-200 shadow-2xs">
                                ★ Wali Kelas {t.waliKelasForPackage || ''}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                t.status === 'Aktif Mengajar'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-slate-900 text-base leading-snug truncate" title={t.name}>
                            {t.name}
                          </h4>
                          <p className="text-xs text-blue-800 font-semibold line-clamp-1">{t.roleTitle}</p>
                          {t.nip && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">NIP: {t.nip}</p>
                          )}
                        </div>
                      </div>

                      {/* Package Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Jenjang:</span>
                        {t.packageTypes.map((p, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200"
                          >
                            {p}
                          </span>
                        ))}
                      </div>

                      {/* Subjects tags */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Mata Pelajaran yang Diampu:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {t.subjects.map((sub, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200/80"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Education & Bio */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span>🎓</span>
                          <span>{t.education}</span>
                        </p>
                        {t.bio && (
                          <p className="text-[11px] text-slate-500 leading-relaxed italic line-clamp-2">
                            "{t.bio}"
                          </p>
                        )}
                      </div>

                      {/* Contact & Hours */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Siswa Binaan:</span>
                          <strong className="text-slate-800">{t.totalStudentsMentored || 24} Siswa</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Beban Tatap Muka:</span>
                          <strong className="text-slate-800">{t.attendanceHoursPerWeek || 18} Jam/Minggu</strong>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <a
                        href={`https://wa.me/${t.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Halo ${t.name}, konfirmasi jadwal bimbingan dan kurikulum dari PKBM Menara.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition border border-emerald-200"
                        title="Hubungi lewat WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTeacher(t)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition border border-amber-200 shadow-2xs"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTeacherToDelete(t)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition border border-rose-200 shadow-2xs"
                          title="Hapus data pendidik"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

        </div>
      )}

      {/* Tab 4: Push Notification Broadcast */}
      {activeTab === 'announcements' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Broadcast Pengumuman & Push Alert Otomatis</h3>
              <p className="text-xs text-slate-500">
                Pesan akan langsung dikirimkan ke seluruh siswa, memicu suara denting, serta notifikasi push browser.
              </p>
            </div>

            {sendSuccessToast && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Notifikasi Berhasil Disebarkan!</strong> Seluruh siswa terdaftar telah menerima pembaruan ini.
                </span>
              </div>
            )}

            <form onSubmit={handleSendBroadcastPush} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Pengumuman
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'urgent' as const, label: 'Mendesak' },
                    { id: 'jadwal' as const, label: 'Jadwal Belajar' },
                    { id: 'akademik' as const, label: 'Modul / Nilai' },
                    { id: 'pengumuman' as const, label: 'Umum' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNotifCategory(cat.id)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition ${
                        notifCategory === cat.id
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Notifikasi *
                </label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="Contoh: Jadwal Ujian Tengah Semester Paket C Dimajukan"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Isi Pesan Detail *
                </label>
                <textarea
                  rows={4}
                  required
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Tuliskan instruksi atau pengumuman yang wajib dibaca oleh peserta didik dan wali murid..."
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>Kirim Notifikasi Push Sekarang (Real-Time)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 5: PPDB Admissions Management */}
      {activeTab === 'ppdb' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Meja Verifikasi Berkas PPDB Online</h3>
              <p className="text-xs text-slate-500">
                Verifikasi dokumen NIK, Kartu Keluarga, dan Ijazah calon peserta didik baru.
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-xs">
              {registrations.length} Pendaftaran Masuk
            </span>
          </div>

          <div className="space-y-4">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {reg.regNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        reg.status === 'Diterima'
                          ? 'bg-emerald-100 text-emerald-800'
                          : reg.status === 'Diverifikasi'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {reg.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base">{reg.fullName}</h4>
                  <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Program: <strong>{reg.packageType}</strong> ({reg.track})</span>
                    <span>NIK: <strong className="font-mono">{reg.nik}</strong></span>
                    <span>No. HP: <strong>{reg.phone}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleVerifyApplicant(reg.id, 'Diverifikasi')}
                    className="px-3 py-1.5 rounded-xl border border-blue-300 text-blue-800 bg-blue-50 hover:bg-blue-100 text-xs font-semibold transition"
                  >
                    Setujui Berkas
                  </button>
                  <button
                    onClick={() => handleVerifyApplicant(reg.id, 'Diterima')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Terima Siswa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload & Edit Material Modal */}
      <TeacherUploadMaterialModal
        isOpen={isUploadMaterialOpen}
        onClose={() => {
          setIsUploadMaterialOpen(false);
          setEditingModule(null);
        }}
        moduleToEdit={editingModule}
        initialMode={editingModule ? 'edit' : 'create'}
        onMaterialUploaded={() => {
          onRefreshData();
        }}
      />

      {/* Modal Tambah Siswa Baru */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-amber-300">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Tambah Siswa Baru</h3>
                  <p className="text-[11px] text-blue-200">
                    Daftarkan peserta didik baru, tentukan kelas, wali kelas & upload foto
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              
              {/* Foto Siswa Upload Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-800 text-xs">
                  Foto Profil Peserta Didik (Upload dari Perangkat atau Pilih Contoh)
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group shrink-0">
                    <img
                      src={newStudentAvatar}
                      alt="Preview"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
                    />
                    <label
                      htmlFor="newStudentPhotoInput"
                      className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer text-amber-300"
                      title="Klik untuk upload foto"
                    >
                      <Camera className="w-6 h-6" />
                    </label>
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      id="newStudentPhotoInput"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageFileChange(file, (dataUrl) => setNewStudentAvatar(dataUrl));
                        }
                      }}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400">
                      Format JPG, PNG, WEBP. Otomatis dikompresi untuk penyimpanan cepat.
                    </p>
                    
                    {/* Quick Avatar Presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { label: 'Siswa Laki-laki 1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
                        { label: 'Siswa Perempuan 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
                        { label: 'Perempuan Hijab', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
                        { label: 'Siswa Laki-laki 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewStudentAvatar(preset.url)}
                          className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-900 text-[10px] font-semibold transition"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nama & NISN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Contoh: Rian Hidayat Kusuma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Induk Siswa (NISN)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={newStudentNisn}
                    onChange={(e) => setNewStudentNisn(e.target.value)}
                    placeholder="10 digit (opsional)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Kosongkan untuk otomatisasi nomor Dapodik
                  </span>
                </div>
              </div>

              {/* Jenjang Paket & Rombel / Kelas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Program Pendidikan Kesetaraan *
                  </label>
                  <select
                    value={newStudentPackage}
                    onChange={(e) => {
                      const pkg = e.target.value as PackageType;
                      setNewStudentPackage(pkg);
                      if (pkg === 'Paket C') {
                        setNewStudentGradeLevel('Kelas 12 IPS (Setara SMA)');
                        setNewStudentWaliKelas('Dra. Endang Sulistyowati, M.Pd.');
                      } else if (pkg === 'Paket B') {
                        setNewStudentGradeLevel('Kelas 9 (Setara SMP)');
                        setNewStudentWaliKelas('Siti Rahmawati, S.Pd.');
                      } else {
                        setNewStudentGradeLevel('Kelas 6 (Setara SD)');
                        setNewStudentWaliKelas('Rahmat Hidayat, M.Pd.');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold bg-white"
                  >
                    <option value="Paket C">Paket C (Setara SMA)</option>
                    <option value="Paket B">Paket B (Setara SMP)</option>
                    <option value="Paket A">Paket A (Setara SD)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Rombongan Belajar (Kelas) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentGradeLevel}
                    onChange={(e) => setNewStudentGradeLevel(e.target.value)}
                    placeholder="Contoh: Kelas 12 IPS (Setara SMA)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Wali Kelas Pendamping & Kontak HP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tutor Wali Kelas Pendamping *
                  </label>
                  <select
                    value={newStudentWaliKelas}
                    onChange={(e) => setNewStudentWaliKelas(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold bg-white"
                  >
                    {teacherList.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} {t.isWaliKelas ? `(Wali Kelas ${t.waliKelasForPackage || ''})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jenis Kelamin & No. WhatsApp
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newStudentGender}
                      onChange={(e) => setNewStudentGender(e.target.value as 'Laki-laki' | 'Perempuan')}
                      className="px-2.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold bg-white"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                    <input
                      type="text"
                      value={newStudentPhone}
                      onChange={(e) => setNewStudentPhone(e.target.value)}
                      placeholder="+62 812-..."
                      className="px-2.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Target Kehadiran & Status Ketercapaian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Kehadiran Awal (%): <strong className="text-blue-700">{newStudentAttendance}%</strong>
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={newStudentAttendance}
                    onChange={(e) => setNewStudentAttendance(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status Ketercapaian Awal
                  </label>
                  <select
                    value={newStudentStatus}
                    onChange={(e) =>
                      setNewStudentStatus(e.target.value as 'Sangat Baik' | 'Optimal' | 'Perlu Pendampingan')
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold bg-white"
                  >
                    <option value="Optimal">Optimal (Sesuai Kurikulum)</option>
                    <option value="Sangat Baik">Sangat Baik (Unggul)</option>
                    <option value="Perlu Pendampingan">Perlu Pendampingan</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                  <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Sinkronisasi Otomatis Seluruh Fitur</span>
                </div>
                <p className="text-[11px] text-blue-700/90 leading-relaxed">
                  Siswa baru langsung terkoneksi ke <strong>Daftar Peserta Didik</strong>, portal siswa, modul <strong>Input & Manajemen Nilai</strong>, dan dokumen cetak E-Rapor.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4 text-amber-300" />
                  <span>Simpan & Daftarkan Siswa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Data Siswa, Kelas & Wali Kelas */}
      {editingStudentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20 text-white">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Edit Data Peserta Didik</h3>
                  <p className="text-[11px] text-amber-100">
                    Perbarui nama, NISN, penugasan kelas, wali kelas, dan foto siswa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingStudentData(null)}
                className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudentSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              
              {/* Foto Siswa Upload & Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-800 text-xs">
                  Foto Profil Siswa
                </label>
                
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <img
                      src={editStudentAvatar}
                      alt={editStudentName}
                      className="w-18 h-18 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
                    />
                    <label
                      htmlFor="editStudentPhotoInput"
                      className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer text-amber-300"
                      title="Upload foto baru"
                    >
                      <Camera className="w-6 h-6" />
                    </label>
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      id="editStudentPhotoInput"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageFileChange(file, (dataUrl) => setEditStudentAvatar(dataUrl));
                        }
                      }}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                    />
                    <input
                      type="url"
                      value={editStudentAvatar}
                      onChange={(e) => setEditStudentAvatar(e.target.value)}
                      placeholder="Atau tempel URL gambar..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-[11px] font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Nama & NISN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={editStudentName}
                    onChange={(e) => setEditStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Induk Siswa (NISN) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editStudentNisn}
                    onChange={(e) => setEditStudentNisn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-mono"
                  />
                </div>
              </div>

              {/* Jenjang Paket & Kelas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Program Paket *
                  </label>
                  <select
                    value={editStudentPackage}
                    onChange={(e) => setEditStudentPackage(e.target.value as PackageType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold bg-white"
                  >
                    <option value="Paket C">Paket C (Setara SMA)</option>
                    <option value="Paket B">Paket B (Setara SMP)</option>
                    <option value="Paket A">Paket A (Setara SD)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Rombel / Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    value={editStudentGradeLevel}
                    onChange={(e) => setEditStudentGradeLevel(e.target.value)}
                    placeholder="Contoh: Kelas 12 IPS (Setara SMA)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Wali Kelas & No HP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Wali Kelas Pendamping *
                  </label>
                  <select
                    value={editStudentWaliKelas}
                    onChange={(e) => setEditStudentWaliKelas(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold bg-white"
                  >
                    {teacherList.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} {t.isWaliKelas ? `(Wali Kelas ${t.waliKelasForPackage || ''})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    No. WhatsApp Siswa / Wali
                  </label>
                  <input
                    type="text"
                    value={editStudentPhone}
                    onChange={(e) => setEditStudentPhone(e.target.value)}
                    placeholder="+62 812-..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-mono"
                  />
                </div>
              </div>

              {/* Kehadiran & Status Ketercapaian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tingkat Kehadiran (%): <strong className="text-amber-700">{editStudentAttendance}%</strong>
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={editStudentAttendance}
                    onChange={(e) => setEditStudentAttendance(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600 mt-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status Ketercapaian
                  </label>
                  <select
                    value={editStudentStatus}
                    onChange={(e) =>
                      setEditStudentStatus(e.target.value as 'Sangat Baik' | 'Optimal' | 'Perlu Pendampingan')
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold bg-white"
                  >
                    <option value="Sangat Baik">Sangat Baik</option>
                    <option value="Optimal">Optimal</option>
                    <option value="Perlu Pendampingan">Perlu Pendampingan</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudentData(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-white" />
                  <span>Simpan Perubahan Siswa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Khusus Upload / Ganti Foto Profil Siswa */}
      {studentForPhotoUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20 text-white">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Upload Foto Peserta Didik</h3>
                  <p className="text-[11px] text-purple-200">
                    {studentForPhotoUpload.studentName} ({studentForPhotoUpload.packageType})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStudentForPhotoUpload(null)}
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
                    src={photoPreview}
                    alt={studentForPhotoUpload.studentName}
                    className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-xl ring-2 ring-purple-500"
                  />
                  <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-purple-600 text-white shadow-md">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="font-extrabold text-slate-900 text-sm">{studentForPhotoUpload.studentName}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">NISN: {studentForPhotoUpload.nisn}</p>
                  <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-2.5 py-0.5 rounded-full mt-1 inline-block">
                    {studentForPhotoUpload.gradeLevel || studentForPhotoUpload.packageType}
                  </span>
                </div>
              </div>

              {/* File Upload Drop Area */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  Pilih File Foto dari Komputer / Handphone:
                </label>
                <div className="border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl p-5 text-center transition cursor-pointer bg-purple-50/40 hover:bg-purple-50 relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageFileChange(file, (dataUrl) => setPhotoPreview(dataUrl));
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-purple-600 mx-auto mb-1.5" />
                  <p className="font-bold text-purple-900 text-xs">
                    Klik atau Seret (Drag & Drop) Foto ke Sini
                  </p>
                  <p className="text-[10px] text-purple-600 mt-0.5">
                    Mendukung JPG, PNG, WEBP (Kamera HP & Galeri Foto)
                  </p>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Atau Pilih Contoh Foto Siswa Standar:
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
                      onClick={() => setPhotoPreview(preset.url)}
                      className={`p-1 rounded-xl border text-center transition ${
                        photoPreview === preset.url
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
                  onClick={() => setStudentForPhotoUpload(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isPhotoSaving}
                  onClick={handleSavePhotoUpload}
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

      {/* Modal Dialog Konfirmasi Hapus Siswa */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20 text-white">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Hapus Peserta Didik</h3>
                  <p className="text-[11px] text-rose-100">
                    Konfirmasi penghapusan data siswa
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Tindakan ini tidak dapat dibatalkan</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus data peserta didik <strong className="text-slate-900 font-semibold">{studentToDelete.studentName}</strong>?
                </p>
                <div className="text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-rose-100 space-y-1">
                  <p>• NISN: <strong>{studentToDelete.nisn}</strong></p>
                  <p>• Kelas: <strong>{studentToDelete.gradeLevel || studentToDelete.packageType}</strong></p>
                  <p>• Wali Kelas: <strong>{studentToDelete.waliKelasName || '-'}</strong></p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStudentToDelete(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteStudentConfirm}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4 text-amber-200" />
                  <span>Ya, Hapus Siswa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Student Notification Toast */}
      {studentToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300">
            <CheckCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">{studentToast}</span>
        </div>
      )}

      {/* Modal Tambah / Input Mata Pelajaran Baru */}
      {isAddSubjectOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-amber-300">
                  <BookPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Tambah / Input Mata Pelajaran Baru</h3>
                  <p className="text-[11px] text-emerald-200">
                    Untuk Siswa: <strong className="text-white">{selectedStudent.studentName}</strong> ({selectedStudent.packageType})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddSubjectOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubjectSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Mata Pelajaran *
                </label>
                <input
                  type="text"
                  required
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Contoh: Bahasa Inggris Komunikasi / Sosiologi Terapan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tutor Pengampu
                  </label>
                  <input
                    type="text"
                    value={newSubjectTutor}
                    onChange={(e) => setNewSubjectTutor(e.target.value)}
                    placeholder="Nama Tutor & Gelar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    KKM (Kriteria Ketuntasan Minimal)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={newSubjectKkm}
                    onChange={(e) => setNewSubjectKkm(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Nilai 4 Komponen */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Komponen Penilaian (0 - 100)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                    <span className="block text-[10px] text-slate-500 font-semibold mb-1">Tugas 1 (20%)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newSubjectTugas1}
                      onChange={(e) => setNewSubjectTugas1(Number(e.target.value))}
                      className="w-full py-1 text-center font-mono font-bold text-slate-900 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    />
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                    <span className="block text-[10px] text-slate-500 font-semibold mb-1">Tugas 2 (20%)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newSubjectTugas2}
                      onChange={(e) => setNewSubjectTugas2(Number(e.target.value))}
                      className="w-full py-1 text-center font-mono font-bold text-slate-900 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    />
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                    <span className="block text-[10px] text-slate-500 font-semibold mb-1">Ujian Modul (30%)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newSubjectUjianModul}
                      onChange={(e) => setNewSubjectUjianModul(Number(e.target.value))}
                      className="w-full py-1 text-center font-mono font-bold text-slate-900 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    />
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                    <span className="block text-[10px] text-slate-500 font-semibold mb-1">Ujian Akhir (30%)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newSubjectUjianAkhir}
                      onChange={(e) => setNewSubjectUjianAkhir(Number(e.target.value))}
                      className="w-full py-1 text-center font-mono font-bold text-slate-900 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              {(() => {
                const calculatedFinal = Math.round(
                  newSubjectTugas1 * 0.2 +
                  newSubjectTugas2 * 0.2 +
                  newSubjectUjianModul * 0.3 +
                  newSubjectUjianAkhir * 0.3
                );
                let calculatedPredikat: 'A' | 'B' | 'C' | 'D' = 'D';
                if (calculatedFinal >= 85) calculatedPredikat = 'A';
                else if (calculatedFinal >= 75) calculatedPredikat = 'B';
                else if (calculatedFinal >= 60) calculatedPredikat = 'C';

                const isTuntas = calculatedFinal >= newSubjectKkm;

                return (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Kalkulasi Nilai Akhir Otomatis</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xl font-black font-mono text-emerald-950">{calculatedFinal}</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-bold text-xs">
                          Predikat {calculatedPredikat}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${isTuntas ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-100 text-rose-800'}`}>
                        {isTuntas ? '✓ Tuntas KKM' : 'Belum Tuntas'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Perkembangan Peserta Didik
                </label>
                <textarea
                  rows={2}
                  value={newSubjectCatatan}
                  onChange={(e) => setNewSubjectCatatan(e.target.value)}
                  placeholder="Tuliskan catatan apresiasi atau pendampingan belajar..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <BookPlus className="w-4 h-4 text-amber-300" />
                  <span>Simpan Mata Pelajaran Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Mata Pelajaran */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-amber-300">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Edit Mata Pelajaran</h3>
                  <p className="text-[11px] text-blue-200">
                    Perbarui nama mapel, tutor pengampu, KKM, dan komponen nilai untuk {selectedStudent?.studentName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubject(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubjectSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Mata Pelajaran *
                </label>
                <input
                  type="text"
                  required
                  value={editSubjectName}
                  onChange={(e) => setEditSubjectName(e.target.value)}
                  placeholder="Contoh: Matematika Terapan Paket C"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tutor / Pendidik Pengampu
                  </label>
                  <input
                    type="text"
                    value={editSubjectTutor}
                    onChange={(e) => setEditSubjectTutor(e.target.value)}
                    placeholder="Nama tutor..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Batas KKM (Ketuntasan Minimal)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={editSubjectKkm}
                    onChange={(e) => setEditSubjectKkm(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Nilai 4 Komponen */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Komponen Penilaian (0 - 100)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                    <span className="block text-[10px] text-slate-500 font-semibold mb-1">Tugas 1 (20%)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editSubjectTugas1}
                      onChange={(e) => setEditSubjectTugas1(Number(e.target.value))}
                      className="w-full py-1 text-center font-mono font-bold text-slate-900 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                    />
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                    <span className="block text-[10px] text-slate-500 font-semibold mb-1">Tugas 2 (20%)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editSubjectTugas2}
                      onChange={(e) => setEditSubjectTugas2(Number(e.target.value))}
                      className="w-full py-1 text-center font-mono font-bold text-slate-900 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                    />
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                    <span className="block text-[10px] text-slate-500 font-semibold mb-1">Ujian Modul (30%)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editSubjectUjianModul}
                      onChange={(e) => setEditSubjectUjianModul(Number(e.target.value))}
                      className="w-full py-1 text-center font-mono font-bold text-slate-900 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                    />
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                    <span className="block text-[10px] text-slate-500 font-semibold mb-1">Ujian Akhir (30%)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editSubjectUjianAkhir}
                      onChange={(e) => setEditSubjectUjianAkhir(Number(e.target.value))}
                      className="w-full py-1 text-center font-mono font-bold text-slate-900 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              {(() => {
                const calculatedFinal = Math.round(
                  editSubjectTugas1 * 0.2 +
                  editSubjectTugas2 * 0.2 +
                  editSubjectUjianModul * 0.3 +
                  editSubjectUjianAkhir * 0.3
                );
                let calculatedPredikat: 'A' | 'B' | 'C' | 'D' = 'D';
                if (calculatedFinal >= 85) calculatedPredikat = 'A';
                else if (calculatedFinal >= 75) calculatedPredikat = 'B';
                else if (calculatedFinal >= 60) calculatedPredikat = 'C';

                const isTuntas = calculatedFinal >= editSubjectKkm;

                return (
                  <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-800 block">Kalkulasi Nilai Akhir Otomatis</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xl font-black font-mono text-blue-950">{calculatedFinal}</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-700 text-white font-mono font-bold text-xs">
                          Predikat {calculatedPredikat}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${isTuntas ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                        {isTuntas ? '✓ Tuntas KKM' : 'Belum Tuntas'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Perkembangan Peserta Didik
                </label>
                <textarea
                  rows={2}
                  value={editSubjectCatatan}
                  onChange={(e) => setEditSubjectCatatan(e.target.value)}
                  placeholder="Tuliskan catatan apresiasi atau pendampingan belajar..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Simpan Perubahan Mata Pelajaran</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Mata Pelajaran */}
      {subjectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20 text-white">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Hapus Mata Pelajaran</h3>
                  <p className="text-[11px] text-rose-100">
                    Konfirmasi penghapusan mata pelajaran
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubjectToDelete(null)}
                className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Tindakan ini tidak dapat dibatalkan</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus mata pelajaran <strong className="text-slate-900 font-semibold">{subjectToDelete.subjectName}</strong> dari transkrip penilaian siswa <strong className="text-slate-900 font-semibold">{selectedStudent?.studentName}</strong>?
                </p>
                <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-rose-100">
                  <p>• Tutor: <strong>{subjectToDelete.tutorName}</strong></p>
                  <p>• Nilai Akhir Saat Ini: <strong>{subjectToDelete.nilaiAkhir} ({subjectToDelete.predikat})</strong></p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubjectToDelete(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubjectConfirm}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4 text-amber-200" />
                  <span>Ya, Hapus Mata Pelajaran</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ubah Keterangan & Identitas Guru / Pendidik */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-amber-300">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Ubah Identitas & Keterangan Guru</h3>
                  <p className="text-[11px] text-blue-200">
                    Kustomisasi nama pengajar, gelar, jabatan, dan inisial avatar dasbor
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-xs">
              
              {/* Quick Presets */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  ⚡ Pilihan Cepat Profil Tutor / Pengelola
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    {
                      name: 'Dra. Endang Sulistyowati, M.Pd.',
                      role: 'Koordinator Kurikulum & Tutor Paket C',
                      badge: 'Pendidik Bersertifikasi',
                      avatar: 'ES',
                    },
                    {
                      name: 'Bambang Pamungkas, S.Pd.',
                      role: 'Tutor Vokasi & Keterampilan Komputer',
                      badge: 'Instruktur Vokasi',
                      avatar: 'BP',
                    },
                    {
                      name: 'Siti Rahmawati, S.Pd.',
                      role: 'Wali Kelas & Tutor IPA Paket B',
                      badge: 'Pendidik Bersertifikasi',
                      avatar: 'SR',
                    },
                    {
                      name: 'Rahmat Hidayat, M.Pd.',
                      role: 'Kepala Satuan PKBM Menara',
                      badge: 'Kepala PKBM',
                      avatar: 'RH',
                    },
                    {
                      name: 'Ahmad Fauzi, S.Kom.',
                      role: 'Tutor Kewirausahaan Digital & TIK',
                      badge: 'Tutor Keahlian',
                      avatar: 'AF',
                    },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormTeacherName(preset.name);
                        setFormTeacherRole(preset.role);
                        setFormTeacherBadge(preset.badge);
                        setFormTeacherAvatar(preset.avatar);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-900 text-slate-700 text-[11px] font-semibold transition active:scale-95"
                    >
                      {preset.name.split(',')[0]} ({preset.role.split('&')[0].trim()})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar Pendidik *
                </label>
                <input
                  type="text"
                  required
                  value={formTeacherName}
                  onChange={(e) => setFormTeacherName(e.target.value)}
                  placeholder="Contoh: Dra. Endang Sulistyowati, M.Pd."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jabatan, Bidang Tugas & Keterangan *
                </label>
                <input
                  type="text"
                  required
                  value={formTeacherRole}
                  onChange={(e) => setFormTeacherRole(e.target.value)}
                  placeholder="Contoh: Koordinator Kurikulum & Tutor Paket C"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Label Lencana / Status
                  </label>
                  <input
                    type="text"
                    value={formTeacherBadge}
                    onChange={(e) => setFormTeacherBadge(e.target.value)}
                    placeholder="Contoh: Pendidik Bersertifikasi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Inisial Avatar (Maksimal 3 Huruf)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={formTeacherAvatar}
                    onChange={(e) => setFormTeacherAvatar(e.target.value.toUpperCase())}
                    placeholder="Contoh: TG atau ES"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nomor Induk Pegawai / NUPTK (Opsional)
                </label>
                <input
                  type="text"
                  value={formTeacherNip}
                  onChange={(e) => setFormTeacherNip(e.target.value)}
                  placeholder="Contoh: 19820415 200801 2 014"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono"
                />
              </div>

              {/* Live Preview Card */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Pratinjau Tampilan Header Banner:
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-base shadow-md shrink-0">
                    {formTeacherAvatar || 'TG'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-black text-xs text-white truncate">Dasbor Guru & Pengelola Akademik</h4>
                      <span className="px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                        {formTeacherBadge || 'Pendidik'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate mt-0.5">
                      <span className="text-white font-semibold">{formTeacherName || 'Nama Pendidik'}</span> • {formTeacherRole || 'Keterangan Tugas'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetProfile}
                  className="text-slate-500 hover:text-rose-600 underline text-xs transition"
                >
                  ↺ Kembalikan ke Standar
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4 text-amber-300" />
                    <span>Simpan Perubahan Identitas</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Data Guru & Tutor */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-amber-300">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingTeacherData ? 'Edit Data Guru / Tutor' : 'Tambah Guru / Tutor Baru'}
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    {editingTeacherData
                      ? 'Perbarui informasi profil, penugasan mata pelajaran, dan kontak pendidik'
                      : 'Daftarkan pendidik baru ke database dan sinkronkan ke portal siswa'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTeacherModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveTeacherSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              
              {/* Nama Lengkap & NIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap & Gelar Pendidik *
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherNameInput}
                    onChange={(e) => setTeacherNameInput(e.target.value)}
                    placeholder="Contoh: Dra. Hj. Nurjanah, M.Pd."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIP / NUPTK (Opsional)
                  </label>
                  <input
                    type="text"
                    value={teacherNipInput}
                    onChange={(e) => setTeacherNipInput(e.target.value)}
                    placeholder="Contoh: 19850312 201001 2 008"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono"
                  />
                </div>
              </div>

              {/* Jabatan & Status Keaktifan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jabatan / Peran Pendidik *
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherRoleInput}
                    onChange={(e) => setTeacherRoleInput(e.target.value)}
                    placeholder="Contoh: Tutor Bahasa & Koordinator Pembelajaran"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status Keaktifan Mengajar
                  </label>
                  <select
                    value={teacherStatusInput}
                    onChange={(e) =>
                      setTeacherStatusInput(
                        e.target.value as 'Aktif Mengajar' | 'Cuti' | 'Tugas Belajar'
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold bg-white"
                  >
                    <option value="Aktif Mengajar">Aktif Mengajar</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Tugas Belajar">Tugas Belajar</option>
                  </select>
                </div>
              </div>

              {/* Jenjang Paket yang Diampu */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Jenjang Program Kesetaraan yang Diampu *
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['Paket A', 'Paket B', 'Paket C'] as PackageType[]).map((pkg) => {
                    const isChecked = teacherPackagesInput.includes(pkg);
                    return (
                      <button
                        key={pkg}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            if (teacherPackagesInput.length > 1) {
                              setTeacherPackagesInput((prev) => prev.filter((p) => p !== pkg));
                            }
                          } else {
                            setTeacherPackagesInput((prev) => [...prev, pkg]);
                          }
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                          isChecked
                            ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isChecked ? `✓ ${pkg}` : `+ ${pkg}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mata Pelajaran yang Diampu */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mata Pelajaran yang Diampu (Pisahkan dengan tanda koma) *
                </label>
                <input
                  type="text"
                  required
                  value={teacherSubjectsInput}
                  onChange={(e) => setTeacherSubjectsInput(e.target.value)}
                  placeholder="Contoh: Bahasa Indonesia, Sosiologi Terapan, Literasi Budaya"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Mata pelajaran ini akan otomatis terhubung ke pilihan input nilai dan transkrip portal siswa.
                </span>
              </div>

              {/* Penugasan Wali Kelas */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="waliKelasCheckbox"
                    checked={teacherIsWaliKelasInput}
                    onChange={(e) => setTeacherIsWaliKelasInput(e.target.checked)}
                    className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="waliKelasCheckbox" className="font-bold text-slate-900 cursor-pointer text-xs">
                    Tugaskan Sebagai Wali Kelas Utama
                  </label>
                </div>

                {teacherIsWaliKelasInput && (
                  <div className="animate-in fade-in duration-150 pl-6">
                    <label className="block font-bold text-amber-950 mb-1 text-[11px]">
                      Pilih Jenjang Paket untuk Wali Kelas Ini:
                    </label>
                    <select
                      value={teacherWaliPackageInput}
                      onChange={(e) => setTeacherWaliPackageInput(e.target.value as PackageType)}
                      className="w-full sm:w-64 px-3 py-2 rounded-xl border border-amber-300 bg-white text-slate-900 font-bold text-xs outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Paket A">Wali Kelas Paket A (Setara SD)</option>
                      <option value="Paket B">Wali Kelas Paket B (Setara SMP)</option>
                      <option value="Paket C">Wali Kelas Paket C (Setara SMA)</option>
                    </select>
                    <p className="text-[10px] text-amber-800 mt-1">
                      Wali kelas akan otomatis ditampilkan sebagai pembimbing resmi di portal siswa dan penandatangan E-Rapor jenjang tersebut.
                    </p>
                  </div>
                )}
              </div>

              {/* Kontak: Telepon & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    No. WhatsApp / Telepon *
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherPhoneInput}
                    onChange={(e) => setTeacherPhoneInput(e.target.value)}
                    placeholder="+62 812-3456-7890"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Digunakan untuk tombol konsultasi WhatsApp siswa
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Alamat Email Resmi *
                  </label>
                  <input
                    type="email"
                    required
                    value={teacherEmailInput}
                    onChange={(e) => setTeacherEmailInput(e.target.value)}
                    placeholder="nama.guru@pkbmmenara.sch.id"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                  />
                </div>
              </div>

              {/* Foto Avatar & Pilihan Cepat */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  URL Foto Profil / Avatar Pendidik
                </label>
                <input
                  type="url"
                  value={teacherAvatarInput}
                  onChange={(e) => setTeacherAvatarInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono"
                />
                
                {/* Avatar Quick Presets */}
                <div className="mt-2 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">
                    Atau Pilih Cepat Foto Contoh:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Wanita Formal', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' },
                      { label: 'Pria Pendidik', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80' },
                      { label: 'Wanita Hijab', url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=200&auto=format&fit=crop&q=80' },
                      { label: 'Pria Senior', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
                      { label: 'Tutor Muda', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTeacherAvatarInput(preset.url)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-900 text-slate-700 text-[11px] font-semibold transition border border-slate-200"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kualifikasi Pendidikan & Bio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kualifikasi Pendidikan Terakhir *
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherEducationInput}
                    onChange={(e) => setTeacherEducationInput(e.target.value)}
                    placeholder="Contoh: S1 Pendidikan Bahasa - Universitas Negeri"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Catatan Dedikasi / Bio Ringkas
                  </label>
                  <input
                    type="text"
                    value={teacherBioInput}
                    onChange={(e) => setTeacherBioInput(e.target.value)}
                    placeholder="Contoh: Pengajar aktif metode kontekstual dan vokasi mandiri."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>{editingTeacherData ? 'Simpan Perubahan Guru' : 'Simpan & Daftarkan Guru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Hapus Guru */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20 text-white">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Hapus Data Guru / Tutor</h3>
                  <p className="text-[11px] text-rose-100">
                    Konfirmasi penonaktifan pendidik
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Tindakan ini akan menghapus guru dari direktori</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus data pendidik <strong className="text-slate-900 font-semibold">{teacherToDelete.name}</strong>?
                </p>
                <div className="text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-rose-100 space-y-1">
                  <p>• Jabatan: <strong>{teacherToDelete.roleTitle}</strong></p>
                  <p>• Jenjang: <strong>{teacherToDelete.packageTypes.join(', ')}</strong></p>
                  <p>• Mapel: <strong>{teacherToDelete.subjects.join(', ')}</strong></p>
                  {teacherToDelete.isWaliKelas && (
                    <p className="text-amber-800 font-bold">★ Perhatian: Pendidik ini saat ini berstatus Wali Kelas {teacherToDelete.waliKelasForPackage}.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTeacherToDelete(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTeacherConfirm}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4 text-amber-200" />
                  <span>Ya, Hapus Pendidik</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Teacher Notification Toast */}
      {teacherToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300">
            <CheckCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">{teacherToast}</span>
        </div>
      )}

    </div>
  );
};
