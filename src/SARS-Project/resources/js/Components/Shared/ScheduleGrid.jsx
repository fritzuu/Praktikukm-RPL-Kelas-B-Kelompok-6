import React, { useState, useMemo, useEffect } from 'react';
import { Download, CalendarDays, AlertTriangle, Filter, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePage } from '@inertiajs/react';

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

// ColumnResizer helper
function ColumnResizer({ width, onResize }) {
    const handleMouseDown = (e) => {
        e.preventDefault();
        const startX = e.pageX;
        const startWidth = width;
        
        const handleMouseMove = (moveEvent) => {
            const diff = moveEvent.pageX - startX;
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
            className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary-500/50 active:bg-primary-500 z-20 group"
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
    const { auth } = usePage().props;
    const isMahasiswa = auth?.user?.primaryRole === 'mahasiswa' || auth?.user?.role === 'mahasiswa';
    let appliedStyle = '';
    
    if (isConflict || item.tipe === 'konflik') {
        appliedStyle = TIPE_STYLES.konflik;
    } else if (item.tipe === 'override') {
        appliedStyle = TIPE_STYLES.override;
    } else {
        appliedStyle = getColorForMatkul(item.nama);
    }

    const bgClasses = appliedStyle.split(' ').filter(c => c.startsWith('bg-')).join(' ');
    const otherClasses = appliedStyle.split(' ').filter(c => !c.startsWith('bg-')).join(' ');

    return (
        <motion.div
            variants={variants}
            onClick={() => onCardClick?.(item)}
            className={`relative z-10 mx-1 min-w-0 rounded-md border flex flex-col justify-center overflow-hidden transition-[box-shadow,border-color] duration-300 hover:z-20 hover:shadow-md bg-card ${otherClasses} ${isConflict ? 'ring-2 ring-danger/30' : ''} ${onCardClick ? 'cursor-pointer' : ''}`}
            style={{
                gridColumnStart: parseInt(item.sesiMulai) || 1,
                gridColumnEnd: `span ${parseInt(item.durasi) || 1}`
            }}
        >
            <div className={`absolute inset-0 pointer-events-none ${bgClasses}`} />
            <div className="relative z-10 p-2 flex flex-col h-full justify-center">
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
                    {!item.dosen || item.dosen === '-' ? 'Belum Ditentukan' : item.dosen}
                </p>
                <p className="text-[9px] mt-1 font-semibold opacity-85 truncate">
                    Sesi {item.sesiMulai}{item.durasi > 1 ? ` - ${item.sesiMulai + item.durasi - 1}` : ''}
                    {!isMahasiswa && item.mulai && item.selesai && ` (${item.mulai.substring(0,5)} - ${item.selesai.substring(0,5)})`}
                </p>
            </div>
        </motion.div>
    );
}

export default function ScheduleGrid({
    jadwalItems = [],
    rooms,
    title = "Jadwal & Ketersediaan Ruangan",
    headerActions,
    showConflicts = false,
    onCardClick,
    onExport,
}) {
    const [selectedDay, setSelectedDay] = useState('senin');
    const [loading, setLoading] = useState(false);
    
    // State untuk filter & search
    const [semesterFilter, setSemesterFilter] = useState('Semua');
    const [kelasFilter, setKelasFilter] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState(() => window.__globalSearchQuery || '');

    // Listen to global search events from TopBar
    useEffect(() => {
        const handleGlobalSearch = (e) => {
            console.log('ScheduleGrid: Received global-search event with detail:', e.detail);
            setSearchQuery(e.detail || '');
        };
        window.addEventListener('global-search', handleGlobalSearch);
        return () => window.removeEventListener('global-search', handleGlobalSearch);
    }, []);

    const handleResetAllFilters = () => {
        window.__globalSearchQuery = '';
        setSearchQuery('');
        setSemesterFilter('Semua');
        setKelasFilter('Semua');
        window.dispatchEvent(new CustomEvent('global-search-reset'));
    };

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 450);
        return () => clearTimeout(timer);
    }, [jadwalItems]);

    const handleSelectDay = (day) => {
        setLoading(true);
        setSelectedDay(day);
        setTimeout(() => setLoading(false), 450);
    };

    const handleSemesterChange = (val) => {
        setLoading(true);
        setSemesterFilter(val);
        setTimeout(() => setLoading(false), 450);
    };

    const handleKelasChange = (val) => {
        setLoading(true);
        setKelasFilter(val);
        setTimeout(() => setLoading(false), 450);
    };

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

    // ─── Structured Search Logic ──────────────────────────────────────────
    // Parse search query into structured filters to prevent cross-field false positives.
    // E.g. "smt 2 kls d" → semesterSearch="2", kelasSearch="d", remaining text tokens=[]
    // E.g. "jaringan smt4" → semesterSearch="4", kelasSearch=null, remaining=["jaringan"]
    const filteredJadwalItems = useMemo(() => {
        return jadwalItems.filter(j => {
            // 1. Dropdown filters
            const matchSemester = semesterFilter === 'Semua' || (j.semesterNum && j.semesterNum.toString() === semesterFilter.toString());
            const matchKelas = kelasFilter === 'Semua' || j.kelas === kelasFilter;

            const raw = searchQuery.toLowerCase().trim();
            if (!raw) {
                return matchSemester && matchKelas;
            }

            // 2. Extract structured semester pattern from search query
            //    Matches: smt2, smt 2, sem4, sem 4, semester 6, semester6
            let queryCopy = raw;
            let semesterSearch = null;
            const semMatch = queryCopy.match(/\b(?:smt|sem|semester)\s*(\d+)\b/);
            if (semMatch) {
                semesterSearch = semMatch[1]; // just the number, e.g. "2"
                queryCopy = queryCopy.replace(semMatch[0], ' ').trim();
            }

            // 3. Extract structured class pattern from search query
            //    Matches: kls a, kls d, kelas b, kelasC
            let kelasSearch = null;
            const klsMatch = queryCopy.match(/\b(?:kls|kelas)\s*([a-z])\b/);
            if (klsMatch) {
                kelasSearch = klsMatch[1].toUpperCase(); // "D"
                queryCopy = queryCopy.replace(klsMatch[0], ' ').trim();
            }

            // 4. Remaining tokens are general text (match against nama, kode, ruangan, dosen)
            const remainingTokens = queryCopy.split(/\s+/).filter(Boolean);

            // 5. Match semester (structured) — compare number only
            if (semesterSearch) {
                const semNum = String(j.semesterNum || '').toLowerCase();
                // Extract just the number from "Semester 4" → "4"
                const itemSemNum = semNum.replace(/[^0-9]/g, '');
                if (itemSemNum !== semesterSearch) {
                    return false;
                }
            }

            // 6. Match kelas (structured) — exact letter match
            if (kelasSearch) {
                const itemKelas = String(j.kelas || '').toUpperCase().trim();
                // Handle classes like "A P" (praktikum) — check if starts with the letter
                if (!itemKelas.startsWith(kelasSearch)) {
                    return false;
                }
            }

            // 7. Match remaining general tokens against name, code, room, lecturer
            if (remainingTokens.length > 0) {
                const generalTarget = [
                    String(j.nama || ''),
                    String(j.kode || ''),
                    String(j.ruangan || ''),
                    String(j.dosen || ''),
                ].join(' ').toLowerCase();

                const matchGeneral = remainingTokens.every(token => generalTarget.includes(token));
                if (!matchGeneral) {
                    return false;
                }
            }

            return matchSemester && matchKelas;
        });
    }, [jadwalItems, semesterFilter, kelasFilter, searchQuery]);

    const dayJadwal = useMemo(() => filteredJadwalItems.filter(j => j.hari === selectedDay), [filteredJadwalItems, selectedDay]);

    // Derive rooms if not provided, or filter provided rooms to only those with schedules in the schedules list
    const displayRooms = useMemo(() => {
        const roomsWithSchedules = new Set();
        jadwalItems.forEach(j => {
            if (j.ruangan) {
                roomsWithSchedules.add(j.ruangan.toLowerCase().trim());
            }
        });
        
        if (rooms) {
            return rooms.filter(room => {
                const roomName = typeof room === 'object' ? (room.code || room.nama || room.name) : room;
                return roomName && roomsWithSchedules.has(roomName.toLowerCase().trim());
            });
        }
        return Array.from(roomsWithSchedules).sort();
    }, [rooms, jadwalItems]);

    // Default header actions
    const renderHeaderActions = () => {
        if (headerActions !== undefined) return headerActions;

        return (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2 bg-background border border-border px-2 py-1.5 rounded-lg shadow-sm">
                    <Filter size={14} className="text-text-muted ml-1" />
                    
                    <select 
                        value={semesterFilter}
                        onChange={(e) => handleSemesterChange(e.target.value)}
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
                        onChange={(e) => handleKelasChange(e.target.value)}
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
                <DayTabs selectedDay={selectedDay} onSelectDay={handleSelectDay} />
                <div className="pb-2 sm:pb-0 sm:mb-2">
                    {renderHeaderActions()}
                </div>
            </div>

            {/* Matrix Grid */}
            <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto shadow-sm relative min-h-[250px]">
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
                    {dayJadwal.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <Search className="w-10 h-10 text-text-muted mb-3 stroke-[1.5]" />
                            <h3 className="text-sm font-semibold text-text-primary">Tidak ada jadwal ditemukan</h3>
                            <p className="text-xs text-text-muted mt-1 max-w-[320px]">
                                {searchQuery 
                                    ? `Tidak ada jadwal pada hari ${selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} yang cocok dengan kata kunci "${searchQuery}".`
                                    : `Tidak ada jadwal perkuliahan pada hari ${selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}.`
                                }
                            </p>
                            {(searchQuery || semesterFilter !== 'Semua' || kelasFilter !== 'Semua') && (
                                <button
                                    onClick={handleResetAllFilters}
                                    className="mt-4 px-3 py-1.5 text-xs font-semibold text-primary-500 hover:text-primary-600 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg transition-colors"
                                >
                                    Reset Semua Filter
                                </button>
                            )}
                        </div>
                    ) : (
                        displayRooms.map((room, idx) => {
                            const roomKey = typeof room === 'object' ? (room.id || idx) : room;
                            const roomName = typeof room === 'object' ? (room.code || room.nama || room.name) : room;
                            const roomClasses = dayJadwal.filter(j => j.ruangan === roomName || (j.ruangan_id != null && typeof room === 'object' && j.ruangan_id === room.id));

                            return (
                                <motion.div
                                    layout
                                    transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                                    key={roomKey}
                                    className="grid border-b border-border last:border-b-0 relative group hover:bg-background/30 transition-colors"
                                    style={gridStyle}
                                >
                                    {/* Room Label - Sticky */}
                                    <motion.div
                                        layout
                                        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                                        className="p-3 font-semibold text-xs text-text-primary border-r border-border sticky left-0 bg-card z-30 flex items-center group-hover:bg-card shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors"
                                    >
                                        <span className="truncate">{roomName}</span>
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
                                        <div className="absolute inset-0 z-0 grid pointer-events-none" style={{ gridTemplateColumns: colWidths.map(w => `${w}px`).join(' ') }}>
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
                        })
                    )}
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex flex-col items-center justify-center z-40 animate-fade-in">
                        <div className="flex flex-col items-center gap-3 bg-card border border-border p-5 rounded-2xl shadow-xl">
                            <div className="relative flex items-center justify-center">
                                <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                                <CalendarDays className="absolute text-primary-500 animate-pulse" size={16} />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-text-primary">Memproses Jadwal...</p>
                                <p className="text-[10px] text-text-muted mt-1">Mengambil data terbaru dari database</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
