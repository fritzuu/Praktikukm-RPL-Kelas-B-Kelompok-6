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

export default function SyncStatusCard({
    syncStatus = { status: 'terkini', lastUpload: 'Hari ini, 08:42' },
}) {
    return (
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
    );
}
