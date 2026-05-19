import React, { useState, useMemo } from 'react';
import { Download, CalendarDays, AlertTriangle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

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

const CONTAINER_VARIANTS = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const CARD_VARIANTS = {
    hidden: { opacity: 0, scale: 0.92, y: 8 },
    show: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 240, damping: 22 },
    },
};

// Internal Sub-components to keep render clean
function DayTabs({ selectedDay, onSelectDay }) {
    return (
        <div className="flex space-x-1">
            {HARI_LIST.map((hari) => (
                <button
                    key={hari.key}
                    onClick={() => onSelectDay(hari.key)}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${selectedDay === hari.key
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

function ColumnResizer({ width, onResize }) {
    const handleMouseDown = (e) => {
        e.preventDefault();
        const startX = e.pageX;
        const startWidth = width;
        
        const handleMouseMove = (moveEvent) => {
            const diff = moveEvent.pageX - startX;
            // Provide the absolute new width
            onResize(startWidth + diff);
        };
        
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div 
            className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary-500/50 active:bg-primary-500 z-50 group"
            onMouseDown={handleMouseDown}
        >
            <div className="absolute right-[1px] top-1/2 -translate-y-1/2 w-0.5 h-4 bg-border group-hover:bg-primary-500 rounded-full" />
        </div>
    );
}

const MATKUL_COLORS = [
    'bg-blue-500/10 border-blue-500/30 text-blue-700',
    'bg-emerald-500/10 border-emerald-500/30 text-emerald-700',
    'bg-violet-500/10 border-violet-500/30 text-violet-700',
    'bg-amber-500/10 border-amber-500/30 text-amber-700',
    'bg-pink-500/10 border-pink-500/30 text-pink-700',
    'bg-cyan-500/10 border-cyan-500/30 text-cyan-700',
    'bg-rose-500/10 border-rose-500/30 text-rose-700',
    'bg-indigo-500/10 border-indigo-500/30 text-indigo-700',
    'bg-teal-500/10 border-teal-500/30 text-teal-700',
    'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-700',
    'bg-orange-500/10 border-orange-500/30 text-orange-700',
    'bg-sky-500/10 border-sky-500/30 text-sky-700',
];

const getColorForMatkul = (nama) => {
    if (!nama) return TIPE_STYLES.resmi;
    let hash = 0;
    for (let i = 0; i < nama.length; i++) {
        hash = nama.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % MATKUL_COLORS.length;
    return MATKUL_COLORS[index];
};

function ScheduleCard({ item, isConflict, onCardClick, variants }) {
    let appliedStyle = '';
    
    if (isConflict || item.tipe === 'konflik') {
        appliedStyle = TIPE_STYLES.konflik;
    } else if (item.tipe === 'override') {
        appliedStyle = TIPE_STYLES.override;
    } else {
        appliedStyle = getColorForMatkul(item.nama);
    }

    return (
        <motion.div
            variants={variants}
            onClick={() => onCardClick?.(item)}
            className={`relative z-10 mx-1 rounded-md border p-2 flex flex-col justify-center overflow-hidden transition-[box-shadow,border-color] duration-300 hover:z-20 hover:shadow-md ${appliedStyle} ${isConflict ? 'ring-2 ring-danger/30' : ''} ${onCardClick ? 'cursor-pointer' : ''}`}
            style={{
                gridColumnStart: item.sesiMulai,
                gridColumnEnd: `span ${item.durasi}`
            }}
        >
            <div className="flex items-start justify-between gap-1 mb-1">
                <span className="font-bold text-[10px] leading-none truncate opacity-80">
                    {item.semesterNum || item.kelas ? `${item.semesterNum || ''} - Kelas ${item.kelas || '-'}` : item.kode}
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
        </motion.div>
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
    
    // State untuk filter
    const [semesterFilter, setSemesterFilter] = useState('Semua');
    const [kelasFilter, setKelasFilter] = useState('Semua');

    // Extract unique semesters and classes from jadwalItems
    const availableSemesters = useMemo(() => {
        const sems = new Set(jadwalItems.map(j => j.semesterNum).filter(Boolean));
        return ['Semua', ...Array.from(sems).sort()];
    }, [jadwalItems]);

    const availableKelas = useMemo(() => {
        const kls = new Set(jadwalItems.map(j => j.kelas).filter(Boolean));
        return ['Semua', ...Array.from(kls).sort()];
    }, [jadwalItems]);
    
    // State untuk lebar kolom (11 sesi)
    const [colWidths, setColWidths] = useState(() => Array(11).fill(110));

    const handleResize = (index, newWidth) => {
        setColWidths(prev => {
            const newWidths = [...prev];
            newWidths[index] = Math.max(80, newWidth);
            return newWidths;
        });
    };

    // Terapkan filter semester & kelas
    const filteredJadwalItems = useMemo(() => {
        return jadwalItems.filter(j => {
            const matchSemester = semesterFilter === 'Semua' || j.semesterNum === semesterFilter;
            const matchKelas = kelasFilter === 'Semua' || j.kelas === kelasFilter;
            return matchSemester && matchKelas;
        });
    }, [jadwalItems, semesterFilter, kelasFilter]);

    const dayJadwal = useMemo(() => filteredJadwalItems.filter(j => j.hari === selectedDay), [filteredJadwalItems, selectedDay]);

    // Derive rooms if not provided
    const displayRooms = useMemo(() => {
        if (rooms) return rooms;
        const uniqueRooms = new Set();
        filteredJadwalItems.forEach(j => {
            if (j.ruangan) uniqueRooms.add(j.ruangan);
        });
        return Array.from(uniqueRooms).sort();
    }, [rooms, filteredJadwalItems]);

    // Default header actions
    const renderHeaderActions = () => {
        if (headerActions !== undefined) return headerActions;

        // Default filter & export buttons
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-background border border-border px-2 py-1.5 rounded-lg shadow-sm">
                    <Filter size={14} className="text-text-muted ml-1" />
                    
                    <select 
                        value={semesterFilter}
                        onChange={(e) => setSemesterFilter(e.target.value)}
                        className="bg-transparent border-none text-xs font-medium text-text-secondary focus:ring-0 cursor-pointer pr-6 py-0 outline-none h-auto w-auto min-w-[90px]"
                        style={{ backgroundPosition: 'right 0.1rem center' }}
                    >
                        <option value="Semua">Semua Smt</option>
                        {availableSemesters.filter(s => s !== 'Semua').map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    <div className="w-[1px] h-3 bg-border"></div>

                    <select 
                        value={kelasFilter}
                        onChange={(e) => setKelasFilter(e.target.value)}
                        className="bg-transparent border-none text-xs font-medium text-text-secondary focus:ring-0 cursor-pointer pr-6 py-0 outline-none h-auto w-auto min-w-[90px]"
                        style={{ backgroundPosition: 'right 0.1rem center' }}
                    >
                        <option value="Semua">Semua Kls</option>
                        {availableKelas.filter(k => k !== 'Semua').map(k => (
                            <option key={k} value={k}>Kelas {k}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={() => onExport?.(filteredJadwalItems)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border bg-card text-text-secondary border-border hover:bg-primary-500 hover:text-white hover:border-primary-500 hover:shadow-lg transition-all duration-300 flex items-center gap-1.5"
                >
                    <Download size={14} />
                    Download
                </button>
            </div>
        );
    };

    const gridStyle = {
        gridTemplateColumns: `160px ${colWidths.map(w => `${w}px`).join(' ')}`
    };

    return (
        <section className="mb-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <CalendarDays size={20} className="text-text-primary" />
                <h2 className="text-lg font-bold text-text-primary">
                    {title}
                </h2>
            </div>

            {/* Tabs & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border mb-4 gap-4 sm:gap-0">
                <DayTabs selectedDay={selectedDay} onSelectDay={setSelectedDay} />
                <div className="pb-2 sm:pb-0 sm:mb-2">
                    {renderHeaderActions()}
                </div>
            </div>

            {/* Matrix Grid */}
            <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto shadow-sm">
                <div className="min-w-fit">
                    {/* Header Row: Rooms (Empty Corner) + 11 Sessions */}
                    <div className="grid border-b border-border bg-card" style={gridStyle}>
                        <div className="p-3 font-bold text-[11px] tracking-wider text-text-muted border-r border-border sticky left-0 bg-card z-30 flex items-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            RUANGAN
                        </div>
                        {Array.from({ length: 11 }, (_, i) => (
                            <div key={i} className="relative p-3 text-center text-[10px] tracking-wider font-bold text-text-muted border-r border-border last:border-r-0 select-none">
                                SESI {i + 1}
                                <ColumnResizer width={colWidths[i]} onResize={(newWidth) => handleResize(i, newWidth)} />
                            </div>
                        ))}
                    </div>

                    {/* Rows: Each Room */}
                    {displayRooms.map(room => {
                        const roomClasses = dayJadwal.filter(j => j.ruangan === room);

                        return (
                            <motion.div
                                layout
                                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                                key={room}
                                className="grid border-b border-border last:border-b-0 relative group hover:bg-background/30 transition-colors"
                                style={gridStyle}
                            >
                                {/* Room Label - Sticky */}
                                <motion.div
                                    layout
                                    transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                                    className="p-3 font-semibold text-xs text-text-primary border-r border-border sticky left-0 bg-card z-30 flex items-center group-hover:bg-card shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors"
                                >
                                    <span className="truncate">{room}</span>
                                </motion.div>

                                {/* Sessions Grid Container */}
                                <motion.div
                                    key={selectedDay}
                                    variants={CONTAINER_VARIANTS}
                                    initial="hidden"
                                    animate="show"
                                    className="grid grid-flow-row-dense relative py-1.5 gap-y-1.5 min-h-[64px]"
                                    style={{
                                        gridColumn: '2 / -1',
                                        gridTemplateColumns: colWidths.map(w => `${w}px`).join(' '),
                                        gridAutoFlow: 'row dense'
                                    }}
                                >
                                    {/* Background Grid Lines for visual separation */}
                                    <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: colWidths.map(w => `${w}px`).join(' ') }}>
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
                                                variants={CARD_VARIANTS}
                                                isConflict={isConflict}
                                                onCardClick={onCardClick}
                                            />
                                        );
                                    })}
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
