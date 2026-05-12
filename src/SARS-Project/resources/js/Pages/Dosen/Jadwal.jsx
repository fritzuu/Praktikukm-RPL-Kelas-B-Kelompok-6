import { useState } from 'react';
import { 
    Calendar, 
    BookOpen, 
    TrendingUp, 
    CalendarDays, 
    Clock, 
    MapPin, 
    Users,
    ChevronRight
} from 'lucide-react';
import DosenLayout from '../../Layouts/DosenLayout';

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
    // Map JS getDay() (0=Minggu, 6=Sabtu) ke key hari
    const getTodayKey = () => {
        const jsDay = new Date().getDay();
        const dayMap = { 0: 'senin', 1: 'senin', 2: 'selasa', 3: 'rabu', 4: 'kamis', 5: 'jumat', 6: 'senin' };
        return dayMap[jsDay];
    };

    const [selectedDay, setSelectedDay] = useState(getTodayKey());

    const dayJadwal = jadwal.filter(j => j.hari === selectedDay);

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
            color: 'bg-info/10 text-info',
        }
    ];

    return (
        <>
            {/* ── Header Section ────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <CalendarDays className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                            Jadwal Mengajar
                        </h1>
                        <p className="text-sm text-text-muted mt-0.5">
                            Semester {semester?.nama || 'Ganjil'} TA {semester?.tahun || '2025/2026'}
                        </p>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {statCards.map((card, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-xl px-4 py-2 flex flex-col items-center justify-center min-w-[100px]">
                            <p className="text-xs text-text-muted font-medium mb-0.5">{card.label}</p>
                            <p className="text-lg font-bold text-text-primary">
                                {card.value} <span className="text-[10px] font-medium text-text-muted">{card.suffix}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Main Schedule Area ────────────────────────────────── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                {/* Day Selector Tabs */}
                <div className="flex items-center gap-1 bg-surface/50 p-1.5 border-b border-border overflow-x-auto">
                    {HARI_LIST.map((hari) => (
                        <button
                            key={hari.key}
                            onClick={() => setSelectedDay(hari.key)}
                            className={`
                                flex-1 min-w-[100px] px-4 py-2.5 rounded-xl text-sm font-bold transition-all
                                ${selectedDay === hari.key
                                    ? 'bg-white text-primary-500 shadow-sm border border-border/50'
                                    : 'text-text-muted hover:text-text-primary hover:bg-white/50'
                                }
                            `}
                        >
                            {hari.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6">
                    {dayJadwal.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar size={32} className="text-text-muted" />
                            </div>
                            <h3 className="text-lg font-bold text-text-primary">
                                Tidak ada jadwal hari {HARI_LIST.find(h => h.key === selectedDay)?.label}
                            </h3>
                            <p className="text-sm text-text-muted mt-1">
                                Anda bebas dari kegiatan mengajar pada hari ini.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {dayJadwal.map((item) => (
                                <div 
                                    key={item.id}
                                    className="group bg-surface border border-border rounded-2xl p-5 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300"
                                >
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-md uppercase tracking-wider w-fit">
                                                {item.kode}
                                            </span>
                                            <h3 className="font-bold text-text-primary leading-tight group-hover:text-primary-500 transition-colors">
                                                {item.nama}
                                            </h3>
                                        </div>
                                        <div className="bg-white border border-border rounded-lg p-2 text-center min-w-[45px] shadow-sm">
                                            <p className="text-sm font-bold text-text-primary leading-none">{item.durasi}</p>
                                            <p className="text-[9px] text-text-muted font-medium uppercase mt-1">Sesi</p>
                                        </div>
                                    </div>

                                    {/* Info Rows */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                                                <Clock size={14} className="text-primary-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-text-muted font-medium leading-none mb-1">Waktu & Sesi</p>
                                                <p className="text-sm font-semibold text-text-primary leading-none">
                                                    {item.waktu} <span className="text-text-muted ml-1">(Sesi {item.sesiMulai})</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                                                <MapPin size={14} className="text-primary-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-text-muted font-medium leading-none mb-1">Ruangan & Kelas</p>
                                                <p className="text-sm font-semibold text-text-primary leading-none">
                                                    {item.ruangan} {item.kelas !== '-' && `• Kelas ${item.kelas}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                                                <Users size={14} className="text-primary-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-text-muted font-medium leading-none mb-1">Mahasiswa</p>
                                                <p className="text-sm font-semibold text-text-primary leading-none">
                                                    {item.mahasiswa} Terdaftar
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <button className="w-full mt-5 py-2.5 rounded-xl bg-white border border-border text-xs font-bold text-text-secondary hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all flex items-center justify-center gap-2 group-hover:shadow-md">
                                        Lihat Detail Pertemuan
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

DosenJadwal.layout = (page) => <DosenLayout>{page}</DosenLayout>;
