import { CloudUpload } from 'lucide-react';

export default function WelcomeHeader({
    user = {},
    syncStatus = { status: 'terkini', lastUpload: 'Hari ini, 08:42' },
    pendingConflicts = 3,
    onUploadClick,
}) {
    // Greeting berdasarkan waktu
    const hour = new Date().getHours();
    let greeting = 'Selamat pagi';
    if (hour >= 12 && hour < 15) greeting = 'Selamat siang';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat sore';
    else if (hour >= 18) greeting = 'Selamat malam';

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

    return (
        <section className="mb-6">
            {/* Greeting */}
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                {greeting}, {user?.name || 'Admin'}.
            </h1>
            <p className="text-text-secondary mt-1 text-sm">
                Operasi akademik stabil dengan{' '}
                <span className="font-semibold text-danger">{pendingConflicts} konflik</span> tertunda.
            </p>

            {/* Cards row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                {/* Import Jadwal Card */}
                <button
                    onClick={onUploadClick}
                    className="group flex flex-col items-center justify-center gap-3
                               border-2 border-dashed border-border rounded-xl px-6 py-8
                               bg-card hover:border-primary-500/40 hover:bg-primary-50
                               transition-all duration-200 cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-xl bg-surface group-hover:bg-primary-500/10
                                    flex items-center justify-center transition-colors">
                        <CloudUpload
                            size={24}
                            className="text-text-muted group-hover:text-primary-500 transition-colors"
                        />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-text-primary text-sm">Import Jadwal Prodi</p>
                        <p className="text-text-muted text-xs mt-0.5">
                            Seret file CSV atau Excel ke sini untuk memperbarui
                        </p>
                    </div>
                </button>

                {/* Sync Status Card */}
                <div className="bg-card border border-border rounded-xl px-6 py-5 flex items-center gap-5">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
                            Status Sinkronisasi
                        </p>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-text-secondary">Database:</span>
                            <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    statusStyles[syncStatus.status] || statusStyles.terkini
                                }`}
                            >
                                {statusLabels[syncStatus.status] || 'Terkini'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-text-secondary">Upload Terakhir:</span>
                            <span className="text-sm font-medium text-text-primary">
                                {syncStatus.lastUpload}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
