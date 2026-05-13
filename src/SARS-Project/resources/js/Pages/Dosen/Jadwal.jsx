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
    Search
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
    const getTodayKey = () => {
        const jsDay = new Date().getDay();
        const dayMap = { 0: 'senin', 1: 'senin', 2: 'selasa', 3: 'rabu', 4: 'kamis', 5: 'jumat', 6: 'senin' };
        return dayMap[jsDay];
    };

    const [selectedDay, setSelectedDay] = useState(getTodayKey());
    const [searchTerm, setSearchTerm] = useState('');

    const dayJadwal = jadwal.filter(j => 
        j.hari === selectedDay && 
        (j.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
         j.kode.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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

    return (
        <>
            {/* ── Header Section ────────────────────────────────────── */}
            <div className="mb-8">
                {/* Title & Semester Info */}
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

                    {/* Action Buttons */}
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

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <div 
                                key={idx} 
                                className={`bg-gradient-to-br ${card.bgGradient} border ${card.borderColor} rounded-xl p-5 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-current/10 group`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/60 text-sm font-medium mb-2">{card.label}</p>
                                        <p className="text-3xl font-bold text-white">
                                            {card.value}
                                            <span className="text-sm font-medium text-white/60 ml-2">{card.suffix}</span>
                                        </p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-lg ${card.bgGradient} border ${card.borderColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <Icon className={`${card.textColor}`} size={24} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Search Bar ────────────────────────────────────── */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                    <input
                        type="text"
                        placeholder="Cari mata kuliah atau kode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 focus:bg-white/20 transition-all"
                    />
                </div>
            </div>

            {/* ── Main Schedule Area ────────────────────────────── */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
                {/* Day Selector Tabs */}
                <div className="flex items-center gap-2 bg-white/5 p-2 border-b border-white/10 overflow-x-auto">
                    {HARI_LIST.map((hari) => (
                        <button
                            key={hari.key}
                            onClick={() => setSelectedDay(hari.key)}
                            className={`
                                flex-1 min-w-[90px] px-3 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                                ${selectedDay === hari.key
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 border border-orange-400/50'
                                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
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
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar size={32} className="text-white/40" />
                            </div>
                            <h3 className="text-lg font-bold text-white">
                                Tidak ada jadwal hari {HARI_LIST.find(h => h.key === selectedDay)?.label}
                            </h3>
                            <p className="text-sm text-white/60 mt-1">
                                Anda bebas dari kegiatan mengajar pada hari ini.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {dayJadwal.map((item) => (
                                <div 
                                    key={item.id}
                                    className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 hover:bg-white/10 transition-all duration-300"
                                >
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex flex-col gap-1 flex-1">
                                            <span className="text-[10px] font-bold bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-md uppercase tracking-wider w-fit">
                                                {item.kode}
                                            </span>
                                            <h3 className="font-bold text-white leading-tight group-hover:text-orange-300 transition-colors">
                                                {item.nama}
                                            </h3>
                                        </div>
                                        <div className="bg-white/10 border border-white/20 rounded-lg p-2 text-center min-w-[50px] shadow-sm ml-2">
                                            <p className="text-sm font-bold text-white leading-none">{item.durasi}</p>
                                            <p className="text-[9px] text-white/60 font-medium uppercase mt-1">Sesi</p>
                                        </div>
                                    </div>

                                    {/* Info Rows */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                                                <Clock size={14} className="text-orange-300" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-white/60 font-medium leading-none mb-1">Waktu & Sesi</p>
                                                <p className="text-sm font-semibold text-white leading-none">
                                                    {item.waktu} <span className="text-white/60 ml-1">(Sesi {item.sesiMulai})</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                                                <MapPin size={14} className="text-orange-300" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-white/60 font-medium leading-none mb-1">Ruangan & Kelas</p>
                                                <p className="text-sm font-semibold text-white leading-none">
                                                    {item.ruangan} {item.kelas !== '-' && `• Kelas ${item.kelas}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                                                <Users size={14} className="text-orange-300" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-white/60 font-medium leading-none mb-1">Mahasiswa</p>
                                                <p className="text-sm font-semibold text-white leading-none">
                                                    {item.mahasiswa} Terdaftar
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <button className="w-full mt-5 py-2.5 rounded-xl bg-orange-500/20 border border-orange-500/30 text-xs font-bold text-orange-300 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all flex items-center justify-center gap-2 group-hover:shadow-md group-hover:shadow-orange-500/20">
                                        Lihat Detail
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
