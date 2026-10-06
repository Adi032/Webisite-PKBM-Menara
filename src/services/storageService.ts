import {
  StudentRegistration,
  LearningModule,
  StudentGrade,
  InvoiceBill,
  NotificationItem,
  ChatMessage,
  AnalyticsSummary,
  StudentProgress,
  PackageType,
  TeacherTutor,
} from '../types';
import {
  INITIAL_REGISTRATIONS,
  INITIAL_MODULES,
  INITIAL_GRADES,
  INITIAL_INVOICES,
  INITIAL_NOTIFICATIONS,
  INITIAL_CHATS,
  INITIAL_ANALYTICS,
  INITIAL_STUDENTS_PROGRESS,
  INITIAL_TEACHERS,
} from '../data/mockData';

const STORAGE_KEYS = {
  REGISTRATIONS: 'pkbm_registrations_v1',
  MODULES: 'pkbm_modules_v1',
  GRADES: 'pkbm_grades_v1',
  INVOICES: 'pkbm_invoices_v1',
  NOTIFICATIONS: 'pkbm_notifications_v1',
  CHATS: 'pkbm_chats_v1',
  ANALYTICS: 'pkbm_analytics_v1',
  STUDENTS_PROGRESS: 'pkbm_students_progress_v1',
  OFFLINE_DRAFTS: 'pkbm_offline_drafts_v1',
  TEACHER_PROFILE: 'pkbm_teacher_profile_v1',
  TEACHERS: 'pkbm_teachers_v1',
};

export interface TeacherProfile {
  name: string;
  role: string;
  badge: string;
  avatarText?: string;
  nip?: string;
}

export const DEFAULT_TEACHER_PROFILE: TeacherProfile = {
  name: 'Dra. Endang Sulistyowati, M.Pd.',
  role: 'Koordinator Kurikulum & Tutor Paket C',
  badge: 'Pendidik Bersertifikasi',
  avatarText: 'TG',
  nip: '19820415 200801 2 014',
};

