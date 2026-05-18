import { Database } from 'lucide-react';

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
    return (
        <div className="bg-card border border-border rounded-xl px-5 py-4 flex items-center gap-4 max-w-xs shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center shrink-0 border border-border/60">
                <Database size={20} className="text-text-muted" />
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5">
                    Status Sinkronisasi
                </p>
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-text-secondary">Database:</span>
                    <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            statusStyles[syncStatus.status] || statusStyles.terkini
                        }`}
                    >
                        {statusLabels[syncStatus.status] || 'Terkini'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary">Terakhir:</span>
                    <span className="text-xs font-medium text-text-primary">
                        {syncStatus.lastUpload}
                    </span>
                </div>
            </div>
        </div>
    );
}
