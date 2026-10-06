import React from 'react';
import { GraduationCap, MapPin, Phone, Mail, Award, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white/90 border border-blue-400 p-0.5 shadow-md shrink-0">
                <img src="/logo.png" alt="Logo 3D PKBM Menara" className="w-full h-full object-contain rounded-full" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">PKBM MENARA</span>
                <p className="text-xs text-blue-400 font-medium">Pendidikan Kesetaraan & Vokasi</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lembaga Pendidikan Non-Formal Terakreditasi A (Sangat Baik) resmi BAN PDM Kemendikdasmen yang menyelenggarakan program kesetaraan Paket A (SD), Paket B (SMP), Paket C (SMA), serta pendidikan vokasi siap kerja.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>NPSN: P9954430 • Terakreditasi A (Sangat Baik) BAN-PDM</span>
            </div>
          </div>

          {/* Program Pendidikan Kesetaraan */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Program Belajar</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Paket A (Setara Sekolah Dasar / SD)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Paket B (Setara SMP / MTs)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Paket C (Setara SMA / MA Jurusan IPS & Vokasi)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Kursus Vokasi Desain & Sablon Digital, Perkantoran</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Pendidikan Keaksaraan Fungsional (KF)</span>
              </li>
            </ul>
          </div>

          {/* Metode & Fitur Unggulan */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Layanan Terpadu</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Ijazah Resmi Negara (Dapat Kuliah & CPNS)</span>
              </li>
              <li className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>E-Learning Modul Kesetaraan (Dukungan Offline)</span>
              </li>
              <li className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Transkrip Nilai & E-Rapor Digital Dapodik</span>
              </li>
              <li className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload Materi Guru & Modul Interaktif</span>
              </li>
              <li className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Konseling & Komunikasi Dua Arah Wali Murid</span>
              </li>
            </ul>
          </div>

          {/* Kontak & Kampus */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Hubungi Kami</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Kampus PKBM Menara, Jalan Sorumba Desa Langgea, Kec. Ranomeeto, Kab. Konawe Selatan, Sulawesi Tenggara</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href="https://wa.me/6285255198598"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-300 transition-colors"
                >
                  WhatsApp Center: +62 852-5519-8598
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href="mailto:pkbmmenaralanggea@gmail.com"
                  className="hover:text-blue-300 transition-colors"
                >
                  pkbmmenaralanggea@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5 pt-1 text-slate-300">
                <HeartHandshake className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Melayani Konsultasi Pendidikan Setiap Hari</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 PKBM Menara. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition cursor-pointer">Panduan Kurikulum Merdeka</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Kebijakan Privasi</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Verifikasi Ijazah</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
