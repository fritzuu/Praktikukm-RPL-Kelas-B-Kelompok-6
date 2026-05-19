import { useState, useEffect } from 'react';
import {
    BookOpen,
    Users,
    CalendarDays,
    Clock,
    TrendingUp,
} from 'lucide-react';
export default function WelcomeHeader({ 
    user = {}, 
    stats = {
        totalMataKuliah: 0,
        totalSks: 0,
        totalMahasiswa: 0,
        jadwalHariIni: 0,
        pertemuanMingguIni: 0,
    },
    syncStatus = { status: 'terkini', lastUpload: 'Hari ini, 08:42' } 
}) {
    const [now, setNow] = useState(new Date());

    // Update jam setiap detik
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Greeting berdasarkan waktu
    const hour = now.getHours();
    let greeting = 'Selamat pagi';
    if (hour >= 12 && hour < 15) greeting = 'Selamat siang';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat sore';
    else if (hour >= 18) greeting = 'Selamat malam';

    // Format waktu real-time
    const timeString = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const dateString = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const statusStyles = {
        terkini: 'bg-success/10 text-success',
        tertunda: 'bg-warning/10 text-warning',
        gagal: 'bg-danger/10 text-danger',
    };

    const statusLabels = {
        terkini: 'Terkini',
        tertunda: 'Tertunda',
        gagal: 'Gagal',
    };

    const statCards = [
        {
            label: 'Mata Kuliah',
            value: stats.totalMataKuliah,
            suffix: 'MK',
            icon: BookOpen,
            color: 'bg-primary-500/10 text-primary-500',
        },
        {
            label: 'Total SKS',
            value: stats.totalSks,
            suffix: 'SKS',
            icon: TrendingUp,
            color: 'bg-success/10 text-success',
        },
        {
            label: 'Mahasiswa',
            value: stats.totalMahasiswa,
            suffix: '',
            icon: Users,
            color: 'bg-info/10 text-info',
        },
        {
            label: 'Jadwal Hari Ini',
            value: stats.jadwalHariIni,
            suffix: '',
            icon: CalendarDays,
            color: 'bg-warning/10 text-warning',
        },
    ];

    return (
        <section className="mb-6">
            {/* Greeting + Real-time Clock */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                        <span className="block text-lg md:text-xl font-medium text-text-secondary mb-1">
                            {greeting},
                        </span>
                        <span className="block">
                            {user?.name?.split(',')[0] || 'Dosen'}.
                        </span>
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm">
                        Anda memiliki{' '}
                        <span className="font-semibold text-primary-500">{stats.jadwalHariIni} jadwal</span>{' '}
                        hari ini dan{' '}
                        <span className="font-semibold text-primary-500">{stats.pertemuanMingguIni} pertemuan</span>{' '}
                        minggu ini.
                    </p>
                </div>

                {/* Right Area: Sync Status & Clock */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Sync Status Card */}
                    <div className="bg-card border border-border rounded-xl px-4 py-3 flex flex-col justify-center hidden sm:flex">
                        <div className="flex items-center gap-2 justify-end mb-1">
                            <span className="text-[11px] text-text-secondary">Database:</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[syncStatus.status] || statusStyles.terkini}`}>
                                {statusLabels[syncStatus.status] || 'Terkini'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                            <span className="text-[11px] text-text-secondary">Sync:</span>
                            <span className="text-xs font-medium text-text-primary">
                                {syncStatus.lastUpload}
                            </span>
                        </div>
                    </div>

                    {/* Live Clock */}
                    <div className="bg-card border border-border rounded-xl px-5 py-3 text-right hidden sm:block">
                        <div className="flex items-center gap-2 justify-end mb-0.5">
                            <Clock size={14} className="text-primary-500" />
                            <span className="text-2xl font-bold text-text-primary tracking-tight font-mono">
                                {timeString}
                            </span>
                        </div>
                        <p className="text-xs text-text-muted">{dateString}</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            className="bg-card border border-border rounded-xl px-4 py-4
                                       hover:shadow-md hover:border-primary-500/20 transition-all duration-200
                                       group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color} transition-transform group-hover:scale-110`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-text-primary">
                                {card.value}
                                {card.suffix && (
                                    <span className="text-sm font-medium text-text-muted ml-1">
                                        {card.suffix}
                                    </span>
                                )}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">{card.label}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
