import React, { useState, useMemo } from 'react';
import { Download, CalendarDays, AlertTriangle } from 'lucide-react';

const HARI_LIST = [
    { key: 'senin', label: 'Senin' },
    { key: 'selasa', label: 'Selasa' },
    { key: 'rabu', label: 'Rabu' },
    { key: 'kamis', label: 'Kamis' },
    { key: 'jumat', label: 'Jumat' },
];

const TIPE_STYLES = {
    resmi: 'bg-primary-500/5 border-primary-500/30 text-primary-600',
    override: 'bg-warning/10 border-warning/50 text-warning-800',
    konflik: 'bg-danger/10 border-danger/50 text-danger-800 border-dashed',
};

// Internal Sub-components to keep render clean
function DayTabs({ selectedDay, onSelectDay }) {
    return (
        <div className="flex space-x-1 border-b border-border mb-4">
            {HARI_LIST.map((hari) => (
                <button
                    key={hari.key}
                    onClick={() => onSelectDay(hari.key)}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                        selectedDay === hari.key
                            ? 'border-primary-500 text-primary-500'
                            : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
                    }`}
                >
                    {hari.label}
                </button>
            ))}
        </div>
    );
}

function ScheduleCard({ item, isConflict, onCardClick }) {
    const appliedStyle = isConflict || item.tipe === 'konflik'
        ? TIPE_STYLES.konflik
        : (TIPE_STYLES[item.tipe] || TIPE_STYLES.resmi);

    return (
        <div
            onClick={() => onCardClick?.(item)}
            className={`relative z-10 mx-1 rounded-md border p-2 flex flex-col justify-center overflow-hidden transition-all hover:z-20 hover:shadow-md ${appliedStyle} ${isConflict ? 'ring-2 ring-danger/30' : ''} ${onCardClick ? 'cursor-pointer' : ''}`}
            style={{
                gridColumnStart: item.sesiMulai,
                gridColumnEnd: `span ${item.durasi}`
            }}
        >
            <div className="flex items-start justify-between gap-1 mb-1">
                <span className="font-bold text-[10px] leading-none truncate">
                    {item.kode}
                </span>
                {(isConflict || item.tipe === 'konflik') && (
                    <AlertTriangle size={12} className="text-danger flex-shrink-0 animate-pulse" />
                )}
            </div>
            <p className="text-[11px] leading-tight font-semibold opacity-90 truncate">
                {item.nama}
            </p>
            <p className="text-[10px] mt-0.5 opacity-70 truncate">
                {item.dosen}
            </p>
        </div>
    );
}

export default function ScheduleGrid({
    jadwalItems = [],
    rooms, // optional array of rooms
    title = "Jadwal & Ketersediaan Ruangan",
    headerActions,
    showConflicts = false,
    onCardClick,
    onExport,
}) {
    const [selectedDay, setSelectedDay] = useState('senin');

    const dayJadwal = useMemo(() => jadwalItems.filter(j => j.hari === selectedDay), [jadwalItems, selectedDay]);

    // Derive rooms if not provided
    const displayRooms = useMemo(() => {
        if (rooms) return rooms;
        const uniqueRooms = new Set();
        jadwalItems.forEach(j => {
            if (j.ruangan) uniqueRooms.add(j.ruangan);
        });
        return Array.from(uniqueRooms).sort();
    }, [rooms, jadwalItems]);

    // Default header actions
    const renderHeaderActions = () => {
        if (headerActions !== undefined) return headerActions;
        
        // Default export button if no custom headerActions provided
        return (
            <button
                onClick={() => onExport?.(jadwalItems)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border bg-card text-text-secondary border-border hover:bg-primary-500 hover:text-white hover:border-primary-500 hover:shadow-lg transition-all duration-300 flex items-center gap-1.5"
            >
                <Download size={14} />
                Export Jadwal
            </button>
        );
    };

    return (
        <section className="mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CalendarDays size={20} className="text-text-primary" />
                    <h2 className="text-lg font-bold text-text-primary">
                        {title}
                    </h2>
                </div>
                {renderHeaderActions()}
            </div>

            <DayTabs selectedDay={selectedDay} onSelectDay={setSelectedDay} />

            {/* Matrix Grid */}
            <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto shadow-sm">
                <div className="min-w-[1200px]">
                    {/* Header Row: Rooms (Empty Corner) + 11 Sessions */}
                    <div className="grid grid-cols-[160px_repeat(11,_minmax(0,_1fr))] border-b border-border bg-card">
                        <div className="p-3 font-bold text-[11px] tracking-wider text-text-muted border-r border-border sticky left-0 bg-card z-40 flex items-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            RUANGAN
                        </div>
                        {Array.from({ length: 11 }, (_, i) => (
                            <div key={i} className="p-3 text-center text-[10px] tracking-wider font-bold text-text-muted border-r border-border last:border-r-0">
                                SESI {i + 1}
                            </div>
                        ))}
                    </div>

                    {/* Rows: Each Room */}
                    {displayRooms.map(room => {
                        const roomClasses = dayJadwal.filter(j => j.ruangan === room);
                        
                        return (
                            <div key={room} className="grid grid-cols-[160px_repeat(11,_minmax(0,_1fr))] border-b border-border last:border-b-0 relative group hover:bg-background/30 transition-colors">
                                {/* Room Label - Sticky */}
                                <div className="p-3 font-semibold text-xs text-text-primary border-r border-border sticky left-0 bg-card z-30 flex items-center group-hover:bg-card shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors">
                                    <span className="truncate">{room}</span>
                                </div>

                                {/* Sessions Grid Container */}
                                <div className="col-span-11 grid grid-cols-11 relative py-1.5 gap-y-1.5 min-h-[64px]">
                                    {/* Background Grid Lines for visual separation */}
                                    <div className="absolute inset-0 grid grid-cols-11 pointer-events-none">
                                        {Array.from({ length: 11 }, (_, i) => (
                                            <div key={i} className="border-r border-border/40 last:border-r-0 h-full"></div>
                                        ))}
                                    </div>

                                    {/* Render Classes */}
                                    {roomClasses.map(item => {
                                        let isConflict = false;
                                        if (showConflicts) {
                                            isConflict = roomClasses.some(other => 
                                                other.id !== item.id &&
                                                ((item.sesiMulai >= other.sesiMulai && item.sesiMulai < other.sesiMulai + other.durasi) ||
                                                (other.sesiMulai >= item.sesiMulai && other.sesiMulai < item.sesiMulai + item.durasi))
                                            );
                                        }

                                        return (
                                            <ScheduleCard 
                                                key={item.id} 
                                                item={item} 
                                                isConflict={isConflict} 
                                                onCardClick={onCardClick}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
