import React, { useState } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  HardDriveDownload,
  Check,
  Video,
  FileQuestion,
  Award,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Link,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LearningModule } from '../../types';

interface ModuleReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: LearningModule | null;
  onToggleDownload: (moduleId: string) => void;
  onUpdateQuizScore: (moduleId: string, score: number) => void;
}

export const ModuleReaderModal: React.FC<ModuleReaderModalProps> = ({
  isOpen,
  onClose,
  module,
  onToggleDownload,
  onUpdateQuizScore,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'quiz'>('content');
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  if (!isOpen || !module) return null;

  const currentChapter = module.chapters[currentChapterIdx] || module.chapters[0];

  const handleSelectAnswer = (qId: string, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    let correct = 0;
    module.quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / module.quiz.questions.length) * 100);
    setQuizScore(calculatedScore);
    setQuizSubmitted(true);
    onUpdateQuizScore(module.id, calculatedScore);

    if (calculatedScore >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.debug('Confetti error', e);
      }
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block flex items-center gap-1.5">
                <span>{module.packageType}</span>
                <span>•</span>
                <span className="text-amber-300 font-extrabold">{module.gradeLevel}</span>
                <span>•</span>
                <span>{module.subject}</span>
              </span>
              <h3 className="font-extrabold text-sm sm:text-base">{module.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Link Modul Button */}
            {module.moduleUrl && (
              <a
                href={module.moduleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition"
                title="Buka Link Modul di tab baru"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Buka Link Modul</span>
              </a>
            )}

            {/* Offline Cache Button */}
            <button
              onClick={() => onToggleDownload(module.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                module.isDownloadedOffline
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Simpan modul untuk dibaca saat tidak ada koneksi internet"
            >
              {module.isDownloadedOffline ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Tersimpan Offline</span>
                </>
              ) : (
                <>
                  <HardDriveDownload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unduh Offline</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher: Bab Bacaan vs Kuis Evaluasi */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'content'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Materi Pembelajaran</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'quiz'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileQuestion className="w-3.5 h-3.5" />
              <span>Latihan Kuis & Evaluasi</span>
              {module.quiz.bestScore !== undefined && (
                <span className="ml-1 px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                  {module.quiz.bestScore}
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-500 hidden sm:block">
            Tutor Pengampu: <strong>{module.tutorName}</strong>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'content' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Sidebar chapters list */}
              <div className="md:col-span-4 space-y-2 border-r border-slate-100 pr-0 md:pr-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Daftar Bab Modul ({module.chapters.length})
                </span>
                <div className="space-y-1.5">
                  {module.chapters.map((chap, idx) => (
                    <button
                      key={chap.id}
                      onClick={() => setCurrentChapterIdx(idx)}
                      className={`w-full text-left p-3 rounded-xl text-xs transition flex items-center justify-between ${
                        currentChapterIdx === idx
                          ? 'bg-blue-50 border border-blue-200 text-blue-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] shrink-0 font-bold">
                          {idx + 1}
                        </span>
                        <span className="truncate">{chap.title}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Tutor Card */}
                <div className="mt-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Catatan Kurikulum:</span>
                  <p className="text-slate-600 leading-relaxed">
                    Selesaikan semua bab bacaan dan kerjakan kuis evaluasi untuk memenuhi standar ketuntasan modul (SKM) minimal 75.
                  </p>
                </div>
              </div>

              {/* Chapter Content Reader */}
              <div className="md:col-span-8 space-y-6">
                {/* Link Modul Card Banner */}
                {module.moduleUrl && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Link className="w-5 h-5 text-amber-300" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                          Tautan Modul Belajar Digital ({module.moduleLinkType === 'drive' ? 'Google Drive' : module.moduleLinkType === 'kemdikbud' ? 'Kemdikbud' : module.moduleLinkType === 'canva' ? 'Canva' : 'E-Modul'})
                        </span>
                        <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                          {module.moduleLinkTitle || 'Akses E-Modul & Dokumen Asli'}
                        </h5>
                        <p className="text-[11px] text-slate-500 truncate max-w-sm font-mono mt-0.5">
                          {module.moduleUrl}
                        </p>
                      </div>
                    </div>
                    <a
                      href={module.moduleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Link Modul ↗</span>
                    </a>
                  </div>
                )}

                {/* Additional Supplementary Links */}
                {module.additionalLinks && module.additionalLinks.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                      <Share2 className="w-3 h-3 text-blue-600" />
                      <span>Tautan Modul Pendukung:</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {module.additionalLinks.map((alink) => (
                        <a
                          key={alink.id}
                          href={alink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-slate-300 hover:border-blue-400 text-slate-800 text-xs font-semibold shadow-2xs hover:text-blue-700 transition"
                        >
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                          <span>{alink.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                    Bab {currentChapterIdx + 1} dari {module.chapters.length}
                  </span>
                  <h4 className="text-xl font-bold text-slate-900 mt-2">{currentChapter.title}</h4>
                </div>

                {/* Video tutorial if present */}
                {currentChapter.videoUrl && (
                  <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-video shadow-md flex items-center justify-center text-white relative group">
                    <div className="text-center p-6 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition">
                        <Video className="w-6 h-6" />
                      </div>
                      <h5 className="font-bold text-sm">Video Pembelajaran Tutorial</h5>
                      <p className="text-xs text-slate-300">
                        Dipandu langsung oleh tutor mata pelajaran PKBM Menara
                      </p>
                      <span className="inline-block mt-2 px-3 py-1 bg-white/20 text-white text-xs rounded-full">
                        Resolusi HD • Kompatibel Hemat Kuota
                      </span>
                    </div>
                  </div>
                )}

                {/* Reading Content */}
                <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs">
                    <strong>Poin Inti Pembelajaran:</strong> Modul ini disesuaikan dengan Standar Kompetensi Kelulusan (SKL) Pendidikan Kesetaraan yang memadukan teori akademik dengan kemandirian aplikatif di masyarakat.
                  </div>

                  <p className="whitespace-pre-line text-slate-800 font-normal">
                    {currentChapter.content}
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h6 className="font-bold text-slate-900 text-xs">Aktivitas Mandiri Peserta Didik:</h6>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                      <li>Catat poin penting pada buku catatan belajar mandiri Anda.</li>
                      <li>Diskusikan studi kasus di forum diskusi atau tanyakan langsung ke tutor wali kelas.</li>
                      <li>Lanjutkan ke bab berikutnya atau uji pemahaman Anda di tab Kuis Evaluasi.</li>
                    </ul>
                  </div>
                </div>

                {/* Chapter pagination buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    disabled={currentChapterIdx === 0}
                    onClick={() => setCurrentChapterIdx((p) => Math.max(0, p - 1))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Bab Sebelumnya</span>
                  </button>

                  {currentChapterIdx < module.chapters.length - 1 ? (
                    <button
                      onClick={() => setCurrentChapterIdx((p) => p + 1)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800"
                    >
                      <span>Bab Selanjutnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md"
                    >
                      <span>Mulai Kuis Evaluasi</span>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          ) : (
            /* Quiz Tab */
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Evaluasi Pemahaman Modul</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tersedia {module.quiz.questions.length} soal pilihan ganda. Nilai kelulusan minimal: 75.
                  </p>
                </div>
                {module.quiz.bestScore !== undefined && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Skor Tertinggi:</span>
                    <span className="text-xl font-black text-blue-900">{module.quiz.bestScore} / 100</span>
                  </div>
                )}
              </div>

              {/* Quiz Result Banner */}
              {quizSubmitted && (
                <div
                  className={`p-5 rounded-2xl border text-center space-y-2 ${
                    quizScore >= 75
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  <Award className="w-10 h-10 mx-auto text-amber-500" />
                  <h5 className="font-bold text-lg">
                    {quizScore >= 75 ? 'Selamat, Anda Lulus Evaluasi Modul Ini!' : 'Hasil Belum Mencapai Standar Kelulusan'}
                  </h5>
                  <p className="text-xs">
                    Skor Pengerjaan Anda: <strong>{quizScore} / 100</strong>
                  </p>
                  <button
                    onClick={handleResetQuiz}
                    className="mt-2 px-4 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50"
                  >
                    Ulangi Pengerjaan Kuis
                  </button>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {module.quiz.questions.map((q, qIndex) => {
                  const selected = selectedAnswers[q.id];
                  const isCorrect = selected === q.correctAnswerIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {qIndex + 1}
                        </span>
                        <h5 className="font-semibold text-xs sm:text-sm text-slate-900">
                          {q.question}
                        </h5>
                      </div>

                      <div className="space-y-2 pl-9">
                        {q.options.map((opt, optIdx) => {
                          const isOptSelected = selected === optIdx;
                          let optStyle = 'border-slate-200 hover:bg-slate-50';

                          if (quizSubmitted) {
                            if (optIdx === q.correctAnswerIndex) {
                              optStyle = 'border-emerald-500 bg-emerald-50 font-bold text-emerald-900';
                            } else if (isOptSelected && !isCorrect) {
                              optStyle = 'border-rose-500 bg-rose-50 text-rose-900 line-through';
                            }
                          } else if (isOptSelected) {
                            optStyle = 'border-blue-600 bg-blue-50 font-medium text-blue-900';
                          }

                          return (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${optStyle}`}
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                disabled={quizSubmitted}
                                checked={isOptSelected}
                                onChange={() => handleSelectAnswer(q.id, optIdx)}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>

                      {/* Explanation box after submit */}
                      {quizSubmitted && (
                        <div className="ml-9 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                            Pembahasan Jawaban:
                          </span>
                          <p className="text-slate-600">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Quiz Button */}
              {!quizSubmitted && (
                <div className="pt-2 text-center">
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < module.quiz.questions.length}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-40"
                  >
                    Kirim Jawaban & Lihat Nilai
                  </button>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Pastikan seluruh {module.quiz.questions.length} pertanyaan telah dijawab sebelum mengirimkan.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