export const storageService = {
  getRegistrations(): StudentRegistration[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
      return data ? JSON.parse(data) : INITIAL_REGISTRATIONS;
    } catch {
      return INITIAL_REGISTRATIONS;
    }
  },

  saveRegistrations(items: StudentRegistration[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save registrations', e);
    }
  },

  addRegistration(newReg: StudentRegistration): StudentRegistration[] {
    const list = this.getRegistrations();
    const updated = [newReg, ...list];
    this.saveRegistrations(updated);
    return updated;
  },

  getModules(): LearningModule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MODULES);
      return data ? JSON.parse(data) : INITIAL_MODULES;
    } catch {
      return INITIAL_MODULES;
    }
  },

  saveModules(items: LearningModule[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save modules', e);
    }
  },

  addModule(newMod: LearningModule): LearningModule[] {
    const list = this.getModules();
    const updated = [newMod, ...list];
    this.saveModules(updated);
    return updated;
  },

  updateModule(updatedMod: LearningModule): LearningModule[] {
    const list = this.getModules();
    const updated = list.map((m) => (m.id === updatedMod.id ? updatedMod : m));
    this.saveModules(updated);
    return updated;
  },

  deleteModule(moduleId: string): LearningModule[] {
    const list = this.getModules();
    const updated = list.filter((m) => m.id !== moduleId);
    this.saveModules(updated);
    return updated;
  },

  toggleOfflineDownload(moduleId: string): LearningModule[] {
    const list = this.getModules();
    const updated = list.map((m) =>
      m.id === moduleId ? { ...m, isDownloadedOffline: !m.isDownloadedOffline } : m
    );
    this.saveModules(updated);
    return updated;
  },

  updateModuleProgress(moduleId: string, completedChapters: number, bestScore?: number): LearningModule[] {
    const list = this.getModules();
    const updated = list.map((m) => {
      if (m.id === moduleId) {
        return {
          ...m,
          completedChapters: Math.max(m.completedChapters, completedChapters),
          quiz: {
            ...m.quiz,
            bestScore: bestScore !== undefined ? Math.max(m.quiz.bestScore || 0, bestScore) : m.quiz.bestScore,
          },
        };
      }
      return m;
    });
    this.saveModules(updated);
    return updated;
  },

  getGrades(): StudentGrade[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GRADES);
      return data ? JSON.parse(data) : INITIAL_GRADES;
    } catch {
      return INITIAL_GRADES;
    }
  },

  saveGrades(items: StudentGrade[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save grades', e);
    }
  },

  getStudentGrades(studentId: string, packageType: PackageType = 'Paket C'): StudentGrade[] {
    try {
      const key = `pkbm_grades_${studentId}`;
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      // Initialize correlated grades for this student from standard curriculum
      const base = INITIAL_GRADES.map((g) => {
        let factor = 0;
        if (studentId === 'std-01') factor = 0;
        else if (studentId === 'std-02') factor = -3;
        else if (studentId === 'std-03') factor = -16;
        else if (studentId === 'std-04') factor = 4;
        else if (studentId === 'std-05') factor = -6;

        const clamp = (val: number) => Math.min(100, Math.max(40, val + factor));
        const t1 = clamp(g.tugas1);
        const t2 = clamp(g.tugas2);
        const um = clamp(g.ujianModul);
        const ua = clamp(g.ujianAkhir);
        const na = Math.round(t1 * 0.2 + t2 * 0.2 + um * 0.3 + ua * 0.3);
        let predikat: 'A' | 'B' | 'C' | 'D' = 'D';
        if (na >= 85) predikat = 'A';
        else if (na >= 75) predikat = 'B';
        else if (na >= 60) predikat = 'C';

        return {
          ...g,
          studentId,
          packageType,
          tugas1: t1,
          tugas2: t2,
          ujianModul: um,
          ujianAkhir: ua,
          nilaiAkhir: na,
          predikat,
        };
      });
      localStorage.setItem(key, JSON.stringify(base));
      return base;
    } catch {
      return INITIAL_GRADES;
    }
  },

  saveStudentGrades(studentId: string, items: StudentGrade[]): StudentGrade[] {
    try {
      const key = `pkbm_grades_${studentId}`;
      localStorage.setItem(key, JSON.stringify(items));

      // Recalculate student's averageScore in studentsProgress to maintain 100% correlation
      if (items.length > 0) {
        const sum = items.reduce((acc, cur) => acc + (cur.nilaiAkhir || 0), 0);
        const avg = Math.round((sum / items.length) * 10) / 10;
        const allStudents = this.getStudentsProgress();
        const updatedStudents = allStudents.map((st: StudentProgress) => {
          if (st.studentId === studentId) {
            let statusKetercapaian: 'Sangat Baik' | 'Optimal' | 'Perlu Pendampingan' = 'Optimal';
            if (avg >= 85 && st.attendanceRate >= 80) statusKetercapaian = 'Sangat Baik';
            else if (avg < 75 || st.attendanceRate < 75) statusKetercapaian = 'Perlu Pendampingan';

            return {
              ...st,
              averageScore: avg,
              statusKetercapaian,
            };
          }
          return st;
        });
        this.saveStudentsProgress(updatedStudents);
      }
    } catch (e) {
      console.error('Failed to save student grades', e);
    }
    return items;
  },

  addSubjectToStudent(
    studentId: string,
    newSubject: Omit<StudentGrade, 'nilaiAkhir' | 'predikat'>
  ): StudentGrade[] {
    const current = this.getStudentGrades(studentId, newSubject.packageType);
    const finalScore = Math.round(
      newSubject.tugas1 * 0.2 +
      newSubject.tugas2 * 0.2 +
      newSubject.ujianModul * 0.3 +
      newSubject.ujianAkhir * 0.3
    );
    let predikat: 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 85) predikat = 'A';
    else if (finalScore >= 75) predikat = 'B';
    else if (finalScore >= 60) predikat = 'C';

    const fullGrade: StudentGrade = {
      ...newSubject,
      studentId,
      nilaiAkhir: finalScore,
      predikat,
    };

    const updated = [...current, fullGrade];
    return this.saveStudentGrades(studentId, updated);
  },

  updateSubjectInStudent(
    studentId: string,
    subjectId: string,
    updatedSubject: Partial<StudentGrade>
  ): StudentGrade[] {
    const current = this.getStudentGrades(studentId);
    const updated = current.map((g) => {
      if (g.subjectId === subjectId) {
        const merged = { ...g, ...updatedSubject };
        const finalScore = Math.round(
          (merged.tugas1 || 0) * 0.2 +
          (merged.tugas2 || 0) * 0.2 +
          (merged.ujianModul || 0) * 0.3 +
          (merged.ujianAkhir || 0) * 0.3
        );
        let predikat: 'A' | 'B' | 'C' | 'D' = 'D';
        if (finalScore >= 85) predikat = 'A';
        else if (finalScore >= 75) predikat = 'B';
        else if (finalScore >= 60) predikat = 'C';

        return {
          ...merged,
          nilaiAkhir: finalScore,
          predikat,
        };
      }
      return g;
    });
    return this.saveStudentGrades(studentId, updated);
  },

  deleteSubjectFromStudent(studentId: string, subjectId: string): StudentGrade[] {
    const current = this.getStudentGrades(studentId);
    const updated = current.filter((g) => g.subjectId !== subjectId);
    return this.saveStudentGrades(studentId, updated);
  },

  addStudentProgress(newStudent: StudentProgress): StudentProgress[] {
    const list = this.getStudentsProgress();
    const updated = [newStudent, ...list];
    this.saveStudentsProgress(updated);

    // Initialize their default grades for their package
    this.getStudentGrades(newStudent.studentId, newStudent.packageType);

    return updated;
  },

  recordStudentAttendance(
    studentId: string,
    status: 'Hadir' | 'Izin' | 'Sakit',
    sessionName: string = 'Tutorial Tatap Muka & Daring'
  ): StudentProgress[] {
    const list = this.getStudentsProgress();
    const updated = list.map((st: StudentProgress) => {
      if (st.studentId === studentId) {
        let newRate = st.attendanceRate;
        if (status === 'Hadir') {
          newRate = Math.min(100, Math.round((st.attendanceRate + 0.8) * 10) / 10);
        } else if (status === 'Izin') {
          newRate = Math.max(50, Math.round((st.attendanceRate - 0.2) * 10) / 10);
        } else if (status === 'Sakit') {
          newRate = Math.max(50, Math.round((st.attendanceRate - 0.1) * 10) / 10);
        }
        return {
          ...st,
          attendanceRate: newRate,
          lastActive: `Absen ${status} (${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB)`,
        };
      }
      return st;
    });
    this.saveStudentsProgress(updated);
    return updated;
  },

  updateStudentAttendanceUrl(studentId: string, attendanceUrl: string): StudentProgress[] {
    const list = this.getStudentsProgress();
    const updated = list.map((st: StudentProgress) => {
      if (st.studentId === studentId) {
        return {
          ...st,
          attendanceUrl: attendanceUrl.trim() || undefined,
        };
      }
      return st;
    });
    this.saveStudentsProgress(updated);
    return updated;
  },

  updateStudentProgress(studentId: string, partial: Partial<StudentProgress>): StudentProgress[] {
    const list = this.getStudentsProgress();
    const updated = list.map((st: StudentProgress) =>
      st.studentId === studentId ? { ...st, ...partial } : st
    );
    this.saveStudentsProgress(updated);
    return updated;
  },

  deleteStudentProgress(studentId: string): StudentProgress[] {
    const list = this.getStudentsProgress();
    const updated = list.filter((st: StudentProgress) => st.studentId !== studentId);
    this.saveStudentsProgress(updated);
    return updated;
  },

  updateStudentAvatar(studentId: string, newAvatarUrl: string): StudentProgress[] {
    return this.updateStudentProgress(studentId, { avatar: newAvatarUrl });
  },

  updateGrade(subjectId: string, partial: Partial<StudentGrade>): StudentGrade[] {
    const list = this.getGrades();
    const updated = list.map((g) => {
      if (g.subjectId === subjectId) {
        const merged = { ...g, ...partial };
        // Recalculate final score and predicate
        const finalScore = Math.round(
          merged.tugas1 * 0.2 +
          merged.tugas2 * 0.2 +
          merged.ujianModul * 0.3 +
          merged.ujianAkhir * 0.3
        );
        let predikat: 'A' | 'B' | 'C' | 'D' = 'D';
        if (finalScore >= 85) predikat = 'A';
        else if (finalScore >= 75) predikat = 'B';
        else if (finalScore >= 60) predikat = 'C';

        return { ...merged, nilaiAkhir: finalScore, predikat };
      }
      return g;
    });
    this.saveGrades(updated);
    return updated;
  },

  getInvoices(): InvoiceBill[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
      return data ? JSON.parse(data) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  },

  saveInvoices(items: InvoiceBill[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save invoices', e);
    }
  },

  payInvoice(invoiceId: string, paymentMethod: string): InvoiceBill[] {
    const list = this.getInvoices();
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updated = list.map((inv) => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'Lunas' as const,
          paidAt: formattedDate,
          paymentMethod,
          transactionRef: `TRX-${Date.now().toString().slice(-8)}`,
        };
      }
      return inv;
    });
    this.saveInvoices(updated);
    return updated;
  },

  getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  saveNotifications(items: NotificationItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  },

  addNotification(newNotif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): NotificationItem[] {
    const list = this.getNotifications();
    const item: NotificationItem = {
      ...newNotif,
      id: `notif-${Date.now()}`,
      timestamp: 'Baru saja',
      isRead: false,
    };
    const updated = [item, ...list];
    this.saveNotifications(updated);
    return updated;
  },

  markAllNotificationsRead(): NotificationItem[] {
    const list = this.getNotifications();
    const updated = list.map((n) => ({ ...n, isRead: true }));
    this.saveNotifications(updated);
    return updated;
  },

  getChats(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHATS);
      return data ? JSON.parse(data) : INITIAL_CHATS;
    } catch {
      return INITIAL_CHATS;
    }
  },

  saveChats(items: ChatMessage[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save chats', e);
    }
  },

  addChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>): ChatMessage[] {
    const list = this.getChats();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    const newMsg: ChatMessage = {
      ...msg,
      id: `chat-${Date.now()}`,
      timestamp: timeStr,
      isRead: true,
    };
    const updated = [...list, newMsg];
    this.saveChats(updated);
    return updated;
  },

  getAnalytics(): AnalyticsSummary {
    try {
      const students = this.getStudentsProgress();
      const registrations = this.getRegistrations();
      
      const totalStudents = students.length;
      const paketA = students.filter((s: StudentProgress) => s.packageType === 'Paket A').length;
      const paketB = students.filter((s: StudentProgress) => s.packageType === 'Paket B').length;
      const paketC = students.filter((s: StudentProgress) => s.packageType === 'Paket C').length;

      const avgAttendance = totalStudents > 0
        ? Math.round((students.reduce((acc: number, s: StudentProgress) => acc + (s.attendanceRate || 0), 0) / totalStudents) * 10) / 10
        : 91.4;

      // Passing UPK rate: percentage of students with average score >= 75 (KKM) and status not 'Perlu Pendampingan'
      const passingCount = students.filter(
        (s: StudentProgress) => (s.averageScore || 0) >= 75 && s.statusKetercapaian !== 'Perlu Pendampingan'
      ).length;
      const passingRateUPK = totalStudents > 0
        ? Math.round((passingCount / totalStudents) * 1000) / 10
        : 98.2;

      const totalModsTarget = students.reduce((acc: number, s: StudentProgress) => acc + (s.totalModules || 10), 0);
      const totalModsDone = students.reduce((acc: number, s: StudentProgress) => acc + (s.modulesCompleted || 0), 0);
      const moduleCompletionRate = totalModsTarget > 0
        ? Math.round((totalModsDone / totalModsTarget) * 1000) / 10
        : 84.7;

      const totalNewApplicants = registrations.length;
      const verifiedApplicants = registrations.filter((r) => r.status === 'Diterima' || r.status === 'Diverifikasi').length;

      return {
        totalStudents,
        activeStudentsPaketA: paketA,
        activeStudentsPaketB: paketB,
        activeStudentsPaketC: paketC,
        averageAttendance: avgAttendance,
        moduleCompletionRate,
        passingRateUPK,
        totalNewApplicants,
        verifiedApplicants,
      };
    } catch {
      return INITIAL_ANALYTICS;
    }
  },

  getStudentsProgress() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS_PROGRESS);
      return data ? JSON.parse(data) : INITIAL_STUDENTS_PROGRESS;
    } catch {
      return INITIAL_STUDENTS_PROGRESS;
    }
  },

  saveStudentsProgress(data: typeof INITIAL_STUDENTS_PROGRESS) {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS_PROGRESS, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save students progress', e);
    }
  },

  getTeacherProfile(): TeacherProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEACHER_PROFILE);
      return data ? JSON.parse(data) : DEFAULT_TEACHER_PROFILE;
    } catch {
      return DEFAULT_TEACHER_PROFILE;
    }
  },

  saveTeacherProfile(profile: TeacherProfile): TeacherProfile {
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save teacher profile', e);
    }
    return profile;
  },

  getTeachers(): TeacherTutor[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
      return data ? JSON.parse(data) : INITIAL_TEACHERS;
    } catch {
      return INITIAL_TEACHERS;
    }
  },

  saveTeachers(teachers: TeacherTutor[]): TeacherTutor[] {
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    } catch (e) {
      console.error('Failed to save teachers', e);
    }
    return teachers;
  },

  addTeacher(newTeacher: Omit<TeacherTutor, 'id'>): TeacherTutor[] {
    const list = this.getTeachers();
    const created: TeacherTutor = {
      ...newTeacher,
      id: `tchr-${Date.now()}`,
    };
    const updated = [created, ...list];
    return this.saveTeachers(updated);
  },

  updateTeacher(id: string, partial: Partial<TeacherTutor>): TeacherTutor[] {
    const list = this.getTeachers();
    const updated = list.map((t) => (t.id === id ? { ...t, ...partial } : t));
    return this.saveTeachers(updated);
  },

  deleteTeacher(id: string): TeacherTutor[] {
    const list = this.getTeachers();
    const updated = list.filter((t) => t.id !== id);
    return this.saveTeachers(updated);
  },

  getWaliKelasForPackage(packageType: PackageType): TeacherTutor | undefined {
    const list = this.getTeachers();
    return list.find((t) => t.isWaliKelas && t.waliKelasForPackage === packageType) ||
           list.find((t) => t.packageTypes.includes(packageType));
  },

  getTeachersForPackage(packageType: PackageType): TeacherTutor[] {
    const list = this.getTeachers();
    return list.filter((t) => t.packageTypes.includes(packageType));
  },
};
