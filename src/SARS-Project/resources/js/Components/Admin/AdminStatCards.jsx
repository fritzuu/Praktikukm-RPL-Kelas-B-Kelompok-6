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
        <div className="flex items-center gap-3 shrink-0">
            {/* Sync Status Card */}
            <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-center w-[170px] shadow-sm">
                <div className="flex flex-col gap-1.5 items-start">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-text-secondary select-none">
                            Database:
                        </span>
                        <div className="flex items-center">
                            <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    statusStyles[syncStatus.status] || statusStyles.terkini
                                }`}
                            >
                                {statusLabels[syncStatus.status] || 'Terkini'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <span className="text-xs text-text-secondary select-none">
                            Sync:
                        </span>
                        <span className="text-xs font-semibold text-text-primary whitespace-nowrap">
                            {syncStatus.lastUpload}
                        </span>
                    </div>
                </div>
            </div>

            {/* Live Clock Card */}
            <div className="bg-card border border-border rounded-xl px-5 py-3 text-right hidden sm:block shadow-sm">
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



