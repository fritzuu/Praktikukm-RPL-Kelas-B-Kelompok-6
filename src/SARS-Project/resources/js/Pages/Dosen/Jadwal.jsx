import { useState } from 'react';
import { 
    Calendar, 
    BookOpen, 
    TrendingUp, 
    CalendarDays, 
    Clock, 
    MapPin, 
    Download,
    Filter,
    Search,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    Users
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
    semester = { nama: 'Ganjil', tahun: '2024/2025' }
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
            color: 'bg-primary-500/10 text-primary-500',
        },
        {
            label: 'Beban Mengajar',
            value: stats.totalSks,
            suffix: 'SKS',
            icon: TrendingUp,
            color: 'bg-success/10 text-success',
        },
        {
            label: 'Total Pertemuan',
            value: stats.totalJadwal,
            suffix: 'Minggu',
            icon: Calendar,
            color: 'bg-warning/10 text-warning',
        }
    ];

    return (
        <div className="space-y-6">
            {/* ── Header Section ────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <CalendarDays className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                            Jadwal Mengajar
                        </h1>
                        <p className="text-text-secondary text-sm">
                            Semester {semester?.nama || 'Ganjil'} TA {semester?.tahun || '2024/2025'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-text-secondary text-sm font-medium hover:bg-surface transition-all">
                        <Download size={16} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-text-secondary text-sm font-medium hover:bg-surface transition-all">
                        <Filter size={16} />
                        <span className="hidden sm:inline">Filter</span>
                    </button>
                </div>
            </div>

            {/* ── Stats Area ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-text-primary">
                                {card.value}
                                <span className="text-sm font-medium text-text-muted ml-1">{card.suffix}</span>
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">{card.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* ── Search & Filter ───────────────────────────────────── */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Cari mata kuliah atau kode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-card border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary-500/50 transition-all"
                    />
                </div>
            </div>

            {/* ── Main Schedule Grid ────────────────────────────────── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-1 bg-surface p-1.5 border-b border-border overflow-x-auto no-scrollbar">
                    {HARI_LIST.map((hari) => (
                        <button
                            key={hari.key}
                            onClick={() => setSelectedDay(hari.key)}
                            className={`
                                flex-1 min-w-[100px] px-4 py-2.5 rounded-lg text-sm font-bold transition-all relative
                                ${selectedDay === hari.key
                                    ? 'bg-primary-500 text-white shadow-md'
                                    : 'text-text-secondary hover:bg-white/50 hover:text-text-primary'
                                }
                            `}
                        >
                            {hari.label}
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
                                className="py-20 text-center"
                            >
                                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar size={24} className="text-text-muted" />
                                </div>
                                <h3 className="text-lg font-bold text-text-primary">
                                    Tidak ada jadwal hari {HARI_LIST.find(h => h.key === selectedDay)?.label}
                                </h3>
                                <p className="text-text-muted text-sm mt-1">
                                    Anda bebas dari kegiatan mengajar pada hari ini.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                            >
                                {dayJadwal.map((item) => (
                                    <div 
                                        key={item.id}
                                        className="group bg-white border border-border rounded-xl p-5 hover:border-primary-500/40 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex flex-col gap-1.5 mb-5">
                                            <span className="text-[10px] font-bold bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-md uppercase tracking-wider w-fit">
                                                {item.kode}
                                            </span>
                                            <h3 className="text-base font-bold text-text-primary line-clamp-2 leading-tight">
                                                {item.nama}
                                            </h3>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-text-secondary">
                                                    <Clock size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Waktu</p>
                                                    <p className="text-xs font-semibold text-text-primary">
                                                        {item.waktu} <span className="text-text-muted font-medium">(Sesi {item.sesiMulai})</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-text-secondary">
                                                    <MapPin size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Ruangan</p>
                                                    <p className="text-xs font-semibold text-text-primary">
                                                        {item.ruangan} {item.kelas !== '-' && <span className="text-text-muted font-medium ml-1">• Kelas {item.kelas}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => handleOpenDetail(item)}
                                            className="w-full mt-6 py-2.5 rounded-lg bg-surface text-[11px] font-bold uppercase tracking-wider text-text-secondary hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                                        >
                                            Lihat Detail
                                        </button>
                                    </div>
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
                title={isRequesting ? 'Pengajuan Perubahan' : 'Detail Mata Kuliah'}
                maxWidth={isRequesting ? '2xl' : 'lg'}
            >
                {selectedJadwal && (
                    <div className="space-y-6 text-text-primary">
                        {!isRequesting ? (
                            <>
                                <div className="bg-surface rounded-xl p-5 border border-border">
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                                            <BookOpen size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold">{selectedJadwal.nama}</h4>
                                            <p className="text-primary-500 font-bold text-xs">{selectedJadwal.kode}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Ruangan', value: selectedJadwal.ruangan },
                                            { label: 'Kelas', value: selectedJadwal.kelas },
                                            { label: 'Waktu', value: selectedJadwal.waktu },
                                            { label: 'Kapasitas', value: `${selectedJadwal.mahasiswa} MHS` },
                                        ].map(detail => (
                                            <div key={detail.label} className="p-3 bg-white rounded-lg border border-border">
                                                <p className="text-[10px] text-text-muted font-bold uppercase mb-0.5">{detail.label}</p>
                                                <p className="text-sm font-bold">{detail.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => setIsRequesting(true)}
                                        className="w-full py-3 rounded-xl bg-primary-500 text-white font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <AlertCircle size={18} />
                                        Ajukan Perubahan Jadwal
                                    </button>
                                    <button 
                                        onClick={handleCloseModal}
                                        className="w-full py-3 rounded-xl bg-surface text-text-secondary font-bold hover:text-text-primary transition-colors"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleSubmitRequest} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Hari Baru</label>
                                        <select 
                                            value={data.proposed_day}
                                            onChange={e => setData('proposed_day', e.target.value)}
                                            className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                            required
                                        >
                                            <option value="">Pilih Hari</option>
                                            {HARI_LIST.map(h => (
                                                <option key={h.key} value={h.key}>{h.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tipe Perubahan</label>
                                        <select 
                                            value={data.request_type}
                                            onChange={e => setData('request_type', e.target.value)}
                                            className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="RESCHEDULE">Pindah Jadwal (Permanen)</option>
                                            <option value="EXCHANGE">Tukar Jadwal</option>
                                            <option value="MAKEUP">Jadwal Pengganti</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Jam Mulai</label>
                                        <input 
                                            type="time" 
                                            value={data.proposed_start_time}
                                            onChange={e => setData('proposed_start_time', e.target.value)}
                                            className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Jam Selesai</label>
                                        <input 
                                            type="time" 
                                            value={data.proposed_end_time}
                                            onChange={e => setData('proposed_end_time', e.target.value)}
                                            className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Alasan Perubahan</label>
                                    <textarea 
                                        rows="3"
                                        value={data.reason}
                                        onChange={e => setData('reason', e.target.value)}
                                        placeholder="Berikan alasan yang jelas..."
                                        className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm resize-none"
                                        required
                                    ></textarea>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button 
                                        type="button"
                                        onClick={() => setIsRequesting(false)}
                                        className="flex-1 py-3 rounded-xl bg-surface text-text-primary font-bold hover:bg-border transition-all"
                                    >
                                        Kembali
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={processing}
                                        className="flex-[2] py-3 rounded-xl bg-primary-500 text-white font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        {processing ? 'Mengirim...' : 'Kirim Pengajuan'}
                                        {!processing && <CheckCircle2 size={18} />}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

DosenJadwal.layout = (page) => <DosenLayout>{page}</DosenLayout>;
