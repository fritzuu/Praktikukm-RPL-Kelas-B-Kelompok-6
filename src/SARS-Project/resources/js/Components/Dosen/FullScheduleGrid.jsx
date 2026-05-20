import React, { useState, useEffect, useMemo } from 'react';
import { Download, CalendarDays, AlertTriangle, Loader2 } from 'lucide-react';

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
    konflik: 'bg-danger/5 border-danger/40 text-danger-800 border-dashed',
};

export default function FullScheduleGrid({ schedules = [], rooms = [] }) {
    const [selectedDay, setSelectedDay] = useState('senin');
    const [isLoading, setIsLoading] = useState(true);

    // Filter rooms to only include rooms that have at least one schedule
    const displayRooms = useMemo(() => {
        const roomIdsWithSchedules = new Set(schedules.map(s => s.ruangan_id).filter(Boolean));
        const roomNamesWithSchedules = new Set(schedules.map(s => s.ruangan).filter(Boolean));
        
        return rooms.filter(room => 
            roomIdsWithSchedules.has(room.id) || 
            roomNamesWithSchedules.has(room.code) || 
            roomNamesWithSchedules.has(room.name)
        );
    }, [rooms, schedules]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 600);

        return () => clearTimeout(timer);
    }, [selectedDay]);

    // Filter jadwal based on selected day
    const dayJadwal = schedules.filter(j => j.hari === selectedDay);

    const LoadingSpinner = () => (
        <div className="bg-card border border-border rounded-2xl p-24 flex flex-col items-center justify-center shadow-sm w-full">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-4" />
            <p className="text-sm font-semibold text-text-secondary">Memuat jadwal...</p>
        </div>
    );

    return (
        <section className="mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CalendarDays size={20} className="text-text-primary" />
                    <h2 className="text-lg font-bold text-text-primary tracking-tight">
                        Jadwal & Ketersediaan Ruangan
                    </h2>
                </div>
                <button
                    onClick={() => window.print()}
                    className="px-4 py-2 text-xs font-bold rounded-lg border bg-card text-text-secondary border-border hover:bg-surface transition-all flex items-center gap-2 shadow-sm"
                >
                    <Download size={14} />
                    Export Jadwal
                </button>
            </div>

            {/* Day Selector Tabs */}
            <div className="flex space-x-1 border-b border-border mb-6">
                {HARI_LIST.map((hari) => (
                    <button
                        key={hari.key}
                        onClick={() => setSelectedDay(hari.key)}
                        className={`px-6 py-2.5 text-sm font-bold border-b-2 transition-all ${
                            selectedDay === hari.key
                                ? 'border-primary-500 text-primary-500'
                                : 'border-transparent text-text-muted hover:text-text-primary'
                        }`}
                    >
                        {hari.label}
                    </button>
                ))}
            </div>

            {/* Matrix Grid */}
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <div className="bg-card border border-border rounded-2xl overflow-hidden overflow-x-auto shadow-sm no-scrollbar">
                    <div className="min-w-[1200px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-[140px_repeat(11,_minmax(0,_1fr))] border-b border-border bg-surface/50">
                        <div className="p-4 font-bold text-[10px] tracking-widest text-text-muted border-r border-border sticky left-0 bg-surface z-30 flex items-center uppercase">
                            RUANGAN
                        </div>
                        {Array.from({ length: 11 }, (_, i) => (
                            <div key={i} className="p-4 text-center text-[10px] tracking-widest font-bold text-text-muted border-r border-border last:border-r-0 uppercase">
                                SESI {i + 1}
                            </div>
                        ))}
                    </div>

                    {/* Rows: Each Room */}
                    {displayRooms.map(room => {
                        const roomClasses = dayJadwal.filter(j => j.ruangan_id === room.id);
                        
                        return (
                            <div key={room.id} className="grid grid-cols-[140px_repeat(11,_minmax(0,_1fr))] border-b border-border last:border-b-0 relative group">
                                {/* Room Label - Sticky */}
                                <div className="p-4 font-bold text-sm text-text-primary border-r border-border sticky left-0 bg-card z-20 flex items-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors group-hover:bg-surface/30">
                                    {room.code}
                                </div>

                                {/* Sessions Grid Container */}
                                <div className="col-span-11 grid grid-cols-11 relative py-3 min-h-[100px] gap-y-3">
                                    {/* Background Grid Lines */}
                                    <div className="absolute inset-0 grid grid-cols-11 pointer-events-none">
                                        {Array.from({ length: 11 }, (_, i) => (
                                            <div key={i} className="border-r border-border/30 last:border-r-0 h-full"></div>
                                        ))}
                                    </div>

                                    {/* Render Classes */}
                                    {roomClasses.map(item => {
                                        const isConflict = roomClasses.some(other => 
                                            other.id !== item.id &&
                                            ((item.sesiMulai >= other.sesiMulai && item.sesiMulai < other.sesiMulai + other.durasi) ||
                                            (other.sesiMulai >= item.sesiMulai && other.sesiMulai < item.sesiMulai + item.durasi))
                                        );

                                        const appliedStyle = isConflict
                                            ? TIPE_STYLES.konflik 
                                            : (item.isOwn ? 'bg-primary-500 border-primary-600 text-white shadow-md' : 'bg-surface border-border/80 text-text-primary hover:border-primary-500/30');

                                        return (
                                            <div
                                                key={item.id}
                                                className={`relative z-10 mx-1.5 rounded-lg border p-3 flex flex-col justify-center overflow-hidden transition-all hover:shadow-lg ${appliedStyle} ${isConflict ? 'ring-1 ring-danger/20' : ''}`}
                                                style={{
                                                    gridColumnStart: item.sesiMulai,
                                                    gridColumnEnd: `span ${item.durasi}`
                                                }}
                                            >
                                                <div className="flex items-start justify-between gap-1 mb-1">
                                                    <span className={`font-black text-[10px] leading-none uppercase tracking-tighter ${item.isOwn ? 'text-white/90' : 'text-primary-600'}`}>
                                                        {item.kode}
                                                    </span>
                                                    {isConflict && (
                                                        <AlertTriangle size={12} className="text-danger flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-[12px] leading-tight font-bold">
                                                    {item.nama}
                                                </p>
                                                <p className={`text-[10px] mt-1.5 font-medium italic ${item.isOwn ? 'text-white/70' : 'text-text-muted opacity-80'}`}>
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
            )}
        </section>
    );
}
