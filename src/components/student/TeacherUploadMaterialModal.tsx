import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  BookOpen,
  FileText,
  Video,
  Plus,
  Trash2,
  CheckCircle,
  Sparkles,
  HelpCircle,
  FileUp,
  Image as ImageIcon,
  Check,
  ListPlus,
  Link,
  ExternalLink,
  Globe,
  Share2,
  Pencil,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LearningModule, PackageType } from '../../types';
import { storageService } from '../../services/storageService';

interface TeacherUploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMaterialUploaded: (newModule: LearningModule) => void;
  moduleToEdit?: LearningModule | null;
  initialMode?: 'create' | 'edit';
}

interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

const COVER_PRESETS = [
  {
    name: 'Sains & IPA',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sosial, Sejarah & Geografi',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Keterampilan & Vokasi',
    url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bahasa & Komunikasi',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Ekonomi, Bisnis & Matematika',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Pendidikan Agama Islam',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'PJOK & Kebugaran',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Pemberdayaan & Muatan Lokal',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80',
  },
];

export const TeacherUploadMaterialModal: React.FC<TeacherUploadMaterialModalProps> = ({
  isOpen,
  onClose,
  onMaterialUploaded,
  moduleToEdit,
  initialMode = 'create',
}) => {
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [availableModules, setAvailableModules] = useState<LearningModule[]>([]);
  const [selectedModuleIdToEdit, setSelectedModuleIdToEdit] = useState<string>('');

  const [packageType, setPackageType] = useState<PackageType>('Paket C');
  const [subject, setSubject] = useState('Pendidikan Pancasila & Kewarganegaraan');
  const [title, setTitle] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Setara Kelas XII SMA');
  const [moduleNumber, setModuleNumber] = useState(4);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [tutorName, setTutorName] = useState('Dra. Endang Sulistyowati, M.Pd.');
  const [description, setDescription] = useState('');
  const [selectedCover, setSelectedCover] = useState(COVER_PRESETS[0].url);

  // Link Modul State
  const [materialSourceType, setMaterialSourceType] = useState<'link' | 'file' | 'both'>('link');
  const [moduleUrl, setModuleUrl] = useState('');
  const [moduleLinkTitle, setModuleLinkTitle] = useState('E-Modul Resmi Pembelajaran');
  const [moduleLinkType, setModuleLinkType] = useState<'drive' | 'kemdikbud' | 'canva' | 'youtube' | 'website' | 'other'>('drive');
  const [additionalLinks, setAdditionalLinks] = useState<
    { id: string; title: string; url: string; type: string }[]
  >([]);

  // Digital document upload simulation
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);

  // Auto-detect link type based on URL
  const handleUrlChange = (val: string) => {
    setModuleUrl(val);
    const low = val.toLowerCase();
    if (low.includes('drive.google.com') || low.includes('docs.google.com')) {
      setModuleLinkType('drive');
      if (moduleLinkTitle === 'E-Modul Resmi Pembelajaran' || !moduleLinkTitle) {
        setModuleLinkTitle('Google Drive Dokumen & E-Modul PKBM');
      }
    } else if (low.includes('rumah.pendidikan.go.id')) {
      setModuleLinkType('kemdikbud');
      if (moduleLinkTitle === 'E-Modul Resmi Pembelajaran' || !moduleLinkTitle) {
        setModuleLinkTitle('Rumah Pendidikan - Ruang Murid Kemendikbud');
      }
    } else if (low.includes('kemdikbud.go.id') || low.includes('buku.kemdikbud')) {
      setModuleLinkType('kemdikbud');
      if (moduleLinkTitle === 'E-Modul Resmi Pembelajaran' || !moduleLinkTitle) {
        setModuleLinkTitle('E-Modul Resmi Kurikulum Merdeka Kemdikbud');
      }
    } else if (low.includes('canva.com')) {
      setModuleLinkType('canva');
      if (moduleLinkTitle === 'E-Modul Resmi Pembelajaran' || !moduleLinkTitle) {
        setModuleLinkTitle('Slide Presentasi Interaktif Canva');
      }
    } else if (low.includes('youtube.com') || low.includes('youtu.be')) {
      setModuleLinkType('youtube');
      if (moduleLinkTitle === 'E-Modul Resmi Pembelajaran' || !moduleLinkTitle) {
        setModuleLinkTitle('Video Pembelajaran & Praktik YouTube');
      }
    }
  };

  // Chapters
  const [chapters, setChapters] = useState<
    { id: string; title: string; content: string; videoUrl?: string }[]
  >([
    {
      id: 'chap-new-1',
      title: 'Bab 1: Pengantar dan Konsep Dasar',
      content:
        'Pendidikan kesetaraan mendorong kemandirian belajar dan pemahaman kontekstual yang dapat diterapkan langsung di lingkungan masyarakat...',
      videoUrl: '',
    },
  ]);

  // Practice Quiz Questions (Dynamic Multi-Questions)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionItem[]>([
    {
      id: 'quiz-item-1',
      question: 'Berdasarkan materi yang telah dipelajari, apa tujuan utama dari penerapan konsep ini?',
      options: [
        'Meningkatkan kemandirian belajar warga masyarakat',
        'Menghafal rumus tanpa penerapan',
        'Menghindari tugas mandiri',
        'Hanya untuk keperluan formalitas',
      ],
      correctAnswerIndex: 0,
      explanation: 'Konsep ini bertujuan memupuk kemandirian dan kecakapan hidup (life skill) bagi peserta didik non-formal.',
    },
  ]);

  const [errorMsg, setErrorMsg] = useState('');

  // Prefill helper when editing a module
  const loadModuleForEditing = (mod: LearningModule) => {
    setSelectedModuleIdToEdit(mod.id);
    setPackageType(mod.packageType);
    setSubject(mod.subject);
    setTitle(mod.title);
    setGradeLevel(mod.gradeLevel || 'Setara Kelas XII SMA');
    setModuleNumber(mod.moduleNumber || 1);
    setDurationMinutes(mod.durationMinutes || 90);
    setTutorName(mod.tutorName || 'Dra. Endang Sulistyowati, M.Pd.');
    setDescription(mod.description || '');
    setSelectedCover(mod.coverImage || COVER_PRESETS[0].url);
    setModuleUrl(mod.moduleUrl || '');
    setModuleLinkTitle(mod.moduleLinkTitle || 'E-Modul Resmi Pembelajaran');
    setModuleLinkType(mod.moduleLinkType || 'drive');
    setUploadedPdfName(mod.documentFileName || null);
    setMaterialSourceType(mod.moduleUrl ? 'link' : mod.documentFileName ? 'file' : 'link');
    setAdditionalLinks(
      mod.additionalLinks
        ? mod.additionalLinks.map((l) => ({
            id: l.id,
            title: l.title,
            url: l.url,
            type: l.type || 'website',
          }))
        : []
    );
    setChapters(
      mod.chapters && mod.chapters.length > 0
        ? mod.chapters.map((c) => ({
            id: c.id,
            title: c.title,
            content: c.content,
            videoUrl: c.videoUrl || '',
          }))
        : [
            {
              id: 'chap-1',
              title: 'Bab 1: Pengantar dan Konsep Dasar',
              content: 'Uraian materi pembelajaran...',
              videoUrl: '',
            },
          ]
    );
    setQuizQuestions(
      mod.quiz && mod.quiz.questions && mod.quiz.questions.length > 0
        ? mod.quiz.questions.map((q, idx) => ({
            id: q.id || `quiz-item-${idx + 1}`,
            question: q.question,
            options: [...q.options],
            correctAnswerIndex: q.correctAnswerIndex,
            explanation: q.explanation,
          }))
        : [
            {
              id: 'quiz-item-1',
              question: 'Pertanyaan evaluasi pemahaman modul?',
              options: ['Pilihan A (Benar)', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
              correctAnswerIndex: 0,
              explanation: 'Ulasan jawaban yang tepat.',
            },
          ]
    );
  };

  // Reset form to default create state
  const resetFormToDefault = () => {
    setSelectedModuleIdToEdit('');
    setPackageType('Paket C');
    setSubject('Pendidikan Pancasila & Kewarganegaraan');
    setTitle('');
    setGradeLevel('Setara Kelas XII SMA');
    setModuleNumber(4);
    setDurationMinutes(90);
    setTutorName('Dra. Endang Sulistyowati, M.Pd.');
    setDescription('');
    setSelectedCover(COVER_PRESETS[0].url);
    setModuleUrl('');
    setModuleLinkTitle('E-Modul Resmi Pembelajaran');
    setModuleLinkType('drive');
    setMaterialSourceType('link');
    setAdditionalLinks([]);
    setUploadedPdfName(null);
    setChapters([
      {
        id: 'chap-new-1',
        title: 'Bab 1: Pengantar dan Konsep Dasar',
        content:
          'Pendidikan kesetaraan mendorong kemandirian belajar dan pemahaman kontekstual yang dapat diterapkan langsung di lingkungan masyarakat...',
        videoUrl: '',
      },
    ]);
    setQuizQuestions([
      {
        id: 'quiz-item-1',
        question: 'Berdasarkan materi yang telah dipelajari, apa tujuan utama dari penerapan konsep ini?',
        options: [
          'Meningkatkan kemandirian belajar warga masyarakat',
          'Menghafal rumus tanpa penerapan',
          'Menghindari tugas mandiri',
          'Hanya untuk keperluan formalitas',
        ],
        correctAnswerIndex: 0,
        explanation: 'Konsep ini bertujuan memupuk kemandirian dan kecakapan hidup (life skill) bagi peserta didik non-formal.',
      },
    ]);
  };

  // Sync state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      const allMods = storageService.getModules();
      setAvailableModules(allMods);

      if (moduleToEdit) {
        setMode('edit');
        loadModuleForEditing(moduleToEdit);
      } else if (initialMode === 'edit') {
        setMode('edit');
        if (allMods.length > 0) {
          loadModuleForEditing(allMods[0]);
        } else {
          resetFormToDefault();
        }
      } else {
        setMode('create');
        resetFormToDefault();
      }
    }
  }, [isOpen, moduleToEdit, initialMode]);

  // Handle switching between Create and Edit tab
  const handleSwitchMode = (newMode: 'create' | 'edit') => {
    setMode(newMode);
    setErrorMsg('');
    const allMods = storageService.getModules();
    setAvailableModules(allMods);

    if (newMode === 'edit') {
      if (allMods.length > 0) {
        const target = allMods.find((m) => m.id === selectedModuleIdToEdit) || allMods[0];
        loadModuleForEditing(target);
      }
    } else {
      resetFormToDefault();
    }
  };

  if (!isOpen) return null;

  // Chapter handlers
  const handleAddChapter = () => {
    const newIdx = chapters.length + 1;
    setChapters([
      ...chapters,
      {
        id: `chap-new-${newIdx}`,
        title: `Bab ${newIdx}: Pendalaman Materi`,
        content: `Uraian materi bab ${newIdx} untuk dipelajari peserta didik...`,
        videoUrl: '',
      },
    ]);
  };

  const handleRemoveChapter = (index: number) => {
    if (chapters.length <= 1) return;
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const handleUpdateChapter = (
    index: number,
    field: 'title' | 'content' | 'videoUrl',
    val: string
  ) => {
    setChapters(
      chapters.map((chap, i) => (i === index ? { ...chap, [field]: val } : chap))
    );
  };

  // Quiz Question handlers
  const handleAddQuizQuestion = () => {
    const nextNum = quizQuestions.length + 1;
    const newQ: QuizQuestionItem = {
      id: `quiz-item-${Date.now()}-${nextNum}`,
      question: `Pertanyaan evaluasi ${nextNum}: Jelaskan poin penting terkait topik ini?`,
      options: [
        'Pilihan jawaban A (Benar)',
        'Pilihan jawaban B',
        'Pilihan jawaban C',
        'Pilihan jawaban D',
      ],
      correctAnswerIndex: 0,
      explanation: 'Ulasan ringkas alasan jawaban yang dipilih paling tepat.',
    };
    setQuizQuestions([...quizQuestions, newQ]);
  };

  const handleRemoveQuizQuestion = (index: number) => {
    if (quizQuestions.length <= 1) return;
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const handleUpdateQuestionText = (index: number, text: string) => {
    setQuizQuestions(
      quizQuestions.map((q, i) => (i === index ? { ...q, question: text } : q))
    );
  };

  const handleUpdateOptionText = (qIndex: number, optIndex: number, text: string) => {
    setQuizQuestions(
      quizQuestions.map((q, i) => {
        if (i === qIndex) {
          const updatedOptions = [...q.options];
          updatedOptions[optIndex] = text;
          return { ...q, options: updatedOptions };
        }
        return q;
      })
    );
  };

  const handleSetCorrectAnswer = (qIndex: number, optIndex: number) => {
    setQuizQuestions(
      quizQuestions.map((q, i) =>
        i === qIndex ? { ...q, correctAnswerIndex: optIndex } : q
      )
    );
  };

  const handleUpdateExplanation = (qIndex: number, text: string) => {
    setQuizQuestions(
      quizQuestions.map((q, i) =>
        i === qIndex ? { ...q, explanation: text } : q
      )
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedPdfName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Judul modul / materi wajib diisi');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Deskripsi materi wajib diisi');
      return;
    }
    if (quizQuestions.length === 0) {
      setErrorMsg('Harap sediakan minimal 1 soal evaluasi kuis pemahaman');
      return;
    }

    if (mode === 'edit' && selectedModuleIdToEdit) {
      // Find existing module to preserve statistics
      const existing = availableModules.find((m) => m.id === selectedModuleIdToEdit);
      const updatedModule: LearningModule = {
        id: selectedModuleIdToEdit,
        title: title.trim(),
        subject,
        packageType,
        gradeLevel,
        moduleNumber: Number(moduleNumber) || 1,
        durationMinutes: Number(durationMinutes) || 60,
        description: description.trim(),
        tutorName,
        coverImage: selectedCover,
        totalChapters: chapters.length,
        completedChapters: existing ? existing.completedChapters : 0,
        isDownloadedOffline: existing ? existing.isDownloadedOffline : false,
        moduleUrl: moduleUrl.trim() || undefined,
        moduleLinkTitle: moduleLinkTitle.trim() || undefined,
        moduleLinkType,
        documentFileName: uploadedPdfName || undefined,
        additionalLinks: additionalLinks.filter((l) => l.url.trim().length > 0),
        chapters: chapters.map((c, i) => ({
          ...c,
          id: c.id || `chap-${selectedModuleIdToEdit}-${i + 1}`,
        })),
        quiz: {
          id: existing?.quiz?.id || `quiz-${selectedModuleIdToEdit}`,
          questionsCount: quizQuestions.length,
          bestScore: existing?.quiz?.bestScore,
          questions: quizQuestions.map((q, i) => ({
            id: q.id || `q-${selectedModuleIdToEdit}-${i + 1}`,
            question: q.question.trim(),
            options: q.options.map((opt) => opt.trim()),
            correctAnswerIndex: q.correctAnswerIndex,
            explanation: q.explanation.trim(),
          })),
        },
      };

      // Save updated module
      storageService.updateModule(updatedModule);

      storageService.addNotification({
        title: `✏️ Materi Diperbarui: ${updatedModule.title}`,
        message: `Tutor ${updatedModule.tutorName} telah memperbarui modul & soal evaluasi untuk mata pelajaran ${updatedModule.subject} (${updatedModule.packageType}). Siswa dapat mengakses versi materi terbaru.`,
        category: 'akademik',
        isPushSent: true,
      });

      onMaterialUploaded(updatedModule);
    } else {
      // Create new module
      const newModuleId = `mod-custom-${Date.now()}`;
      const newModule: LearningModule = {
        id: newModuleId,
        title: title.trim(),
        subject,
        packageType,
        gradeLevel,
        moduleNumber: Number(moduleNumber) || 1,
        durationMinutes: Number(durationMinutes) || 60,
        description: description.trim(),
        tutorName,
        coverImage: selectedCover,
        totalChapters: chapters.length,
        completedChapters: 0,
        isDownloadedOffline: false,
        moduleUrl: moduleUrl.trim() || undefined,
        moduleLinkTitle: moduleLinkTitle.trim() || undefined,
        moduleLinkType,
        documentFileName: uploadedPdfName || undefined,
        additionalLinks: additionalLinks.filter((l) => l.url.trim().length > 0),
        chapters: chapters.map((c, i) => ({
          ...c,
          id: `chap-${newModuleId}-${i + 1}`,
        })),
        quiz: {
          id: `quiz-${newModuleId}`,
          questionsCount: quizQuestions.length,
          questions: quizQuestions.map((q, i) => ({
            id: `q-${newModuleId}-${i + 1}`,
            question: q.question.trim(),
            options: q.options.map((opt) => opt.trim()),
            correctAnswerIndex: q.correctAnswerIndex,
            explanation: q.explanation.trim(),
          })),
        },
      };

      // Save in storage
      storageService.addModule(newModule);

      // Announcement notification for students
      const linkNote = newModule.moduleUrl ? ' serta tautan e-modul digital' : '';
      storageService.addNotification({
        title: `📚 Modul Baru: ${newModule.title}`,
        message: `Tutor ${newModule.tutorName} telah mengunggah materi belajar baru untuk mata pelajaran ${newModule.subject} (${newModule.packageType})${linkNote} dilengkapi ${newModule.quiz.questionsCount} soal latihan kuis. Silakan buka portal belajar untuk mulai membaca.`,
        category: 'akademik',
        isPushSent: true,
      });

      onMaterialUploaded(newModule);
    }

    // Confetti
    try {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              {mode === 'edit' ? <Pencil className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {mode === 'edit' ? 'Edit & Perbarui Materi Belajar Guru' : 'Upload & Terbitkan Materi Belajar Guru'}
              </h3>
              <p className="text-xs text-blue-200">
                Pusat Kegiatan Belajar Masyarakat (PKBM) Menara
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Upload Baru vs Edit Materi */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSwitchMode('create')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                mode === 'create'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Materi Baru</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('edit')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                mode === 'edit'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Menu Edit Materi ({availableModules.length})</span>
            </button>
          </div>

          {mode === 'edit' && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-lg">
              Mode Edit Aktif
            </span>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Edit Mode Module Selector Banner */}
          {mode === 'edit' && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                    Pilih Modul Pembelajaran yang Ingin Diedit:
                  </span>
                  <p className="text-xs text-slate-600">
                    Data materi, link modul, uraian bab, dan kuis akan dimuat otomatis ke formulir di bawah.
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto sm:min-w-[280px]">
                <select
                  value={selectedModuleIdToEdit}
                  onChange={(e) => {
                    const found = availableModules.find((m) => m.id === e.target.value);
                    if (found) loadModuleForEditing(found);
                  }}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-amber-400 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none shadow-xs"
                >
                  {availableModules.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.packageType}] {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Informasi Modul */}
          <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-700" />
              <span>1. Identitas Mata Pelajaran & Modul</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jenjang Kesetaraan *
                </label>
                <select
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value as PackageType)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white outline-none"
                >
                  <option value="Paket A">Paket A (Setara SD)</option>
                  <option value="Paket B">Paket B (Setara SMP)</option>
                  <option value="Paket C">Paket C (Setara SMA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mata Pelajaran *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white outline-none"
                >
                  <optgroup label="Mata Pelajaran Peminatan & IPS">
                    <option value="Ekonomi">Ekonomi</option>
                    <option value="Geografi">Geografi</option>
                    <option value="Sosiologi">Sosiologi</option>
                    <option value="Sejarah">Sejarah</option>
                    <option value="Sejarah Indonesia">Sejarah Indonesia</option>
                    <option value="Ilmu Pengetahuan Sosial (IPS)">Ilmu Pengetahuan Sosial (IPS)</option>
                  </optgroup>
                  <optgroup label="Keterampilan, Pemberdayaan & Muatan Lokal">
                    <option value="Keterampilan">Keterampilan</option>
                    <option value="Pemberdayaan">Pemberdayaan</option>
                    <option value="Muatan Lokal">Muatan Lokal</option>
                  </optgroup>
                  <optgroup label="Agama, PJOK & Kewarganegaraan">
                    <option value="Pendidikan Agama Islam">Pendidikan Agama Islam</option>
                    <option value="PJOK">PJOK (Pendidikan Jasmani, Olahraga, dan Kesehatan)</option>
                    <option value="Pendidikan Pancasila & Kewarganegaraan">Pendidikan Pancasila & Kewarganegaraan (PPKn)</option>
                  </optgroup>
                  <optgroup label="Bahasa & Sains Umum">
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="Bahasa Inggris Terapan">Bahasa Inggris Terapan</option>
                    <option value="Matematika Terapan">Matematika Terapan</option>
                    <option value="Ilmu Pengetahuan Alam (IPA)">Ilmu Pengetahuan Alam (IPA)</option>
                  </optgroup>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Modul Pembelajaran *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Modul 3: Inovasi Bisnis Digital & Etika Kewirausahaan"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tingkat / Kelas
                </label>
                <input
                  type="text"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  placeholder="Contoh: Setara Kelas XII SMA"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Tutor / Pengampu *
                </label>
                <input
                  type="text"
                  required
                  value={tutorName}
                  onChange={(e) => setTutorName(e.target.value)}
                  placeholder="Nama Lengkap & Gelar Tutor"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Modul
                </label>
                <input
                  type="number"
                  min={1}
                  value={moduleNumber}
                  onChange={(e) => setModuleNumber(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimasi Waktu Belajar (Menit)
                </label>
                <input
                  type="number"
                  min={15}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi & Capaian Pembelajaran Modul *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan ringkasan materi, tujuan belajar, dan kompetensi yang akan dicapai peserta didik..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pilih Sampul Modul */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-blue-700" />
              <span>2. Pilih Gambar Sampul (Cover Modul)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {COVER_PRESETS.map((preset) => (
                <div
                  key={preset.name}
                  onClick={() => setSelectedCover(preset.url)}
                  className={`cursor-pointer rounded-xl overflow-hidden border-2 transition ${
                    selectedCover === preset.url
                      ? 'border-blue-700 ring-2 ring-blue-300 scale-95 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-16 object-cover"
                  />
                  <div className="p-1 text-[10px] text-center font-bold text-slate-700 bg-slate-50 truncate">
                    {preset.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Upload & Tautkan Link Modul Belajar (Cloud / E-Modul / Dokumen) */}
          <div className="space-y-4 bg-slate-50/90 p-5 rounded-2xl border border-slate-200/90">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200/80 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                  <Link className="w-4 h-4 text-blue-700" />
                  <span>3. Upload & Tautkan Link Modul Belajar</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Lampirkan tautan modul cloud (Google Drive, E-Modul Kemdikbud) atau unggah berkas PDF langsung.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-xs self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setMaterialSourceType('link')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                    materialSourceType === 'link'
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>Link Modul</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMaterialSourceType('file')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                    materialSourceType === 'file'
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Upload Berkas PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMaterialSourceType('both')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                    materialSourceType === 'both'
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Keduanya</span>
                </button>
              </div>
            </div>

            {/* Sub-form: Upload Link Modul */}
            {(materialSourceType === 'link' || materialSourceType === 'both') && (
              <div className="space-y-3.5 bg-white p-4.5 rounded-2xl border border-blue-200/80 shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-700" />
                      <span>Alamat URL / Tautan Link Modul Belajar *</span>
                    </label>
                    <span className="text-[11px] text-blue-700 font-medium hidden sm:inline">
                      Mendukung Google Drive, Kemdikbud, Canva, YouTube, dll.
                    </span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    <span className="text-[11px] text-slate-500 font-semibold mr-1">Rekomendasi Cepat:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setModuleLinkType('kemdikbud');
                        setModuleLinkTitle('Rumah Pendidikan - Ruang Murid Kemendikbud');
                        setModuleUrl('https://rumah.pendidikan.go.id/ruang/murid');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
                        moduleUrl === 'https://rumah.pendidikan.go.id/ruang/murid'
                          ? 'bg-blue-600 text-white border-blue-600 ring-1 ring-blue-400 font-bold shadow-xs'
                          : 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100'
                      }`}
                    >
                      <span>🏠 Rumah Pendidikan (Ruang Murid)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModuleLinkType('drive');
                        setModuleLinkTitle('Google Drive Dokumen & E-Modul PKBM');
                        if (!moduleUrl) setModuleUrl('https://drive.google.com/');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
                        moduleLinkType === 'drive'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>📁 Google Drive</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModuleLinkType('kemdikbud');
                        setModuleLinkTitle('E-Modul Resmi Kurikulum Merdeka Kemdikbud');
                        if (!moduleUrl) setModuleUrl('https://buku.kemdikbud.go.id/');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
                        moduleLinkType === 'kemdikbud' && moduleUrl !== 'https://rumah.pendidikan.go.id/ruang/murid'
                          ? 'bg-blue-50 text-blue-800 border-blue-300 ring-1 ring-blue-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>🏛️ Buku Kemdikbud / PMM</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModuleLinkType('canva');
                        setModuleLinkTitle('Slide Presentasi Interaktif Canva');
                        if (!moduleUrl) setModuleUrl('https://www.canva.com/');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
                        moduleLinkType === 'canva'
                          ? 'bg-cyan-50 text-cyan-800 border-cyan-300 ring-1 ring-cyan-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>🎨 Canva Slide</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModuleLinkType('youtube');
                        setModuleLinkTitle('Video Tutorial & Praktik YouTube');
                        if (!moduleUrl) setModuleUrl('https://youtube.com/');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
                        moduleLinkType === 'youtube'
                          ? 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>▶️ YouTube Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModuleLinkType('website');
                        setModuleLinkTitle('Website / Sumber Belajar Terbuka');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
                        moduleLinkType === 'website'
                          ? 'bg-purple-50 text-purple-800 border-purple-300 ring-1 ring-purple-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>🌐 Portal Web Lain</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={moduleUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="Tempel tautan modul di sini (https://rumah.pendidikan.go.id/ruang/murid atau https://drive.google.com/...)"
                      className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono outline-none bg-slate-50/50"
                    />
                    {moduleUrl.trim().length > 5 && (
                      <a
                        href={moduleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center gap-1.5 shrink-0 border border-blue-200 transition"
                        title="Buka untuk memverifikasi tautan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Uji Buka Link</span>
                      </a>
                    )}
                  </div>

                  {/* Featured Card: Portal Resmi Rumah Pendidikan Ruang Murid */}
                  <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-xs text-blue-950">Portal Resmi: Rumah Pendidikan (Ruang Murid)</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">Kemendikbudristek</span>
                        </div>
                        <a
                          href="https://rumah.pendidikan.go.id/ruang/murid"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-700 hover:text-blue-900 hover:underline font-mono truncate block"
                        >
                          https://rumah.pendidikan.go.id/ruang/murid
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setModuleLinkType('kemdikbud');
                          setModuleLinkTitle('Rumah Pendidikan - Ruang Murid Kemendikbud');
                          setModuleUrl('https://rumah.pendidikan.go.id/ruang/murid');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] shadow-2xs transition active:scale-95 flex items-center gap-1"
                        title="Terapkan link Rumah Pendidikan sebagai modul utama"
                      >
                        <Check className="w-3.5 h-3.5 text-amber-300" />
                        <span>Pakai Link Ini</span>
                      </button>
                      <a
                        href="https://rumah.pendidikan.go.id/ruang/murid"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-blue-800 font-bold text-[11px] border border-blue-200 transition flex items-center gap-1"
                        title="Buka situs Rumah Pendidikan Ruang Murid di tab baru"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Kunjungi</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Keterangan / Label Tombol Link Modul:
                    </label>
                    <input
                      type="text"
                      value={moduleLinkTitle}
                      onChange={(e) => setModuleLinkTitle(e.target.value)}
                      placeholder="Contoh: E-Modul Resmi Kurikulum Merdeka Kemdikbud"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Kategori Sumber Tautan:
                    </label>
                    <select
                      value={moduleLinkType}
                      onChange={(e) => setModuleLinkType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="drive">📁 Google Drive (PDF / Slide / Dokumen)</option>
                      <option value="kemdikbud">🏛️ Kemdikbudristek / PMM / Buku Digital</option>
                      <option value="canva">🎨 Canva Presentation Interaktif</option>
                      <option value="youtube">▶️ YouTube Playlist / Video Modul</option>
                      <option value="website">🌐 Portal Web / Blog Pendidikan</option>
                      <option value="other">🔗 Tautan Sumber Belajar Lainnya</option>
                    </select>
                  </div>
                </div>

                {/* Additional Links section */}
                <div className="pt-2.5 border-t border-slate-100 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                      <Share2 className="w-3 h-3 text-blue-600" />
                      <span>Tautan Modul Tambahan / Lampiran Terkait ({additionalLinks.length}):</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAdditionalLinks([
                            ...additionalLinks,
                            {
                              id: `link-${Date.now()}`,
                              title: 'Rumah Pendidikan - Ruang Murid Kemendikbud',
                              url: 'https://rumah.pendidikan.go.id/ruang/murid',
                              type: 'kemdikbud',
                            },
                          ]);
                        }}
                        className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1 transition"
                        title="Tambahkan langsung Rumah Pendidikan Ruang Murid sebagai lampiran belajar"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Lampirkan Ruang Murid</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAdditionalLinks([
                            ...additionalLinks,
                            {
                              id: `link-${Date.now()}`,
                              title: `Tautan Tambahan ${additionalLinks.length + 1}`,
                              url: '',
                              type: 'website',
                            },
                          ]);
                        }}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Tambah Link Lain</span>
                      </button>
                    </div>
                  </div>

                  {additionalLinks.map((addLink, aIdx) => (
                    <div
                      key={addLink.id}
                      className="flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <input
                        type="text"
                        value={addLink.title}
                        onChange={(e) => {
                          const updated = [...additionalLinks];
                          updated[aIdx].title = e.target.value;
                          setAdditionalLinks(updated);
                        }}
                        placeholder="Nama tautan (misal: LKPD / Lembar Kerja Siswa)"
                        className="w-full sm:w-1/3 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 outline-none bg-white"
                      />
                      <input
                        type="url"
                        value={addLink.url}
                        onChange={(e) => {
                          const updated = [...additionalLinks];
                          updated[aIdx].url = e.target.value;
                          setAdditionalLinks(updated);
                        }}
                        placeholder="https://..."
                        className="w-full sm:flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 outline-none bg-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAdditionalLinks(additionalLinks.filter((_, i) => i !== aIdx));
                        }}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg self-end sm:self-center transition"
                        title="Hapus tautan ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-form: Unggah Berkas Fisik (PDF / DOCX) */}
            {(materialSourceType === 'file' || materialSourceType === 'both') && (
              <div className="p-4.5 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 space-y-2 text-center">
                <FileUp className="w-7 h-7 mx-auto text-blue-700" />
                <h5 className="font-bold text-xs text-slate-900">
                  Unggah Berkas Modul PDF / Dokumen Digital dari Perangkat
                </h5>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Format berkas: .PDF, .DOC, .DOCX. Siswa dapat mengunduh berkas ini dan menyimpannya di perangkat untuk dibaca tanpa kuota/internet.
                </p>
                <div className="pt-1">
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold cursor-pointer shadow-xs transition">
                    <Upload className="w-3.5 h-3.5 text-blue-700" />
                    <span>Pilih Berkas PDF / DOCX</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {uploadedPdfName && (
                  <div className="text-xs text-emerald-700 font-bold flex items-center justify-center gap-1 mt-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Berkas terlampir: {uploadedPdfName}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Bab-bab Pembelajaran */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-700" />
                <span>4. Uraian Bab Materi Pembelajaran ({chapters.length})</span>
              </label>
              <button
                type="button"
                onClick={handleAddChapter}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Bab</span>
              </button>
            </div>

            <div className="space-y-3">
              {chapters.map((chap, idx) => (
                <div
                  key={chap.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      value={chap.title}
                      onChange={(e) => handleUpdateChapter(idx, 'title', e.target.value)}
                      placeholder={`Judul Bab ${idx + 1}`}
                      className="flex-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {chapters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveChapter(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Hapus bab ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Isi Ringkasan Materi Pelajaran:
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={chap.content}
                      onChange={(e) => handleUpdateChapter(idx, 'content', e.target.value)}
                      placeholder="Tuliskan rangkuman materi lengkap..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tautan Video Tutorial YouTube (Opsional):</span>
                    </label>
                    <input
                      type="text"
                      value={chap.videoUrl || ''}
                      onChange={(e) => handleUpdateChapter(idx, 'videoUrl', e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Soal Kuis Evaluasi Mandiri (Dynamic Multi-Questions) */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h5 className="font-bold text-xs uppercase tracking-wider text-amber-950">
                    5. Soal Evaluasi / Kuis Pemahaman Modul ({quizQuestions.length} Soal)
                  </h5>
                </div>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Bapak/Ibu Guru dapat menyusun dan menambah beberapa butir soal pilihan ganda untuk menguji pemahaman siswa.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddQuizQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Soal Kuis</span>
              </button>
            </div>

            {/* List of Dynamic Quiz Questions */}
            <div className="space-y-4">
              {quizQuestions.map((qItem, qIdx) => (
                <div
                  key={qItem.id}
                  className="p-4 rounded-2xl bg-white border border-amber-200 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {qIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        Butir Soal Evaluasi #{qIdx + 1}
                      </span>
                    </div>

                    {quizQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuizQuestion(qIdx)}
                        className="flex items-center gap-1 px-2 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition"
                        title="Hapus butir soal ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Soal</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pertanyaan Soal Kuis:
                    </label>
                    <input
                      type="text"
                      required
                      value={qItem.question}
                      onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                      placeholder={`Tuliskan teks pertanyaan soal nomor ${qIdx + 1}...`}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Pilihan Jawaban (Klik bulatan radio untuk menandai kunci jawaban yang benar):
                    </label>
                    {qItem.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`correctAnswer-${qItem.id}`}
                            checked={qItem.correctAnswerIndex === optIdx}
                            onChange={() => handleSetCorrectAnswer(qIdx, optIdx)}
                            className="text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                          />
                          <span className="text-xs font-bold font-mono text-slate-600 w-4">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                        </label>
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => handleUpdateOptionText(qIdx, optIdx, e.target.value)}
                          placeholder={`Teks pilihan jawaban ${String.fromCharCode(65 + optIdx)}`}
                          className={`flex-1 px-3 py-1 text-xs rounded-lg border focus:ring-2 focus:ring-amber-500 outline-none ${
                            qItem.correctAnswerIndex === optIdx
                              ? 'border-emerald-500 bg-emerald-50/50 font-semibold text-emerald-950'
                              : 'border-slate-300 bg-white'
                          }`}
                        />
                        {qItem.correctAnswerIndex === optIdx && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Kunci Benar
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pembahasan Jawaban (Ditampilkan saat siswa selesai mengerjakan kuis):</span>
                    </label>
                    <input
                      type="text"
                      value={qItem.explanation}
                      onChange={(e) => handleUpdateExplanation(qIdx, e.target.value)}
                      placeholder="Penjelasan mengapa jawaban tersebut tepat..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Add Question Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleAddQuizQuestion}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 shadow-xs transition"
              >
                <Plus className="w-4 h-4 text-amber-700" />
                <span>+ Tambah Soal Kuis Selanjutnya</span>
              </button>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-7 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 active:scale-95 ${
                mode === 'edit'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white'
                  : 'bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-amber-300" />
              <span>
                {mode === 'edit'
                  ? 'Simpan Perubahan Materi Belajar'
                  : `Terbitkan Materi & ${quizQuestions.length} Soal Kuis`}
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
