import React, { useState } from 'react';
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

export default function FullScheduleGrid({ schedules = [], rooms = [] }) {
    const [selectedDay, setSelectedDay] = useState('senin');

    // Filter jadwal based on selected day
    const dayJadwal = schedules.filter(j => j.hari === selectedDay);

    return (
        <section className="mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <CalendarDays size={20} className="text-text-primary" />
                    <h2 className="text-lg font-bold text-text-primary">
                        Jadwal & Ketersediaan Ruangan
                    </h2>
                </div>
                <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border bg-card text-text-secondary border-border hover:bg-primary-500 hover:text-white hover:border-primary-500 hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 shadow-sm"
                >
                    <Download size={14} />
                    Export Jadwal
                </button>
            </div>

            {/* Day Selector Tabs */}
            <div className="flex space-x-6 border-b border-border mb-6 px-1">
                {HARI_LIST.map((hari) => (
                    <button
                        key={hari.key}
                        onClick={() => setSelectedDay(hari.key)}
                        className={`pb-2 text-sm font-semibold border-b-2 transition-all ${
                            selectedDay === hari.key
                                ? 'border-primary-500 text-primary-500 translate-y-[1px]'
                                : 'border-transparent text-text-muted hover:text-text-primary'
                        }`}
                    >
                        {hari.label}
                    </button>
                ))}
            </div>

            {/* Matrix Grid */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden overflow-x-auto shadow-sm no-scrollbar">
                <div className="min-w-[1200px]">
                    {/* Header Row: Rooms (Empty Corner) + 11 Sessions */}
                    <div className="grid grid-cols-[160px_repeat(11,_minmax(0,_1fr))] border-b border-border bg-surface/30">
                        <div className="p-4 font-bold text-[11px] tracking-wider text-text-muted border-r border-border sticky left-0 bg-surface z-30 flex items-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            RUANGAN
                        </div>
                        {Array.from({ length: 11 }, (_, i) => (
                            <div key={i} className="p-4 text-center text-[10px] tracking-widest font-bold text-text-muted border-r border-border/50 last:border-r-0">
                                SESI {i + 1}
                            </div>
                        ))}
                    </div>

                    {/* Rows: Each Room */}
                    {rooms.map(room => {
                        // Find classes for this room on the selected day
                        const roomClasses = dayJadwal.filter(j => j.ruangan_id === room.id);
                        
                        return (
                            <div key={room.id} className="grid grid-cols-[160px_repeat(11,_minmax(0,_1fr))] border-b border-border last:border-b-0 relative group hover:bg-surface/30 transition-colors">
                                {/* Room Label - Sticky */}
                                <div className="p-4 font-bold text-xs text-text-primary border-r border-border sticky left-0 bg-white z-20 flex items-center group-hover:bg-surface transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    <span className="truncate">{room.code}</span>
                                </div>

                                {/* Sessions Grid Container */}
                                <div className="col-span-11 grid grid-cols-11 relative py-2 gap-y-2 min-h-[80px]">
                                    {/* Background Grid Lines for visual separation */}
                                    <div className="absolute inset-0 grid grid-cols-11 pointer-events-none">
                                        {Array.from({ length: 11 }, (_, i) => (
                                            <div key={i} className="border-r border-border/20 last:border-r-0 h-full"></div>
                                        ))}
                                    </div>

                                    {/* Render Classes */}
                                    {roomClasses.map(item => {
                                        // A conflict occurs if there are overlapping sessions.
                                        const isConflict = roomClasses.some(other => 
                                            other.id !== item.id &&
                                            ((item.sesiMulai >= other.sesiMulai && item.sesiMulai < other.sesiMulai + other.durasi) ||
                                            (other.sesiMulai >= item.sesiMulai && other.sesiMulai < item.sesiMulai + item.durasi))
                                        );

                                        // Ensure styles reflect conflicts even if marked as resmi
                                        const appliedStyle = isConflict
                                            ? TIPE_STYLES.konflik 
                                            : (item.isOwn ? 'bg-primary-500 border-primary-600 text-white shadow-lg shadow-primary-500/20' : TIPE_STYLES.resmi);

                                        return (
                                            <div
                                                key={item.id}
                                                className={`relative z-10 mx-1 rounded-xl border p-2.5 flex flex-col justify-center overflow-hidden transition-all hover:z-20 hover:shadow-xl ${appliedStyle} ${isConflict ? 'ring-2 ring-danger/30' : ''}`}
                                                style={{
                                                    gridColumnStart: item.sesiMulai,
                                                    gridColumnEnd: `span ${item.durasi}`
                                                }}
                                            >
                                                {/* Header Row of Card */}
                                                <div className="flex items-start justify-between gap-1 mb-1">
                                                    <span className={`font-black text-[9px] leading-none truncate uppercase tracking-tighter ${item.isOwn ? 'text-white/80' : ''}`}>
                                                        {item.kode}
                                                    </span>
                                                    {isConflict && (
                                                        <AlertTriangle size={12} className="text-danger flex-shrink-0 animate-pulse" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] leading-tight font-bold line-clamp-2">
                                                    {item.nama}
                                                </p>
                                                <p className={`text-[9px] mt-1 font-medium italic truncate ${item.isOwn ? 'text-white/70' : 'opacity-70'}`}>
                                                    {item.dosen}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-6 px-1">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Jadwal Anda</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary-500/5 border border-primary-500/30"></div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Jadwal Lain</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-danger/10 border border-danger/50 border-dashed"></div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Konflik</span>
                </div>
            </div>
        </section>
    );
}
