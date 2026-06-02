import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import SyncStatusCard from '../Shared/SyncStatusCard';

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
            <SyncStatusCard syncStatus={syncStatus} />

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
