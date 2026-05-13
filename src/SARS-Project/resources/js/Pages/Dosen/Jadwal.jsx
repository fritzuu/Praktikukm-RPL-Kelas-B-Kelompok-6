import { useState } from 'react';
import { 
    Calendar, 
    BookOpen, 
    TrendingUp, 
    CalendarDays, 
    Clock, 
    MapPin, 
    Users,
    ChevronRight,
    Download,
    Filter,
    Search,
    AlertCircle,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DosenLayout from '../../Layouts/DosenLayout';
import Modal from '../../Components/Modal';
import { useForm } from '@inertiajs/react';

const HARI_LIST = [
    { key: 'senin', label: 'Senin' },
    { key: 'selasa', label: 'Selasa' },
    { key: 'rabu', label: 'Rabu' },
    { key: 'kamis', label: 'Kamis' },
    { key: 'jumat', label: 'Jumat' },
];

export default function DosenJadwal({ 
    jadwal = [], 
    stats = { totalMataKuliah: 0, totalSks: 0, totalJadwal: 0 },
    semester = { nama: 'Ganjil', tahun: '2025/2026' }
}) {
    const getTodayKey = () => {
        const jsDay = new Date().getDay();
        const dayMap = { 0: 'senin', 1: 'senin', 2: 'selasa', 3: 'rabu', 4: 'kamis', 5: 'jumat', 6: 'senin' };
        return dayMap[jsDay];
    };

    const [selectedDay, setSelectedDay] = useState(getTodayKey());
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJadwal, setSelectedJadwal] = useState(null);
    const [isRequesting, setIsRequesting] = useState(false);

    const dayJadwal = jadwal.filter(j => 
        j.hari === selectedDay && 
        (j.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
         j.kode.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const { data, setData, post, processing, errors, reset } = useForm({
        schedule_id: '',
        request_type: 'RESCHEDULE',
        proposed_day: '',
        proposed_start_time: '',
        proposed_end_time: '',
        reason: '',
    });

    const handleOpenDetail = (item) => {
        setSelectedJadwal(item);
        setData('schedule_id', item.id);
        setIsRequesting(false);
    };

    const handleCloseModal = () => {
        setSelectedJadwal(null);
        setIsRequesting(false);
        reset();
    };

    const handleSubmitRequest = (e) => {
        e.preventDefault();
        post(route('dosen.jadwal.request'), {
            onSuccess: () => {
                handleCloseModal();
            },
        });
    };

    const statCards = [
        {
            label: 'Total Mata Kuliah',
            value: stats.totalMataKuliah,
            suffix: 'MK',
            icon: BookOpen,
            bgGradient: 'from-blue-500/20 to-blue-600/20',
            textColor: 'text-blue-400',
            borderColor: 'border-blue-500/30',
        },
        {
            label: 'Beban Mengajar',
            value: stats.totalSks,
            suffix: 'SKS',
            icon: TrendingUp,
            bgGradient: 'from-green-500/20 to-green-600/20',
            textColor: 'text-green-400',
            borderColor: 'border-green-500/30',
        },
        {
            label: 'Total Pertemuan',
            value: stats.totalJadwal,
            suffix: 'Minggu',
            icon: Calendar,
            bgGradient: 'from-orange-500/20 to-orange-600/20',
            textColor: 'text-orange-400',
            borderColor: 'border-orange-500/30',
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <>
            {/* ── Header Section ────────────────────────────────────── */}
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-8"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <CalendarDays className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Jadwal Mengajar
                            </h1>
                            <p className="text-white/60 mt-1">
                                Semester {semester?.nama || 'Ganjil'} TA {semester?.tahun || '2025/2026'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all duration-200 hover:shadow-md">
                            <Download size={16} />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all duration-200 hover:shadow-md">
                            <Filter size={16} />
                            <span className="hidden sm:inline">Filter</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <motion.div 
                                key={idx}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`bg-gradient-to-br ${card.bgGradient} border ${card.borderColor} rounded-2xl p-5 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-current/5 group relative overflow-hidden`}
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500" />
                                <div className="flex items-center justify-between relative z-10">
                                    <div>
                                        <p className="text-white/60 text-sm font-medium mb-2">{card.label}</p>
                                        <p className="text-3xl font-bold text-white">
                                            {card.value}
                                            <span className="text-sm font-medium text-white/60 ml-2">{card.suffix}</span>
                                        </p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl ${card.bgGradient} border ${card.borderColor} flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                                        <Icon className={`${card.textColor}`} size={24} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ── Search Bar ────────────────────────────────────── */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
            >
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input
                        type="text"
                        placeholder="Cari mata kuliah atau kode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all shadow-inner"
                    />
                </div>
            </motion.div>

            {/* ── Main Schedule Area ────────────────────────────── */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-1 bg-white/5 p-2 border-b border-white/10 overflow-x-auto no-scrollbar">
                    {HARI_LIST.map((hari) => (
                        <button
                            key={hari.key}
                            onClick={() => setSelectedDay(hari.key)}
                            className={`
                                flex-1 min-w-[100px] px-4 py-3 rounded-xl text-sm font-bold transition-all relative
                                ${selectedDay === hari.key
                                    ? 'text-white'
                                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                                }
                            `}
                        >
                            {selectedDay === hari.key && (
                                <motion.div 
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/20"
                                    transition={{ type: 'spring', duration: 0.5 }}
                                />
                            )}
                            <span className="relative z-10">{hari.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {dayJadwal.length === 0 ? (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="py-24 text-center"
                            >
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                                    <Calendar size={32} className="text-white/20" />
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    Tidak ada jadwal hari {HARI_LIST.find(h => h.key === selectedDay)?.label}
                                </h3>
                                <p className="text-white/40 mt-2 max-w-xs mx-auto">
                                    Anda bebas dari kegiatan mengajar pada hari ini. Nikmati waktu istirahat Anda!
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="list"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                            >
                                {dayJadwal.map((item) => (
                                    <motion.div 
                                        key={item.id}
                                        variants={itemVariants}
                                        className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10 hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                                                <ArrowRight size={14} className="text-orange-300" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 mb-6">
                                            <span className="text-[10px] font-black bg-orange-500 text-white px-2.5 py-0.5 rounded-full uppercase tracking-widest w-fit shadow-lg shadow-orange-500/20">
                                                {item.kode}
                                            </span>
                                            <h3 className="text-lg font-bold text-white leading-snug group-hover:text-orange-300 transition-colors">
                                                {item.nama}
                                            </h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 group-hover:border-orange-500/30 transition-colors">
                                                    <Clock size={16} className="text-white/40 group-hover:text-orange-300" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-0.5">Waktu & Sesi</p>
                                                    <p className="text-sm font-bold text-white">
                                                        {item.waktu} <span className="text-orange-300/60 ml-1">(Sesi {item.sesiMulai})</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 group-hover:border-orange-500/30 transition-colors">
                                                    <MapPin size={16} className="text-white/40 group-hover:text-orange-300" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-0.5">Ruangan & Kelas</p>
                                                    <p className="text-sm font-bold text-white">
                                                        {item.ruangan} {item.kelas !== '-' && <span className="text-white/40 font-medium ml-1">• Kelas {item.kelas}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => handleOpenDetail(item)}
                                            className="w-full mt-8 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white/70 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all shadow-sm group-hover:shadow-orange-500/20"
                                        >
                                            Lihat Detail
                                        </button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Detail & Request Modal ────────────────────────── */}
            <Modal
                isOpen={!!selectedJadwal}
                onClose={handleCloseModal}
                title={isRequesting ? 'Pengajuan Perubahan Jadwal' : 'Detail Mata Kuliah'}
                maxWidth={isRequesting ? '3xl' : 'lg'}
            >
                {selectedJadwal && (
                    <div className="space-y-6">
                        {!isRequesting ? (
                            <>
                                {/* Detail View */}
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                                            <BookOpen size={32} />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-bold text-white">{selectedJadwal.nama}</h4>
                                            <p className="text-orange-400 font-bold uppercase tracking-widest text-xs">{selectedJadwal.kode}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Ruangan</p>
                                            <p className="text-white font-bold">{selectedJadwal.ruangan}</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Kelas</p>
                                            <p className="text-white font-bold">{selectedJadwal.kelas}</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Waktu</p>
                                            <p className="text-white font-bold">{selectedJadwal.waktu}</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Kapasitas</p>
                                            <p className="text-white font-bold">{selectedJadwal.mahasiswa} MHS</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={() => setIsRequesting(true)}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        <AlertCircle size={20} />
                                        Ajukan Perubahan Jadwal
                                    </button>
                                    <button 
                                        onClick={handleCloseModal}
                                        className="w-full py-4 rounded-2xl bg-white/5 text-white/60 font-bold hover:text-white transition-colors"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* Request Form */
                            <form onSubmit={handleSubmitRequest} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">Hari Baru</label>
                                        <select 
                                            value={data.proposed_day}
                                            onChange={e => setData('proposed_day', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
                                            required
                                        >
                                            <option value="" className="bg-[#1a1f2e]">Pilih Hari</option>
                                            {HARI_LIST.map(h => (
                                                <option key={h.key} value={h.key} className="bg-[#1a1f2e]">{h.label}</option>
                                            ))}
                                        </select>
                                        {errors.proposed_day && <p className="text-red-400 text-xs mt-1">{errors.proposed_day}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">Tipe Perubahan</label>
                                        <select 
                                            value={data.request_type}
                                            onChange={e => setData('request_type', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
                                        >
                                            <option value="RESCHEDULE" className="bg-[#1a1f2e]">Pindah Jadwal (Permanen)</option>
                                            <option value="EXCHANGE" className="bg-[#1a1f2e]">Tukar Jadwal</option>
                                            <option value="MAKEUP" className="bg-[#1a1f2e]">Jadwal Pengganti</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">Jam Mulai</label>
                                        <input 
                                            type="time" 
                                            value={data.proposed_start_time}
                                            onChange={e => setData('proposed_start_time', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">Jam Selesai</label>
                                        <input 
                                            type="time" 
                                            value={data.proposed_end_time}
                                            onChange={e => setData('proposed_end_time', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">Alasan Perubahan</label>
                                    <textarea 
                                        rows="4"
                                        value={data.reason}
                                        onChange={e => setData('reason', e.target.value)}
                                        placeholder="Berikan alasan yang jelas untuk pengajuan ini..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 resize-none"
                                        required
                                    ></textarea>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsRequesting(false)}
                                        className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
                                    >
                                        Kembali
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={processing}
                                        className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                    >
                                        {processing ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <CheckCircle2 size={20} />
                                        )}
                                        Kirim Pengajuan
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}

DosenJadwal.layout = (page) => <DosenLayout>{page}</DosenLayout>;
