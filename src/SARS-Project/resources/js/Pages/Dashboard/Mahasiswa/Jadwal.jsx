import { useState, useMemo } from 'react';
import MahasiswaLayout from '../../../Layouts/MahasiswaLayout';
import { Calendar as CalendarIcon, DoorOpen, Download, Search } from 'lucide-react';
import ScheduleGrid from '../../../Components/Shared/ScheduleGrid';
import useServerTime, { getJakartaTimeParts, getJakartaDayKey } from '../../../Components/Shared/useServerTime';
import SyncStatusCard from '../../../Components/Shared/SyncStatusCard';

const HARI_LIST = [
    { key: 'senin', label: 'Senin' },
    { key: 'selasa', label: 'Selasa' },
    { key: 'rabu', label: 'Rabu' },
    { key: 'kamis', label: 'Kamis' },
    { key: 'jumat', label: 'Jumat' },
    { key: 'sabtu', label: 'Sabtu' },
];

const SESSION_TIMES_NORMAL = {
    1: { start: '07:30', end: '08:20' },
    2: { start: '08:25', end: '09:15' },
    3: { start: '09:20', end: '10:10' },
    4: { start: '10:15', end: '11:05' },
    5: { start: '11:10', end: '12:00' },
    6: { start: '13:00', end: '13:50' },
    7: { start: '13:55', end: '14:45' },
    8: { start: '15:30', end: '16:20' },
    9: { start: '16:25', end: '17:15' },
    10: { start: '18:00', end: '18:50' },
    11: { start: '18:55', end: '19:20' },
};

const SESSION_TIMES_JUMAT = {
    1: { start: '07:30', end: '08:20' },
    2: { start: '08:25', end: '09:15' },
    3: { start: '09:20', end: '10:10' },
    4: { start: '10:15', end: '11:05' },
    5: { start: '13:00', end: '13:50' },
    6: { start: '13:55', end: '14:45' },
    7: { start: '15:30', end: '16:20' },
    8: { start: '16:25', end: '17:15' },
    9: { start: '18:00', end: '18:50' },
    10: { start: '18:55', end: '19:20' },
    11: { start: '19:25', end: '20:15' },
};

const getCurrentSession = (nowDate, dayKey) => {
    const { hour, minute } = getJakartaTimeParts(nowDate);
    const timeStr = `${hour}:${minute}`;

    const isFriday = dayKey === 'jumat';
    const times = isFriday ? SESSION_TIMES_JUMAT : SESSION_TIMES_NORMAL;

    for (const [sesi, range] of Object.entries(times)) {
        if (timeStr >= range.start && timeStr <= range.end) {
            return {
                num: parseInt(sesi),
                start: range.start,
                end: range.end
            };
        }
    }
    return null;
};

