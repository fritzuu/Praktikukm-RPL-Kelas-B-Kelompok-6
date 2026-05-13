import { useState } from 'react';
import { CalendarDays, Clock, Users, MapPin } from 'lucide-react';
import { MOCK_DOSEN_JADWAL } from '../../data/dosenMockData';

const HARI_LIST = [
    { key: 'senin', label: 'Senin' },
    { key: 'selasa', label: 'Selasa' },
    { key: 'rabu', label: 'Rabu' },
    { key: 'kamis', label: 'Kamis' },
    { key: 'jumat', label: 'Jumat' },
];

// Map JS getDay() (0=Minggu, 6=Sabtu) ke key hari
function getTodayKey() {
    const jsDay = new Date().getDay();
    const dayMap = {
        0: 'senin',
        1: 'senin',
        2: 'selasa',
        3: 'rabu',
        4: 'kamis',
        5: 'jumat',
        6: 'senin',
    };
    return dayMap[jsDay];
}

export default function ScheduleGrid({ jadwalItems = MOCK_DOSEN_JADWAL }) {
    const [selectedDay, setSelectedDay] = useState(getTodayKey);

    const dayJadwal = jadwalItems.filter(j => j.hari === selectedDay);

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
            <div className="flex space-x-6 border-b border-border mb-6 px-1">
                {HARI_LIST.map((hari) => (
                    <button
                        key={hari.key}
                        onClick={() => setSelectedDay(hari.key)}
                        className={`pb-2 text-sm font-semibold border-b-2 transition-all ${
                            selectedDay === hari.key
                                ? 'border-primary-500 text-primary-500 translate-y-[1px]'
                                : 'border-transparent text-text-muted hover:text-text-primary'
                        }`}
                    >
                        {hari.label}
                    </button>
                ))}
            </div>

            {/* Schedule Cards */}
            {dayJadwal.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
                    <CalendarDays size={40} className="text-text-muted mx-auto mb-3" />
                    <p className="text-text-secondary font-medium">Tidak ada jadwal pada hari ini</p>
                    <p className="text-text-muted text-sm mt-1">Nikmati waktu istirahat Anda.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {dayJadwal.map((item) => {
                        const endSession = item.sesiMulai + item.durasi - 1;
                        const sessionRange = item.durasi > 1 
                            ? `${item.sesiMulai} - ${endSession} Sesi`
                            : `${item.sesiMulai} Sesi`;

                        return (
                            <div
                                key={item.id}
                                className="bg-card border border-border rounded-2xl p-5 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 group"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Metadata Badges */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-bold bg-primary-500/10 text-primary-500 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                                {item.kode}
                                            </span>
                                            {item.kelas !== '-' && (
                                                <span className="text-[10px] font-medium text-text-muted bg-surface px-2.5 py-1 rounded-md">
                                                    Kelas {item.kelas}
                                                </span>
                                            )}
                                        </div>

                                        {/* Course Name */}
                                        <h3 className="text-base font-bold text-text-primary mb-3 group-hover:text-primary-500 transition-colors">
                                            {item.nama}
                                        </h3>

                                        {/* Details Row */}
                                        <div className="flex flex-wrap items-center gap-4 text-text-muted">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-text-muted/60" />
                                                <span className="text-xs font-medium">{sessionRange}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={14} className="text-text-muted/60" />
                                                <span className="text-xs font-medium">{item.ruangan}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users size={14} className="text-text-muted/60" />
                                                <span className="text-xs font-medium">{item.mahasiswa} mhs</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Session Duration Indicator */}
                                    <div className="flex flex-col items-center justify-center min-w-[60px] py-2 border-l border-border pl-4">
                                        <span className="text-3xl font-black text-text-primary leading-none">
                                            {item.durasi}
                                        </span>
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1.5">
                                            Sesi
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
