import { useState, useEffect } from 'react';
import { CalendarDays, Clock, MapPin, Users, Loader2 } from 'lucide-react';
import { MOCK_DOSEN_JADWAL } from '../../data/dosenMockData';

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

export default function ScheduleGrid({ jadwalItems = MOCK_DOSEN_JADWAL }) {
    const [selectedDay, setSelectedDay] = useState(getTodayKey);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [selectedDay]);

    const dayJadwal = jadwalItems.filter(j => j.hari === selectedDay);

    const LoadingSpinner = () => (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in w-full">
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
    );

    return (
        <section className="mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <CalendarDays size={20} className="text-text-primary" />
                    <h2 className="text-lg font-bold text-text-primary">
                        Jadwal Mengajar Saya
                    </h2>
                </div>
                <div className="text-xs text-text-muted">
                    Semester Genap 2025/2026
                </div>
            </div>

            {/* Day Selector Tabs */}
            <div className="flex space-x-8 border-b border-border mb-6 px-1 overflow-x-auto no-scrollbar">
                {HARI_LIST.map((hari) => (
                    <button
                        key={hari.key}
                        onClick={() => setSelectedDay(hari.key)}
                        className={`pb-2 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                            selectedDay === hari.key
                                ? 'border-primary-500 text-primary-500 translate-y-[1px]'
                                : 'border-transparent text-text-muted hover:text-text-primary'
                        }`}
                    >
                        {hari.label}
                    </button>
                ))}
            </div>

            {/* Schedule Cards Grid */}
            {isLoading ? (
                <LoadingSpinner />
            ) : dayJadwal.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
                    <CalendarDays size={40} className="text-text-muted mx-auto mb-3" />
                    <p className="text-text-secondary font-medium">Tidak ada jadwal pada hari ini</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dayJadwal.map((item) => (
                        <div
                            key={item.id}
                            className="bg-card border border-border rounded-2xl p-6 hover:border-accent-cyan hover:scale-[1.02] hover:bg-accent-cyan/[0.03] hover:shadow-xl hover:shadow-accent-cyan/10 transition-all duration-300 group flex flex-col"
                        >
                            {/* Course Badge */}
                            <div className="mb-3">
                                <span className="text-[10px] font-bold bg-primary-500/10 text-primary-500 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                    {item.kode}
                                </span>
                            </div>

                            {/* Course Name */}
                            <h3 className="text-lg font-bold text-text-primary mb-6 group-hover:text-primary-500 transition-colors leading-snug">
                                {item.nama}
                            </h3>

                            {/* Details List */}
                            <div className="space-y-4 flex-1">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-text-secondary shrink-0 group-hover:bg-primary-500/10 group-hover:text-primary-500 transition-colors">
                                        <Clock size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-0.5">Waktu</p>
                                        <p className="text-sm font-bold text-text-primary">
                                            {item.waktu} <span className="text-text-muted font-medium ml-1">(Sesi {item.sesiMulai})</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-text-secondary shrink-0 group-hover:bg-primary-500/10 group-hover:text-primary-500 transition-colors">
                                        <MapPin size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-0.5">Ruangan</p>
                                        <p className="text-sm font-bold text-text-primary">
                                            {item.ruangan} {item.kelas !== '-' && <span className="text-text-muted font-medium ml-1">• Kelas {item.kelas}</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Optional: Add "LIHAT DETAIL" button if you want it back */}
                            {/* <button className="w-full mt-8 py-3 rounded-xl bg-surface text-xs font-bold uppercase tracking-widest text-text-secondary hover:bg-primary-500 hover:text-white transition-all shadow-sm">
                                Lihat Detail
                            </button> */}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