export default function Jadwal({ schedules = [], rooms = [] }) {
    const serverTimeDate = useServerTime();
    const [showSlotChecker, setShowSlotChecker] = useState(false);
    const [slotDay, setSlotDay] = useState('SENIN');
    const [slotStart, setSlotStart] = useState('08:00');
    const [slotEnd, setSlotEnd] = useState('10:00');
    const [slotDate, setSlotDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const normalizedRooms = useMemo(() => {
        return (rooms || []).map(r => typeof r === 'string' ? r : (r.code || r.name));
    }, [rooms]);

    const currentDayKey = useMemo(() => {
        return getJakartaDayKey(serverTimeDate);
    }, [serverTimeDate]);

    const currentSession = useMemo(() => getCurrentSession(serverTimeDate, currentDayKey), [serverTimeDate, currentDayKey]);

    const openRoomsData = useMemo(() => {
        const daySchedules = (schedules || []).filter(s => s.hari === currentDayKey);

        const allRoomsData = (rooms || []).map(room => {
            const roomCode = typeof room === 'object' && room !== null ? room.code : room;
            const roomName = typeof room === 'object' && room !== null ? (room.name || room.code) : room;

            const dots = Array(11).fill(true); // true = available

            const roomSchedules = daySchedules.filter(s => s.ruangan === roomCode || s.ruangan === roomName);

            roomSchedules.forEach(s => {
                const start = s.sesiMulai; // 1-indexed
                const dur = s.durasi;
                for (let i = 0; i < dur; i++) {
                    const sessionIdx = start - 1 + i;
                    if (sessionIdx >= 0 && sessionIdx < 11) {
                        dots[sessionIdx] = false;
                    }
                }
            });

            // Hitung status kekosongan dan label
            let isVacantNow = true;
            let vacantLabel = '';

            if (currentSession) {
                const currentIdx = currentSession.num - 1;
                isVacantNow = dots[currentIdx] === true;

                if (isVacantNow) {
                    let nextOccupiedSesi = null;
                    for (let i = currentSession.num; i < 11; i++) {
                        if (dots[i] === false) {
                            nextOccupiedSesi = i + 1; // 1-indexed
                            break;
                        }
                    }

                    if (nextOccupiedSesi) {
                        const isFriday = currentDayKey === 'jumat';
                        const times = isFriday ? SESSION_TIMES_JUMAT : SESSION_TIMES_NORMAL;
                        const startTime = times[nextOccupiedSesi]?.start || '';
                        vacantLabel = `Kosong s/d Sesi ${nextOccupiedSesi} (${startTime})`;
                    } else {
                        vacantLabel = 'Bebas s/d Akhir Hari';
                    }
                }
            } else {
                vacantLabel = 'Bebas (Luar Jam Kuliah)';
            }

            return {
                name: roomName,
                isVacantNow: isVacantNow,
                vacantLabel: vacantLabel
            };
        });

        // Filter: Hanya tampilkan ruangan yang kosong pada sesi saat ini
        return allRoomsData.filter(r => r.isVacantNow);
    }, [schedules, rooms, currentDayKey, currentSession]);

    async function handleCheckSlots() {
        setLoadingSlots(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            const res = await fetch(route('mahasiswa.cekSlot'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken || '', 'Accept': 'application/json' },
                body: JSON.stringify({ hari: slotDay, mulai: slotStart, selesai: slotEnd, tanggal: slotDate || null }),
            });
            const data = await res.json();
            setAvailableSlots(data.slots);
        } catch {
            // Fallback logic
            const occupied = schedules.filter(j => j.hari === slotDay.toLowerCase()).map(j => j.ruangan);
            setAvailableSlots(normalizedRooms.filter(r => !occupied.includes(r)));
        } finally { setLoadingSlots(false); }
    }

    return (
        <>
            <section className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <CalendarIcon size={22} className="text-text-primary" />
                        <h1 className="text-xl font-bold text-text-primary">Jadwal Kuliah (Keseluruhan)</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block">
                            <SyncStatusCard />
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowSlotChecker(!showSlotChecker)} className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${showSlotChecker ? 'bg-primary-500 text-white border-primary-500' : 'bg-card text-text-secondary border-border hover:border-primary-500'}`}>
                                <DoorOpen size={14} /> Cek Slot Kosong
                            </button>
                            <button className="px-3 py-2 text-xs font-medium rounded-lg border bg-card text-text-secondary border-border hover:bg-primary-500 hover:text-white transition-all flex items-center gap-1.5">
                                <Download size={14} /> Export
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {showSlotChecker && (
                <section className="mb-8 bg-card border border-border rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2"><Search size={16} /> Cek Ketersediaan Ruangan</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1 block">Hari</label>
                            <select value={slotDay} onChange={e => setSlotDay(e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all">
                                {HARI_LIST.map((h) => <option key={h.key} value={h.key.toUpperCase()}>{h.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1 block">Mulai</label>
                            <input type="time" value={slotStart} onChange={e => setSlotStart(e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1 block">Selesai</label>
                            <input type="time" value={slotEnd} onChange={e => setSlotEnd(e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1 block">Tanggal</label>
                            <input type="date" value={slotDate} onChange={e => setSlotDate(e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all" />
                        </div>
                        <div className="flex items-end">
                            <button onClick={handleCheckSlots} disabled={loadingSlots} className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 shadow-md shadow-primary-500/20">
                                {loadingSlots ? 'Mencari...' : 'Cari Slot'}
                            </button>
                        </div>
                    </div>
                    {availableSlots !== null && (
                        <div className="mt-4 pt-4 border-t border-border">
                            <h4 className="text-xs font-bold text-text-primary mb-2">{availableSlots.length} Ruangan Tersedia</h4>
                            {availableSlots.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {availableSlots.map((room, idx) => {
                                        const roomName = typeof room === 'object' && room !== null ? (room.name || room.code) : room;
                                        return (
                                            <div key={typeof room === 'object' && room !== null ? room.id : idx} className="bg-success/5 border border-success/20 rounded-lg px-3 py-2">
                                                <p className="text-sm font-semibold text-text-primary">{roomName}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : <p className="text-sm text-text-muted">Tidak ada ruangan tersedia.</p>}
                        </div>
                    )}
                </section>
            )}

            {/* ── Schedule Grid (same as Admin dashboard) ──────────────────── */}
            <ScheduleGrid jadwalItems={schedules} rooms={rooms} />

            {/* ── Open Rooms Section ──────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-border/60 pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center text-success">
                            <DoorOpen size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-text-primary">Daftar Ruangan Kosong</h3>
                            <p className="text-xs text-text-muted mt-0.5">
                                {currentSession 
                                    ? `Sesi Aktif: Sesi ${currentSession.num} (${currentSession.start} - ${currentSession.end})` 
                                    : 'Diluar Jam Perkuliahan Aktif'}
                            </p>
                        </div>
                    </div>
                    <span className="self-start sm:self-center text-[10px] font-bold bg-success/10 text-success px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
                        Live Update
                    </span>
                </div>

                {openRoomsData.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {openRoomsData.map((room, idx) => (
                            <div 
                                key={idx} 
                                className="bg-surface border border-border hover:border-success/45 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between gap-2.5 group hover:shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-extrabold text-text-primary group-hover:text-success transition-colors">
                                        {room.name}
                                    </span>
                                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                </div>
                                <div className="text-[10px] font-medium text-success bg-success/10 px-2 py-1 rounded-md text-center w-full truncate select-none" title={room.vacantLabel}>
                                    {room.vacantLabel}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 border border-dashed border-border rounded-xl">
                        <p className="text-sm text-text-muted">Tidak ada ruangan kosong pada sesi ini.</p>
                    </div>
                )}
            </div>
        </>
    );
}

Jadwal.layout = (page) => <MahasiswaLayout>{page}</MahasiswaLayout>;
