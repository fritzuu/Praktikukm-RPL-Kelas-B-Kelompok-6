import { Calendar, Building2, DoorOpen, BarChart3, Loader2, Activity } from 'lucide-react';

const STAT_ITEMS = [
    {
        key: 'activeSchedules',
        label: 'Jadwal Aktif Saat Ini',
        sub: 'Kelas sedang berlangsung',
        icon: Calendar,
        color: 'text-primary-500',
        bg: 'bg-primary-500/10',
    },
    {
        key: 'usedRooms',
        label: 'Ruangan Digunakan',
        sub: 'Sedang dipakai',
        icon: Building2,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
    },
    {
        key: 'emptyRooms',
        label: 'Ruangan Kosong',
        sub: 'Tersedia saat ini',
        icon: DoorOpen,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
    },
    {
        key: 'totalToday',
        label: 'Jadwal Hari Ini',
        sub: 'Total jadwal hari ini',
        icon: BarChart3,
        color: 'text-sky-500',
        bg: 'bg-sky-500/10',
    },
];

export default function LiveCampusActivityCard({
    stats = {},
    loading = false,
    hasSemester = true,
    isWeekend = false,
}) {
    const emptyMessage = !hasSemester
        ? 'Tidak ada semester aktif'
        : 'Belum ada jadwal terdaftar untuk hari ini';

    const allZero = STAT_ITEMS.every(item => (stats[item.key] ?? 0) === 0);

    return (
        <div className="bg-card border border-border rounded-2xl p-5 h-full flex flex-col">
            <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Activity size={18} className="text-violet-500" />
                </div>
                <h3 className="text-sm font-bold text-text-primary tracking-tight">
                    Live Campus Activity
                </h3>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center min-h-[120px]">
                    <Loader2 size={20} className="animate-spin text-text-muted" />
                </div>
            ) : !hasSemester ? (
                <div className="flex-1 flex flex-col items-center justify-center text-text-muted min-h-[120px] px-4 text-center">
                    <Activity size={28} className="mb-2 opacity-40" />
                    <p className="text-xs font-medium">{emptyMessage}</p>
                </div>
            ) : (
                <div className="flex-1 space-y-1">
                    {STAT_ITEMS.map(item => {
                        const Icon = item.icon;
                        const value = stats[item.key] ?? 0;
                        return (
                            <div
                                key={item.key}
                                className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-surface/70 transition-colors border border-transparent hover:border-border/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                                        <Icon size={16} className={item.color} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-text-primary leading-tight">
                                            {item.label}
                                        </p>
                                        <p className="text-[11px] text-text-muted leading-tight mt-0.5">
                                            {item.sub}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-2xl font-bold text-text-primary tabular-nums">
                                    {value}
                                </span>
                            </div>
                        );
                    })}
                    {allZero && hasSemester && (
                        <p className="text-[11px] text-text-muted text-center pt-2">
                            {isWeekend ? 'Tidak ada jadwal kampus (Minggu)' : emptyMessage}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
