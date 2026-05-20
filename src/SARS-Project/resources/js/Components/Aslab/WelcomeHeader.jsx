import { useState, useEffect } from 'react';
import { ClipboardCheck, Clock } from 'lucide-react';

export default function WelcomeHeader({ 
    user = {}, 
    stats = { pendingValidasi: 0 },
    syncStatus = { status: 'terkini', lastUpload: 'Hari ini, 08:42' } 
}) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hour = now.getHours();
    let greeting = 'Selamat pagi';
    if (hour >= 12 && hour < 15) greeting = 'Selamat siang';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat sore';
    else if (hour >= 18) greeting = 'Selamat malam';

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
        { label: 'Pending Verification', value: stats.pendingVerification, icon: Clock, color: 'bg-warning/10 text-warning', border: 'hover:border-warning/30' },
        { label: 'Validation', value: stats.validation, icon: ClipboardCheck, color: 'bg-info/10 text-info', border: 'hover:border-info/30' },
        { label: 'Accepted', value: stats.accepted, icon: ClipboardCheck, color: 'bg-success/10 text-success', border: 'hover:border-success/30' },
        { label: 'Rejected', value: stats.rejected, icon: ClipboardCheck, color: 'bg-danger/10 text-danger', border: 'hover:border-danger/30' },
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
                            {user?.name?.split(',')[0] || 'Aslab'}.
                        </span>
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm">
                        {stats.pendingVerification > 0 ? (
                            <>Anda memiliki <span className="font-semibold text-warning">{stats.pendingVerification} pengajuan</span> menunggu verifikasi.</>
                        ) : (
                            <>Semua pengajuan sudah diverifikasi. 👍</>
                        )}
                    </p>
                </div>

                {/* Right Area: Sync Status & Clock */}
                <div className="flex items-stretch gap-3 shrink-0">
                    {/* Sync Status Card */}
                    <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-center w-[190px] shadow-sm hidden sm:flex">
                        <div className="flex flex-col gap-1 items-start w-full">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-[11px] text-text-secondary select-none font-medium">
                                    Koneksi DB:
                                </span>
                                <div className="flex items-center gap-1.5 bg-success/10 text-success px-2 py-0.5 rounded-full">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
                                    </span>
                                    <span className="text-[9px] font-bold uppercase tracking-wider">
                                        Aktif
                                    </span>
                                </div>
                            </div>
                            <div className="text-[10px] text-text-muted truncate max-w-full">
                                Database: <span className="font-semibold text-text-primary font-mono">{syncStatus.dbName || 'SARS DB'}</span>
                            </div>
                            <div className="text-[10px] text-text-muted mt-0.5">
                                Update: <span className="font-semibold text-text-primary">{syncStatus.lastUpload}</span>
                            </div>
                        </div>
                    </div>

                    {/* Live Clock Card */}
                    <div className="bg-card border border-border rounded-xl px-5 py-3 text-right hidden sm:flex flex-col justify-center items-end shadow-sm">
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

            {/* Small Stat Cards for Verification/Validation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className={`bg-card border border-border rounded-xl px-4 py-4 transition-all duration-200 group hover:shadow-md ${card.border}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${card.color}`}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-text-primary leading-none">{card.value}</p>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">{card.label}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
