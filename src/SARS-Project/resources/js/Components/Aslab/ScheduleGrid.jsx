import { useState, useEffect, useMemo } from 'react';
import { CalendarDays, Download, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HARI_LIST = [
    { key: 'senin', label: 'Senin' },
    { key: 'selasa', label: 'Selasa' },
    { key: 'rabu', label: 'Rabu' },
    { key: 'kamis', label: 'Kamis' },
    { key: 'jumat', label: 'Jumat' },
];

function getTodayKey() {
    const jsDay = new Date().getDay();
    const dayMap = { 0: 'senin', 1: 'senin', 2: 'selasa', 3: 'rabu', 4: 'kamis', 5: 'jumat', 6: 'senin' };
    return dayMap[jsDay];
}

export default function ScheduleGrid({ schedules = [], rooms = [] }) {
    const [selectedDay, setSelectedDay] = useState(getTodayKey);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => setIsLoading(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    const handleDayChange = (hari) => {
        if (hari !== selectedDay) {
            setIsLoading(true);
            setSelectedDay(hari);
        }
    };

    const dayJadwal = schedules.filter(j => j.hari === selectedDay);

    // Filter rooms to only include rooms that have at least one schedule
    const displayRooms = useMemo(() => {
        const roomIdsWithSchedules = new Set(schedules.map(s => s.ruangan_id).filter(Boolean));
        const roomNamesWithSchedules = new Set(schedules.map(s => s.ruangan).filter(Boolean));
        
        return rooms.filter(room => 
            roomIdsWithSchedules.has(room.id) || 
            roomNamesWithSchedules.has(room.code) || 
            roomNamesWithSchedules.has(room.name)
        );
    }, [rooms, schedules]);

    return (
        <section className="mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <CalendarDays size={20} className="text-text-primary" />
                    <h2 className="text-lg font-bold text-text-primary">
                        Jadwal Keseluruhan
                    </h2>
                </div>
                <div className="text-xs text-text-muted">
                    Semester Genap 2025/2026
                </div>
            </div>

            <div className="flex space-x-1 border-b border-border mb-4 px-1 overflow-x-auto no-scrollbar">
                {HARI_LIST.map((hari) => (
                    <button
                        key={hari.key}
                        onClick={() => handleDayChange(hari.key)}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                            selectedDay === hari.key
                                ? 'border-primary-500 text-primary-500 translate-y-[1px]'
                                : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
                        }`}
                    >
                        {hari.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="flex flex-col items-center justify-center py-20 animate-fade-in w-full"
                    >
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
                    </motion.div>
                ) : dayJadwal.length === 0 ? (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="bg-card border border-border rounded-xl p-12 text-center shadow-sm"
                    >
                        <CalendarDays size={40} className="text-text-muted mx-auto mb-3" />
                        <p className="text-text-secondary font-medium">Tidak ada jadwal pada hari ini</p>
                    </motion.div>
                ) : (
                    <motion.div 
                        key={selectedDay}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto shadow-sm"
                    >
                        <div className="min-w-[1200px]">
                            {/* Header Row: Rooms (Empty Corner) + 11 Sessions */}
                            <div className="grid grid-cols-[160px_repeat(11,_minmax(0,_1fr))] border-b border-border bg-card">
                                <div className="p-3 font-bold text-[11px] tracking-wider text-text-muted border-r border-border sticky left-0 bg-card z-30 flex items-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    RUANGAN
                                </div>
                                {Array.from({ length: 11 }, (_, i) => (
                                    <div key={i} className="p-3 text-center text-[10px] tracking-wider font-bold text-text-muted border-r border-border last:border-r-0">
                                        SESI {i + 1}
                                    </div>
                                ))}
                            </div>

                            {/* Rows: Each Room */}
                            {displayRooms.map(room => {
                                // Find classes for this room on the selected day
                                const roomClasses = dayJadwal.filter(j => j.ruangan_id === room.id || j.ruangan === room.code);
                                
                                return (
                                    <div key={room.id} className="grid grid-cols-[160px_repeat(11,_minmax(0,_1fr))] border-b border-border last:border-b-0 relative group hover:bg-background/30 transition-colors">
                                        {/* Room Label - Sticky */}
                                        <div className="p-3 font-semibold text-xs text-text-primary border-r border-border sticky left-0 bg-card z-20 flex items-center group-hover:bg-card shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors">
                                            <span className="truncate">{room.code}</span>
                                        </div>

                                        {/* Sessions Grid Container */}
                                        <div className="col-span-11 grid grid-cols-11 relative py-1.5 gap-y-1.5 min-h-[64px]">
                                            {/* Background Grid Lines for visual separation */}
                                            <div className="absolute inset-0 grid grid-cols-11 pointer-events-none">
                                                {Array.from({ length: 11 }, (_, i) => (
                                                    <div key={i} className="border-r border-border/40 last:border-r-0 h-full"></div>
                                                ))}
                                            </div>

                                            {/* Render Classes */}
                                            {roomClasses.map(item => {
                                                // A conflict occurs if there are overlapping sessions.
                                                const isConflict = roomClasses.some(other => 
                                                    other.id !== item.id &&
                                                    ((item.sesiMulai >= other.sesiMulai && item.sesiMulai < other.sesiMulai + other.durasi) ||
                                                    (other.sesiMulai >= item.sesiMulai && other.sesiMulai < item.sesiMulai + item.durasi))
                                                );

                                                const appliedStyle = isConflict
                                                    ? 'bg-danger/10 border-danger/50 text-danger-800 border-dashed'
                                                    : 'bg-primary-500/5 border-primary-500/30 text-primary-600';

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className={`relative z-10 mx-1 rounded-md border p-2 flex flex-col justify-center overflow-hidden transition-all hover:z-20 hover:shadow-md ${appliedStyle} ${isConflict ? 'ring-2 ring-danger/30' : ''}`}
                                                        style={{
                                                            gridColumnStart: item.sesiMulai,
                                                            gridColumnEnd: `span ${item.durasi}`
                                                        }}
                                                    >
                                                        {/* Header Row of Card */}
                                                        <div className="flex items-start justify-between gap-1 mb-1">
                                                            <span className="font-bold text-[10px] leading-none truncate">
                                                                {item.semesterNum && item.kelas ? `Semester ${item.semesterNum} - ${item.kode} (${item.kelas})` : item.kode}
                                                            </span>
                                                            {isConflict && (
                                                                <AlertTriangle size={12} className="text-danger flex-shrink-0 animate-pulse" />
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] leading-tight font-semibold opacity-90 truncate">
                                                            {item.nama}
                                                        </p>
                                                        <p className="text-[10px] mt-0.5 opacity-70 truncate">
                                                            {item.kelas !== '-' && item.kelas ? `Kelas ${item.kelas}` : ''}
                                                            {item.dosen && ` • ${item.dosen}`}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
