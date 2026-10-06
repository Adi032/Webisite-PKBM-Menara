export type PackageType = 'Paket A' | 'Paket B' | 'Paket C';

export interface UserRole {
  id: 'guest' | 'student' | 'teacher' | 'parent';
  name: string;
  label: string;
  avatar: string;
}

export interface StudentRegistration {
  id: string;
  regNumber: string;
  fullName: string;
  nik: string;
  nisn?: string;
  gender: 'Laki-laki' | 'Perempuan';
  birthPlace: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  packageType: PackageType;
  track: 'Reguler (Tatap Muka & Daring)' | 'Kelas Mandiri / Pekerja' | 'Beasiswa Afirmasi';
  lastEducation: string;
  parentName: string;
  parentPhone: string;
  status: 'Menunggu Verifikasi' | 'Diverifikasi' | 'Diterima' | 'Butuh Revisi';
  submittedAt: string;
  documents: {
    ktpOrKia: boolean;
    kartuKeluarga: boolean;
    ijazahTerakhir: boolean;
    pasFoto: boolean;
  };
}

export interface LearningModule {
  id: string;
  title: string;
  subject: string;
  packageType: PackageType;
  gradeLevel: string; // e.g. "Kelas 6", "Kelas 9", "Kelas 12"
  moduleNumber: number;
  durationMinutes: number;
  description: string;
  tutorName: string;
  coverImage: string;
  totalChapters: number;
  completedChapters: number;
  isDownloadedOffline?: boolean;
  moduleUrl?: string; // Tautan / Link Modul Belajar (Google Drive, E-Modul Kemdikbud, Canva, dsb)
  moduleLinkTitle?: string; // Judul / Keterangan Tautan Modul
  moduleLinkType?: 'drive' | 'kemdikbud' | 'canva' | 'youtube' | 'website' | 'other';
  documentFileName?: string;
  additionalLinks?: {
    id: string;
    title: string;
    url: string;
    type?: string;
  }[];
  chapters: {
    id: string;
    title: string;
    content: string;
    videoUrl?: string;
  }[];
  quiz: {
    id: string;
    questionsCount: number;
    bestScore?: number;
    questions: {
      id: string;
      question: string;
      options: string[];
      correctAnswerIndex: number;
      explanation: string;
    }[];
  };
}

export interface StudentGrade {
  studentId?: string;
  subjectId: string;
  subjectName: string;
  packageType: PackageType;
  tutorName: string;
  kkm: number; // Kriteria Ketuntasan Minimal (e.g. 75)
  tugas1: number;
  tugas2: number;
  ujianModul: number;
  ujianAkhir: number;
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  catatanTutor: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  packageType: PackageType;
  date: string;
  sessionTitle: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  tutorNote?: string;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  packageType: PackageType;
  gradeLevel?: string; // e.g. "Kelas 12 IPS (Setara SMA)", "Kelas 9 (Setara SMP)", "Kelas 6 (Setara SD)"
  waliKelasName?: string; // e.g. "Dra. Endang Sulistyowati, M.Pd."
  phone?: string;
  gender?: 'Laki-laki' | 'Perempuan';
  nisn: string;
  avatar: string;
  attendanceRate: number; // percentage
  modulesCompleted: number;
  totalModules: number;
  averageScore: number;
  statusKetercapaian: 'Sangat Baik' | 'Optimal' | 'Perlu Pendampingan';
  lastActive: string;
  attendanceUrl?: string;
}

export interface InvoiceBill {
  id: string;
  invoiceNumber: string;
  title: string;
  category: 'SPP Bulanan' | 'Biaya Modul & Bahan Ajar' | 'Ujian Kesetaraan UPK' | 'Uang Registrasi PPDB';
  amount: number;
  dueDate: string;
  status: 'Lunas' | 'Belum Dibayar' | 'Kedaluwarsa';
  paidAt?: string;
  paymentMethod?: string;
  transactionRef?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'urgent' | 'jadwal' | 'pengumuman' | 'akademik';
  timestamp: string;
  isRead: boolean;
  isPushSent?: boolean;
  actionUrl?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'teacher' | 'parent' | 'admin';
  recipientId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface AnalyticsSummary {
  totalStudents: number;
  activeStudentsPaketA: number;
  activeStudentsPaketB: number;
  activeStudentsPaketC: number;
  averageAttendance: number;
  moduleCompletionRate: number;
  passingRateUPK: number;
  totalNewApplicants: number;
  verifiedApplicants: number;
}

export interface TeacherTutor {
  id: string;
  name: string;
  nip?: string;
  packageTypes: PackageType[];
  subjects: string[];
  roleTitle: string;
  isWaliKelas?: boolean;
  waliKelasForPackage?: PackageType;
  phone: string;
  email: string;
  avatar: string;
  status: 'Aktif Mengajar' | 'Cuti' | 'Tugas Belajar';
  education: string;
  bio?: string;
  totalStudentsMentored?: number;
  attendanceHoursPerWeek?: number;
}

