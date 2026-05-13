import { useState } from 'react';
import { 
    Calendar, 
    CalendarDays, 
    Clock, 
    MapPin, 
    Download,
    Filter,
    Search,
    BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DosenLayout from '../../Layouts/DosenLayout';
import Modal from '../../Components/Modal';

const HARI_LIST = [
    { key: 'senin', label: 'Senin' },
    { key: 'selasa', label: 'Selasa' },
    { key: 'rabu', label: 'Rabu' },
    { key: 'kamis', label: 'Kamis' },
    { key: 'jumat', label: 'Jumat' },
];

export default function DosenJadwal({ 
    jadwal = [], 
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

    const dayJadwal = jadwal.filter(j => 
        j.hari === selectedDay && 
        (j.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
         j.kode.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleOpenDetail = (item) => {
        setSelectedJadwal(item);
    };

    const handleCloseModal = () => {
        setSelectedJadwal(null);
    };

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
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-text-secondary text-sm font-medium hover:bg-surface transition-all shadow-sm">
                        <Download size={16} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-text-secondary text-sm font-medium hover:bg-surface transition-all shadow-sm">
                        <Filter size={16} />
                        <span className="hidden sm:inline">Filter</span>
                    </button>
                </div>
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
                        className="w-full pl-12 pr-4 py-2.5 bg-card border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary-500/50 transition-all shadow-sm"
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
                                        onClick={() => handleOpenDetail(item)}
                                        className="group bg-white border border-border rounded-xl p-5 hover:border-primary-500/40 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="flex flex-col gap-1.5 mb-5">
                                            <span className="text-[10px] font-bold bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-md uppercase tracking-wider w-fit">
                                                {item.kode}
                                            </span>
                                            <h3 className="text-base font-bold text-text-primary line-clamp-2 leading-tight group-hover:text-primary-500 transition-colors">
                                                {item.nama}
                                            </h3>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-text-secondary group-hover:bg-primary-500/10 group-hover:text-primary-500 transition-colors">
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
                                                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-text-secondary group-hover:bg-primary-500/10 group-hover:text-primary-500 transition-colors">
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
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Detail Modal ────────────────────────── */}
            <Modal
                isOpen={!!selectedJadwal}
                onClose={handleCloseModal}
                title="Detail Mata Kuliah"
                maxWidth="lg"
            >
                {selectedJadwal && (
                    <div className="space-y-6 text-text-primary">
                        <div className="bg-surface/50 rounded-2xl p-6 border border-border">
                            <div className="flex items-center gap-5 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                                    <BookOpen size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold leading-tight">{selectedJadwal.nama}</h4>
                                    <p className="text-primary-500 font-bold text-xs mt-1 uppercase tracking-wider">{selectedJadwal.kode}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Ruangan', value: selectedJadwal.ruangan },
                                    { label: 'Kelas', value: selectedJadwal.kelas },
                                    { label: 'Waktu', value: selectedJadwal.waktu },
                                    { label: 'Kapasitas', value: `${selectedJadwal.mahasiswa} MHS` },
                                ].map(detail => (
                                    <div key={detail.label} className="p-4 bg-white rounded-xl border border-border shadow-sm">
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">{detail.label}</p>
                                        <p className="text-sm font-bold text-text-primary">{detail.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleCloseModal}
                            className="w-full py-4 rounded-2xl bg-primary-500 text-white font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all"
                        >
                            Tutup
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
}

DosenJadwal.layout = (page) => <DosenLayout>{page}</DosenLayout>;
