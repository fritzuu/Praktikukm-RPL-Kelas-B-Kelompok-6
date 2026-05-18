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
    );
}



