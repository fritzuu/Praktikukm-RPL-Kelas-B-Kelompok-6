import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

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

export default function AdminStatCards({
    syncStatus = { status: 'terkini', lastUpload: 'Hari ini, 08:42' },
}) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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

    return (
        <div className="flex items-stretch gap-3 shrink-0">
            {/* Sync Status Card */}
            <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-center w-[190px] shadow-sm">
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
    );
}



