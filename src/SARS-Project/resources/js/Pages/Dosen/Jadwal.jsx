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
import ScheduleGrid from '../../Components/Shared/ScheduleGrid';

const HARI_LIST = [
    { key: 'senin', label: 'Senin' },
    { key: 'selasa', label: 'Selasa' },
    { key: 'rabu', label: 'Rabu' },
    { key: 'kamis', label: 'Kamis' },
    { key: 'jumat', label: 'Jumat' },
];

export default function DosenJadwal({ 
    jadwal = [], 
    allSchedules = [],
    rooms = [],
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
    const [isLoadingDay, setIsLoadingDay] = useState(false);

    const handleSelectDay = (day) => {
        setIsLoadingDay(true);
        setSelectedDay(day);
        setTimeout(() => setIsLoadingDay(false), 450);
    };

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
        <div className="space-y-8">
            {/* ── Header Section ────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <CalendarDays className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                            Jadwal Mengajar
                        </h1>
                        <p className="text-text-secondary text-sm">
                            Semester {semester?.nama || 'Ganjil'} TA {semester?.tahun || '2025/2026'}
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

            {/* ── Full Availability Grid ───────────────────────────── */}
            <ScheduleGrid jadwalItems={allSchedules} rooms={rooms} onCardClick={handleOpenDetail} />

            {/* ── My Schedule Section ──────────────────────────────── */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
                            <Clock size={18} />
                        </div>
                        <h2 className="text-xl font-bold text-text-primary">Daftar Jadwal Saya</h2>
                    </div>
                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                        <input
                            type="text"
                            placeholder="Cari mata kuliah..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-card border border-border rounded-lg text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary-500/50 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex items-center gap-1 bg-surface p-1.5 border-b border-border overflow-x-auto no-scrollbar">
                        {HARI_LIST.map((hari) => (
                            <button
                                key={hari.key}
                                onClick={() => handleSelectDay(hari.key)}
                                className={`
                                    flex-1 min-w-[100px] px-4 py-2.5 rounded-lg text-sm font-bold transition-all relative
                                    ${selectedDay === hari.key
                                        ? 'bg-primary-500 text-white shadow-md'
                                        : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                                    }
                                `}
                            >
                                {hari.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 relative min-h-[300px]">
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
                                            className="group bg-card border border-border rounded-xl p-5 hover:border-accent-cyan hover:scale-[1.02] hover:bg-accent-cyan/[0.03] hover:shadow-xl hover:shadow-accent-cyan/10 transition-all duration-300 cursor-pointer"
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
                                                            {item.waktu} <span className="text-text-muted font-medium ml-1">(Sesi {item.sesiMulai})</span>
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
                        
                        {isLoadingDay && (
                            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex flex-col items-center justify-center z-40 animate-fade-in rounded-b-2xl">
                                <div className="flex flex-col items-center gap-3 bg-card border border-border p-5 rounded-2xl shadow-xl">
                                    <div className="relative flex items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                                        <CalendarDays className="absolute text-primary-500 animate-pulse" size={16} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-text-primary">Memproses Jadwal...</p>
                                        <p className="text-[10px] text-text-muted mt-1">Mengambil data terbaru dari database</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Detail Modal ────────────────────────── */}
            <Modal
                isOpen={!!selectedJadwal}
                onClose={handleCloseModal}
                title="Detail Jadwal"
                maxWidth="md"
            >
                {selectedJadwal && (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Mata Kuliah</h4>
                            <p className="text-lg font-bold text-text-primary">{selectedJadwal.nama} ({selectedJadwal.kode})</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Kelas</h4>
                                <p className="font-medium text-text-primary">{selectedJadwal.kelas || '-'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Semester</h4>
                                <p className="font-medium text-text-primary">{selectedJadwal.semester || selectedJadwal.semesterNum || '-'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Ruangan</h4>
                                <p className="font-medium text-text-primary">{selectedJadwal.ruangan}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Hari</h4>
                                <p className="font-medium text-text-primary capitalize">{selectedJadwal.hari}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Waktu</h4>
                                <p className="font-medium text-text-primary">
                                    {selectedJadwal.jamMulai && selectedJadwal.jamAkhir 
                                        ? `${selectedJadwal.jamMulai.substring(0,5)} - ${selectedJadwal.jamAkhir.substring(0,5)}` 
                                        : selectedJadwal.mulai && selectedJadwal.selesai
                                            ? `${selectedJadwal.mulai.substring(0,5)} - ${selectedJadwal.selesai.substring(0,5)}`
                                            : selectedJadwal.waktu || 'Waktu belum diatur'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Sesi</h4>
                                <p className="font-medium text-text-primary">
                                    {selectedJadwal.durasi > 1 
                                        ? `Sesi ${selectedJadwal.sesiMulai} - ${selectedJadwal.sesiMulai + selectedJadwal.durasi - 1}`
                                        : `Sesi ${selectedJadwal.sesiMulai}`}
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-border flex flex-col gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Dosen Pengajar</h4>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg">
                                        {selectedJadwal.dosen && selectedJadwal.dosen !== '-' ? selectedJadwal.dosen.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <p className="font-semibold text-text-primary">
                                        {!selectedJadwal.dosen || selectedJadwal.dosen === '-' ? 'Belum Ditentukan' : selectedJadwal.dosen}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-2">
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 py-3 bg-surface hover:bg-card border border-border text-text-secondary rounded-xl text-sm font-bold transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

DosenJadwal.layout = (page) => <DosenLayout>{page}</DosenLayout>;
