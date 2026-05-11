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

const TIPE_STYLES = {
    resmi: 'bg-primary-500/5 border-primary-500/30 text-primary-600',
    override: 'bg-warning/10 border-warning/50 text-warning-800',
};

// Map JS getDay() (0=Minggu, 6=Sabtu) ke key hari
function getTodayKey() {
    const jsDay = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const dayMap = {
        0: 'senin', // Minggu -> default Senin
        1: 'senin',
        2: 'selasa',
        3: 'rabu',
        4: 'kamis',
        5: 'jumat',
        6: 'senin', // Sabtu -> default Senin
    };
    return dayMap[jsDay];
}

export default function ScheduleGrid({ jadwalItems = MOCK_DOSEN_JADWAL }) {
    const [selectedDay, setSelectedDay] = useState(getTodayKey);

    const dayJadwal = jadwalItems.filter(j => j.hari === selectedDay);

    return (
        <section className="mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
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
            <div className="flex space-x-1 border-b border-border mb-4">
                {HARI_LIST.map((hari) => (
                    <button
                        key={hari.key}
                        onClick={() => setSelectedDay(hari.key)}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                            selectedDay === hari.key
                                ? 'border-primary-500 text-primary-500'
                                : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
                        }`}
                    >
                        {hari.label}
                    </button>
                ))}
            </div>

            {/* Schedule Cards */}
            {dayJadwal.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <CalendarDays size={40} className="text-text-muted mx-auto mb-3" />
                    <p className="text-text-secondary font-medium">Tidak ada jadwal pada hari ini</p>
                    <p className="text-text-muted text-sm mt-1">Anda bebas dari kegiatan mengajar.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {dayJadwal.map((item) => {
                        const styleClass = TIPE_STYLES[item.tipe] || TIPE_STYLES.resmi;
                        return (
                            <div
                                key={item.id}
                                className={`bg-card border rounded-xl px-5 py-4 hover:shadow-md transition-all duration-200 group ${styleClass}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Course Header */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-md">
                                                {item.kode}
                                            </span>
                                            {item.kelas !== '-' && (
                                                <span className="text-xs font-medium text-text-muted bg-surface px-2 py-0.5 rounded-md">
                                                    Kelas {item.kelas}
                                                </span>
                                            )}
                                            {item.tipe === 'override' && (
                                                <span className="text-[10px] font-bold bg-warning/10 text-warning px-2 py-0.5 rounded-md uppercase tracking-wide">
                                                    Override
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-text-primary text-sm group-hover:text-primary-500 transition-colors">
                                            {item.nama}
                                        </h3>

                                        {/* Details Row */}
                                        <div className="flex items-center gap-4 mt-2 text-text-muted">
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <Clock size={13} />
                                                <span>Sesi {item.sesiMulai} - {item.sesiMulai + item.durasi - 1}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <MapPin size={13} />
                                                <span>{item.ruangan}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <Users size={13} />
                                                <span>{item.mahasiswa} mhs</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Session indicator */}
                                    <div className="text-right shrink-0">
                                        <div className="text-2xl font-bold text-text-primary leading-none">
                                            {item.durasi}
                                        </div>
                                        <div className="text-[10px] text-text-muted uppercase tracking-wide mt-0.5">
                                            Sesi
                                        </div>
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
