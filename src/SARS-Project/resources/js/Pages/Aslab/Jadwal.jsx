import React, { useState } from 'react';
import { CalendarDays, Download, AlertTriangle } from 'lucide-react';
import AslabLayout from '../../Layouts/AslabLayout';

const HARI_LIST = [
    { key: 'senin', label: 'Senin' },
    { key: 'selasa', label: 'Selasa' },
    { key: 'rabu', label: 'Rabu' },
    { key: 'kamis', label: 'Kamis' },
    { key: 'jumat', label: 'Jumat' },
];

function getTodayKey() {
    const jsDay = new Date().getDay();
    const dayMap = { 0: 'senin', 1: 'senin', 2: 'selasa', 3: 'rabu', 4: 'kamis', 5: 'jumat', 6: 'senin' };
    return dayMap[jsDay];
}

export default function AslabJadwal({ 
    allSchedules = [],
    rooms = [],
    semester = { nama: 'Genap', tahun: '2024/2025' }
}) {
    const [selectedDay, setSelectedDay] = useState(getTodayKey);

    const dayJadwal = allSchedules.filter(j => j.hari === selectedDay);

    return (
        <div className="space-y-6">
            {/* ── Page Header ──────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <CalendarDays className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                            Jadwal Keseluruhan
                        </h1>
                        <p className="text-text-secondary text-sm">
                            Semester {semester?.nama || 'Genap'} TA {semester?.tahun || '2024/2025'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Full Schedule Grid (Room × Session Matrix) ────────── */}
            <section>
                {/* Section Header */}
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
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto no-scrollbar">
                        <div className="min-w-[1800px]">
                            {/* Header Row */}
                            <div className="grid grid-cols-[160px_repeat(11,_minmax(130px,_1fr))] border-b border-border bg-surface/50">
                                <div className="p-4 font-bold text-[10px] tracking-widest text-text-muted border-r border-border sticky left-0 bg-surface z-40 flex items-center uppercase">
                                    RUANGAN
                                </div>
                                {Array.from({ length: 11 }, (_, i) => (
                                    <div key={i} className="p-4 text-center text-[10px] tracking-widest font-bold text-text-muted border-r border-border last:border-r-0 uppercase">
                                        SESI {i + 1}
                                    </div>
                                ))}
                            </div>

                            {/* Rows: Each Room */}
                            {rooms.map(room => {
                                const roomClasses = dayJadwal.filter(j => j.ruangan_id === room.id);
                                
                                return (
                                    <div key={room.id} className="grid grid-cols-[160px_repeat(11,_minmax(130px,_1fr))] border-b border-border last:border-b-0 group">
                                        {/* Room Label — Sticky, highest z so blocks never bleed through */}
                                        <div className="p-4 font-bold text-sm text-text-primary border-r border-border sticky left-0 bg-card z-40 flex items-center shadow-[4px_0_8px_-2px_rgba(0,0,0,0.15)] transition-colors group-hover:bg-surface/50">
                                            {room.code}
                                        </div>

                                        {/* Sessions Grid Container — overflow-hidden prevents bleed-through */}
                                        <div className="col-span-11 grid grid-cols-11 relative py-3 min-h-[100px] gap-y-3 overflow-hidden">
                                            {/* Background Grid Lines */}
                                            <div className="absolute inset-0 grid grid-cols-11 pointer-events-none">
                                                {Array.from({ length: 11 }, (_, i) => (
                                                    <div key={i} className="border-r border-border/30 last:border-r-0 h-full"></div>
                                                ))}
                                            </div>

                                            {/* Schedule blocks — no isOwn coloring for Aslab */}
                                            {roomClasses.map(item => {
                                                const isConflict = roomClasses.some(other => 
                                                    other.id !== item.id &&
                                                    ((item.sesiMulai >= other.sesiMulai && item.sesiMulai < other.sesiMulai + other.durasi) ||
                                                    (other.sesiMulai >= item.sesiMulai && other.sesiMulai < item.sesiMulai + item.durasi))
                                                );

                                                const appliedStyle = isConflict
                                                    ? 'bg-danger/5 border-danger/40 text-danger-800 border-dashed'
                                                    : 'bg-surface border-border/80 text-text-primary hover:border-primary-500/30';

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className={`relative mx-1.5 rounded-lg border p-3 flex flex-col justify-center overflow-hidden transition-all hover:shadow-lg ${appliedStyle} ${isConflict ? 'ring-1 ring-danger/20' : ''}`}
                                                        style={{
                                                            gridColumnStart: item.sesiMulai,
                                                            gridColumnEnd: `span ${item.durasi}`
                                                        }}
                                                    >
                                                        <div className="flex items-start justify-between gap-1 mb-1">
                                                            <span className="font-black text-[11px] leading-none uppercase tracking-tight text-primary-500">
                                                                {item.kode}
                                                            </span>
                                                            {isConflict && (
                                                                <AlertTriangle size={12} className="text-danger flex-shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-[13px] leading-snug font-bold whitespace-normal">
                                                            {item.nama}
                                                        </p>
                                                        <p className="text-[11px] mt-1.5 font-medium italic text-text-muted opacity-80">
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
                </div>
            </section>
        </div>
    );
}

AslabJadwal.layout = (page) => <AslabLayout>{page}</AslabLayout>;
