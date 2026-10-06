import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  FileText,
  User,
  GraduationCap,
  Upload,
  AlertCircle,
  Printer,
  QrCode,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  WifiOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PackageType, StudentRegistration } from '../../types';
import { storageService } from '../../services/storageService';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRegistration: StudentRegistration) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const isOnline = useOnlineStatus();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [packageType, setPackageType] = useState<PackageType>('Paket C');
  const [track, setTrack] = useState<StudentRegistration['track']>('Kelas Mandiri / Pekerja');
  
  const [fullName, setFullName] = useState('');
  const [nik, setNik] = useState('');
  const [nisn, setNisn] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('2007-05-15');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [lastEducation, setLastEducation] = useState('SMP / MTs Sederajat');
  
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Documents checklist
  const [docs, setDocs] = useState({
    ktpOrKia: true,
    kartuKeluarga: true,
    ijazahTerakhir: true,
    pasFoto: true,
  });

  const [submittedResult, setSubmittedResult] = useState<StudentRegistration | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const validateStep2 = () => {
    if (!fullName.trim()) return 'Nama lengkap wajib diisi';
    if (!nik.trim() || nik.length < 16) return 'NIK harus berupa 16 digit angka';
    if (!birthPlace.trim()) return 'Tempat lahir wajib diisi';
    if (!phone.trim()) return 'Nomor telepon/WhatsApp wajib diisi';
    if (!address.trim()) return 'Alamat domisili lengkap wajib diisi';
    return '';
  };

  const handleNext = () => {
    setErrorMessage('');
    if (step === 2) {
      const err = validateStep2();
      if (err) {
        setErrorMessage(err);
        return;
      }
    }
    setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
  };

  const handlePrev = () => {
    setErrorMessage('');
    setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Generate Registration Code
    const regCode = `REG-2026-PKBM-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRecord: StudentRegistration = {
      id: `reg-${Date.now()}`,
      regNumber: regCode,
      fullName,
      nik,
      nisn: nisn || '-',
      gender,
      birthPlace,
      birthDate,
      phone,
      email: email || `${phone}@siswa.pkbm-menara.sch.id`,
      address,
      packageType,
      track,
      lastEducation,
      parentName: parentName || 'Mandiri / Dewasa',
      parentPhone: parentPhone || phone,
      status: 'Menunggu Verifikasi',
      submittedAt: dateStr,
      documents: docs,
    };

    // Save to storage
    storageService.addRegistration(newRecord);
    setSubmittedResult(newRecord);
    onSuccess(newRecord);

    // Trigger confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.debug('Confetti error', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setStep(1);
    setSubmittedResult(null);
    setFullName('');
    setNik('');
    setNisn('');
    setPhone('');
    setEmail('');
    setAddress('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-white/90 border border-blue-300 p-0.5 shadow-md shrink-0">
              <img src="/logo.png" alt="Logo 3D PKBM Menara" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Formulir PPDB Online PKBM Menara</h3>
              <p className="text-xs text-blue-200">Jalan Sorumba Desa Langgea, Konawe Selatan • NPSN: P9954430</p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline notice if offline */}
        {!isOnline && (
          <div className="px-6 py-2.5 bg-amber-500 text-white text-xs flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              Anda sedang offline. Pendaftaran akan disimpan di browser Anda dan diverifikasi otomatis saat online.
            </span>
          </div>
        )}

        {/* Step Indicator (If not completed) */}
        {!submittedResult && (
          <div className="px-6 pt-5 pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              {[
                { s: 1, label: 'Program' },
                { s: 2, label: 'Data Diri' },
                { s: 3, label: 'Berkas' },
                { s: 4, label: 'Konfirmasi' },
              ].map((item) => (
                <div key={item.s} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      step === item.s
                        ? 'bg-blue-700 text-white ring-4 ring-blue-100'
                        : step > item.s
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step > item.s ? '✓' : item.s}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${step === item.s ? 'text-blue-900 font-bold' : 'text-slate-500'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {submittedResult ? (
            /* Registration Success & Printable Card */
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle className="w-10 h-10" />
              </div>
              
              <div>
                <h4 className="text-xl font-extrabold text-slate-900">Pendaftaran Berhasil Dikirim!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Simpan atau cetak bukti tanda terima pendaftaran berikut sebagai syarat verifikasi berkas fisik.
                </p>
              </div>

              {/* Digital Registration Card */}
              <div className="rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/40 p-6 text-left space-y-4">
                <div className="flex items-start justify-between border-b border-blue-200/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/90 border border-blue-400 p-0.5 shadow-sm shrink-0">
                      <img src="/logo.png" alt="Logo 3D PKBM Menara" className="w-full h-full object-contain rounded-full" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest block">
                        KARTU TANDA PENDAFTARAN PPDB 2026
                      </span>
                      <h5 className="font-extrabold text-slate-900 text-base">PKBM MENARA</h5>
                      <p className="text-xs text-slate-500">NPSN: P9954430 • Jalan Sorumba Desa Langgea, Konawe Selatan</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-blue-200 flex flex-col items-center">
                    <QrCode className="w-12 h-12 text-slate-800" />
                    <span className="text-[9px] text-slate-500 mt-1 font-mono">VERIFIED</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nomor Registrasi:</span>
                    <strong className="text-blue-900 font-mono text-sm">{submittedResult.regNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Program Pilihan:</span>
                    <strong className="text-slate-800">{submittedResult.packageType} ({submittedResult.track})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nama Lengkap:</span>
                    <strong className="text-slate-800">{submittedResult.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">NIK Siswa:</span>
                    <span className="font-mono text-slate-700">{submittedResult.nik}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">WhatsApp:</span>
                    <span className="text-slate-700">{submittedResult.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Status Saat Ini:</span>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px]">
                      {submittedResult.status}
                    </span>
                  </div>
                </div>

                <div className="border-t border-blue-200/80 pt-3 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Waktu Pengajuan: {submittedResult.submittedAt}</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Tercatat di Sistem
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handlePrint}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Bukti Pendaftaran</span>
                </button>
                <button
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Step 1: Program Selection */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Pilih Jenjang Kesetaraan
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { type: 'Paket A' as PackageType, label: 'Paket A (Setara SD)', desc: 'Literasi & Numerasi Dasar' },
                        { type: 'Paket B' as PackageType, label: 'Paket B (Setara SMP)', desc: 'Sains, Sosial & Komputer' },
                        { type: 'Paket C' as PackageType, label: 'Paket C (Setara SMA)', desc: 'Peminatan IPS & Vokasi' },
                      ].map((item) => (
                        <div
                          key={item.type}
                          onClick={() => setPackageType(item.type)}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                            packageType === item.type
                              ? 'border-blue-700 bg-blue-50/60 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-slate-900">{item.label}</span>
                            <input
                              type="radio"
                              name="package"
                              checked={packageType === item.type}
                              onChange={() => setPackageType(item.type)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Pilihan Jalur Belajar
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          val: 'Reguler (Tatap Muka & Daring)' as const,
                          title: 'Jalur Reguler (Blended Learning)',
                          desc: 'Kombinasi tatap muka tutorial sabtu-minggu dan materi e-learning mandiri.',
                        },
                        {
                          val: 'Kelas Mandiri / Pekerja' as const,
                          title: 'Jalur Mandiri / Pekerja (Jadwal Fleksibel)',
                          desc: 'Diperuntukkan bagi karyawan, wirausahawan, atau santri dengan jam kerja padat.',
                        },
                        {
                          val: 'Beasiswa Afirmasi' as const,
                          title: 'Jalur Beasiswa Afirmasi Masyarakat',
                          desc: 'Bebas biaya pendidikan bagi keluarga pra-sejahtera ber-KIP / SKTM.',
                        },
                      ].map((j) => (
                        <label
                          key={j.val}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                            track === j.val ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="track"
                            checked={track === j.val}
                            onChange={() => setTrack(j.val)}
                            className="mt-0.5 text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{j.title}</div>
                            <div className="text-[11px] text-slate-500">{j.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Personal Information */}
              {step === 2 && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Lengkap Calon Siswa (Sesuai Ijazah/Akta) *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Contoh: Muhammad Budi Pratama"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nomor Induk Kependudukan (NIK 16 Digit) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={16}
                        value={nik}
                        onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                        placeholder="3201xxxxxxxxxxxx"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        NISN (Nomor Induk Siswa Nasional - Jika ada)
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={nisn}
                        onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
                        placeholder="00xxxxxxxx"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin *</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as 'Laki-laki' | 'Perempuan')}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tempat Lahir *</label>
                      <input
                        type="text"
                        required
                        value={birthPlace}
                        onChange={(e) => setBirthPlace(e.target.value)}
                        placeholder="Kota / Kabupaten Lahir"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir *</label>
                      <input
                        type="date"
                        required
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp / HP Aktif *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="081234567890"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Aktif</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh@gmail.com"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Domisili Lengkap *</label>
                      <textarea
                        rows={2}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Kode Pos"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Documents and Parents */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pendidikan Terakhir Siswa
                      </label>
                      <select
                        value={lastEducation}
                        onChange={(e) => setLastEducation(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      >
                        <option value="SD / MI Sederajat">SD / MI Sederajat</option>
                        <option value="SMP / MTs Sederajat">SMP / MTs Sederajat</option>
                        <option value="Pondok Pesantren Salaf">Pondok Pesantren Salaf</option>
                        <option value="Putus Sekolah Dasar">Putus Sekolah Dasar</option>
                        <option value="Putus Sekolah Menengah">Putus Sekolah Menengah</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Orang Tua / Wali / Penanggung Jawab
                      </label>
                      <input
                        type="text"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="Nama Ayah / Ibu / Wali Murid"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Kelengkapan Berkas Persyaratan (Dapodik Kemendikbudristek)
                    </label>
                    <p className="text-xs text-slate-500 mb-3">
                      Centang berkas yang telah Anda siapkan. Dokumen fisik dapat diserahkan saat wawancara atau diunggah via portal belajar.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { key: 'ktpOrKia' as const, label: 'KTP / KIA / Akta Kelahiran' },
                        { key: 'kartuKeluarga' as const, label: 'Kartu Keluarga (KK)' },
                        { key: 'ijazahTerakhir' as const, label: 'Ijazah Terakhir / Surat Keterangan Lulus' },
                        { key: 'pasFoto' as const, label: 'Pas Foto 3x4 Background Merah/Biru' },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 cursor-pointer transition text-xs font-medium text-slate-800"
                        >
                          <input
                            type="checkbox"
                            checked={docs[item.key]}
                            onChange={(e) => setDocs({ ...docs, [item.key]: e.target.checked })}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Summary & Agreement */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-2">
                    <h5 className="font-bold text-blue-900 text-sm">Ringkasan Pendaftaran Calon Siswa</h5>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div><strong>Nama:</strong> {fullName}</div>
                      <div><strong>NIK:</strong> {nik}</div>
                      <div><strong>Program:</strong> {packageType}</div>
                      <div><strong>Jalur:</strong> {track}</div>
                      <div><strong>No. HP:</strong> {phone}</div>
                      <div><strong>Kelamin:</strong> {gender}</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" required defaultChecked className="mt-0.5 rounded text-blue-600" />
                      <span>
                        Saya menyatakan bahwa seluruh data yang diisikan adalah benar dan bersedia mengikuti tata tertib akademik serta pembelajaran di PKBM Menara.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-xs font-semibold text-white shadow-xs"
                  >
                    <span>Lanjutkan</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-md transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Kirim Pendaftaran (Submit)</span>
                  </button>
                )}
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
