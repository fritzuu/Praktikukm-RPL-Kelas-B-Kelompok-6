import { useMemo, useState, useEffect } from 'react';
import {
    DoorOpen,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Loader2,
    Building2,
    RefreshCw,
    CalendarX,
} from 'lucide-react';
import LiveClockCard from '../Shared/LiveClockCard';

const VISIBLE_LIMIT = 4;

const TYPE_LABELS = {
    KELAS: 'Kelas',
    LABORATORIUM: 'Lab',
    AULA: 'Ruang Besar',
    SEMINAR: 'Seminar',
};

function getStatusStyle(label) {
    if (label?.startsWith('Available Until')) {
        return 'bg-sky-50 text-sky-600 border-sky-200';
    }
    return 'bg-amber-50 text-amber-600 border-amber-200';
}

function buildFilterTabs(roomTypes = []) {
    const tabs = [{ key: null, label: 'Semua' }];
    const seen = new Set();

    roomTypes.forEach(type => {
        if (!type || seen.has(type)) return;
        if (type === 'SEMINAR') {
            if (!seen.has('AULA_GROUP')) {
                seen.add('AULA_GROUP');
                tabs.push({ key: 'AULA', label: 'Ruang Besar', match: ['AULA', 'SEMINAR'] });
            }
            return;
        }
        seen.add(type);
        tabs.push({
            key: type === 'AULA' ? 'AULA' : type,
            label: TYPE_LABELS[type] ?? type,
            match: type === 'AULA' ? ['AULA', 'SEMINAR'] : [type],
        });
    });

    return tabs;
}

function resolveEmptyMessage({
    hasSemester,
    availabilityStatus,
    lectureWindow,
    activeFilter,
}) {
    if (!hasSemester) {
        return {
            title: 'Tidak ada semester aktif',
            subtitle: null,
        };
    }

    if (availabilityStatus === 'weekend') {
        return {
            title: 'Tidak ada jadwal kampus (akhir pekan)',
            subtitle: 'Ketersediaan ruangan hanya ditampilkan pada hari perkuliahan.',
        };
    }

    if (availabilityStatus === 'before_hours') {
        return {
            title: 'Belum masuk jam perkuliahan',
            subtitle: lectureWindow
                ? `Ketersediaan ruangan aktif pukul ${lectureWindow.start}–${lectureWindow.end} WIB.`
                : 'Ketersediaan ruangan hanya ditampilkan saat jam perkuliahan.',
        };
    }

    if (availabilityStatus === 'after_hours' || availabilityStatus === 'outside_hours') {
        return {
            title: 'Tidak ada sesi perkuliahan aktif saat ini',
            subtitle: lectureWindow
                ? `Jam perkuliahan hari ini: ${lectureWindow.start}–${lectureWindow.end} WIB.`
                : 'Ketersediaan ruangan hanya ditampilkan saat jam perkuliahan.',
        };
    }

    if (activeFilter) {
        return {
            title: 'Tidak ada ruangan kosong untuk filter ini',
            subtitle: null,
        };
    }

    return {
        title: 'Semua ruangan sedang digunakan',
        subtitle: null,
    };
}

export default function EmptyRoomsCard({
    rooms = [],
    roomTypes = [],
    loading = false,
    hasSemester = true,
    isWeekend = false,
    availabilityStatus = 'active',
    lectureWindow = null,
    onRefresh,
}) {
    const [activeFilter, setActiveFilter] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const filterTabs = useMemo(() => buildFilterTabs(roomTypes), [roomTypes]);

    const isAvailabilityActive = availabilityStatus === 'active';

    useEffect(() => {
        setExpanded(false);
    }, [activeFilter, availabilityStatus]);

    const activeTab = filterTabs.find(t => t.key === activeFilter) ?? filterTabs[0];

    const filtered = activeFilter
        ? rooms.filter(r => {
            const match = activeTab?.match ?? [activeFilter];
            return match.includes(r.type);
        })
        : rooms;

    const visibleRooms = expanded ? filtered : filtered.slice(0, VISIBLE_LIMIT);
    const hiddenCount = Math.max(0, filtered.length - VISIBLE_LIMIT);

    const emptyCopy = resolveEmptyMessage({
        hasSemester,
        availabilityStatus: isWeekend ? 'weekend' : availabilityStatus,
        lectureWindow,
        activeFilter,
    });

    return (
        <div className="bg-card border border-border rounded-2xl p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Building2 size={18} className="text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-bold text-text-primary tracking-tight truncate">
                        Ruangan Kosong Sekarang
                    </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <LiveClockCard />
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            disabled={loading}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                    )}
                </div>
            </div>

            {isAvailabilityActive && filterTabs.length > 1 && (
                <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                    {filterTabs.map(tab => (
                        <button
                            key={tab.key ?? 'all'}
                            onClick={() => setActiveFilter(tab.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                activeFilter === tab.key
                                    ? 'bg-primary-500 text-white shadow-sm'
                                    : 'bg-surface text-text-secondary hover:bg-border/50 border border-border'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            <div
                className={`flex-1 space-y-1 min-h-[120px] ${
                    expanded && filtered.length > VISIBLE_LIMIT
                        ? 'max-h-[220px] overflow-y-auto pr-0.5'
                        : ''
                }`}
            >
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 size={20} className="animate-spin text-text-muted" />
                    </div>
                ) : !isAvailabilityActive || visibleRooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-text-muted px-4 text-center">
                        {!isAvailabilityActive ? (
                            <CalendarX size={28} className="mb-2 opacity-40 text-text-muted" />
                        ) : (
                            <DoorOpen size={28} className="mb-2 opacity-40" />
                        )}
                        <p className="text-xs font-semibold text-text-secondary">{emptyCopy.title}</p>
                        {emptyCopy.subtitle && (
                            <p className="text-[11px] text-text-muted mt-1 leading-relaxed max-w-[280px]">
                                {emptyCopy.subtitle}
                            </p>
                        )}
                    </div>
                ) : (
                    visibleRooms.map(room => (
                        <div
                            key={room.id}
                            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface/70 transition-colors group border border-transparent hover:border-border/50"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-text-primary truncate">
                                    {room.code}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span
                                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${getStatusStyle(room.availableUntil)}`}
                                >
                                    {room.availableUntil}
                                </span>
                                <ChevronRight
                                    size={14}
                                    className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isAvailabilityActive && hiddenCount > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                    <button
                        type="button"
                        onClick={() => setExpanded(prev => !prev)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 py-1 transition-colors"
                    >
                        {expanded ? (
                            <>
                                <ChevronUp size={14} />
                                Tampilkan lebih sedikit
                            </>
                        ) : (
                            <>
                                <ChevronDown size={14} />
                                +{hiddenCount} ruangan kosong lainnya
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
