import { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import MahasiswaLayout from '../../../Layouts/MahasiswaLayout';
import { 
    FileText, Plus, ChevronDown, ChevronUp, AlertTriangle, 
    CheckCircle, XCircle, Clock, Star, Sparkles, Check, 
    Loader2, ArrowLeft, ArrowRight, Send, Calendar, 
    Building, LayoutGrid, Search, Layers, RefreshCw
} from 'lucide-react';

const STATUS_STYLES = {
    PENDING_ASLAB: { bg: 'bg-warning/10', text: 'text-warning', label: 'Menunggu Verifikasi Akademik', icon: Clock },
    PENDING_ADMIN: { bg: 'bg-info/10', text: 'text-info', label: 'Pending Admin', icon: Clock },
    APPROVED: { bg: 'bg-success/10', text: 'text-success', label: 'Disetujui', icon: CheckCircle },
    REJECTED_ASLAB: { bg: 'bg-danger/10', text: 'text-danger', label: 'Ditolak Aslab', icon: XCircle },
    REJECTED_ADMIN: { bg: 'bg-danger/10', text: 'text-danger', label: 'Ditolak Admin', icon: XCircle },
    CANCELLED: { bg: 'bg-text-muted/10', text: 'text-text-muted', label: 'Dibatalkan', icon: XCircle },
};

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

const formatTimesToSessions = (day, startTime, endTime) => {
    if (!startTime || !endTime) return '-';
    const start = startTime.substring(0, 5);
    const end = endTime.substring(0, 5);
    
    const isFriday = day === 'JUMAT';
    const times = isFriday ? SESSION_TIMES_JUMAT : SESSION_TIMES_NORMAL;
    
    let startSesi = null;
    let endSesi = null;
    
    for (const [sesi, range] of Object.entries(times)) {
        if (range.start === start) startSesi = parseInt(sesi);
        if (range.end === end) endSesi = parseInt(sesi);
    }
    
    if (startSesi && endSesi) {
        return startSesi === endSesi 
            ? `Sesi ${startSesi}` 
            : `Sesi ${startSesi} - ${endSesi}`;
    }
    
    return '-';
};

const formatDayName = (day) => {
    if (!day) return '';
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
};

const formatDateIndo = (dateStr) => {
    if (!dateStr) return '';
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const getWeekDate = (dayIndex, offset = 0) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    const distanceToMonday = 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday + (offset * 7));
    
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + dayIndex);
    return targetDate;
};

/* ─────────────────────────────────────────────
   Step indicator — simple horizontal bar
   ───────────────────────────────────────────── */
const STEPS = [
    { id: 1, label: 'Pilih Mata Kuliah' },
    { id: 2, label: 'Pilih Pertemuan' },
    { id: 3, label: 'Tipe Request' },
    { id: 4, label: 'Alasan' },
    { id: 5, label: 'Jadwal Pengganti' },
    { id: 6, label: 'Kirim' },
];

function StepIndicator({ current }) {
    return (
        <div className="flex items-center gap-1 mb-6">
            {STEPS.map((step, idx) => {
                const isActive = step.id === current;
                const isDone = step.id < current;
                return (
                    <div key={step.id} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                isDone
                                    ? 'bg-success text-white'
                                    : isActive
                                        ? 'bg-primary-500 text-white ring-4 ring-primary-500/20'
                                        : 'bg-surface border-2 border-border text-text-muted'
                            }`}>
                                {isDone ? <Check size={14} /> : step.id}
                            </div>
                            <span className={`text-[10px] mt-1.5 text-center font-semibold leading-tight ${
                                isActive ? 'text-primary-500' : isDone ? 'text-success' : 'text-text-muted'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all duration-300 -mt-4 ${
                                step.id < current ? 'bg-success' : 'bg-border'
                            }`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ─────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────── */
export default function Requests({
    requests: propRequests,
    schedules: propSchedules,
    rooms: propRooms,
}) {
    const requests = propRequests?.data || propRequests || [];
    const schedules = propSchedules || [];
    const rooms = propRooms || [];

    const [showForm, setShowForm] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        schedule_id: '', request_type: 'TEMPORARY', target_date: '', effective_from_date: '',
        proposed_day: '', proposed_start_time: '', proposed_end_time: '', proposed_room_id: '', reason: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Mode: 'AUTO' or 'MANUAL'
    const [mode, setMode] = useState('AUTO');
    const [isExplorerOpen, setIsExplorerOpen] = useState(false);
    const [explorerRoomId, setExplorerRoomId] = useState('');
    const [explorerWeekOffset, setExplorerWeekOffset] = useState(0);

    // Recommendations
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(false);
    const [selectedRecIndex, setSelectedRecIndex] = useState(null);

    // Meeting Dates State
    const [meetingDates, setMeetingDates] = useState([]);
    const [loadingDates, setLoadingDates] = useState(false);

    // Explorer states
    const [explorerViewMode, setExplorerViewMode] = useState('CARDS'); // 'CARDS' or 'MATRIX'
    const [explorerDay, setExplorerDay] = useState('SENIN');
    const [explorerSessionStart, setExplorerSessionStart] = useState(1);
    const [explorerDuration, setExplorerDuration] = useState(1);
    const [loadingExplorer, setLoadingExplorer] = useState(false);
    const [explorerAvailableRooms, setExplorerAvailableRooms] = useState([]);
    const [explorerRoomContext, setExplorerRoomContext] = useState(null);

    // Matrix view: server-side session data per day
    const [matrixData, setMatrixData] = useState({}); // { 'SENIN': [{session, is_occupied, reason, time_range}, ...], ... }
    const [loadingMatrix, setLoadingMatrix] = useState(false);

    // Manual check state
    const [manualCheckResult, setManualCheckResult] = useState(null);
    const [checkingManual, setCheckingManual] = useState(false);

    // Reset recommendations on schedule_id change and fetch meeting dates
    useEffect(() => {
        setRecommendations([]);
        setSelectedRecIndex(null);
        setMode('AUTO');
        setManualCheckResult(null);
        setForm(f => ({
            ...f,
            proposed_day: '',
            proposed_room_id: '',
            proposed_start_time: '',
            proposed_end_time: '',
            target_date: '',
            effective_from_date: '',
        }));

        if (!form.schedule_id) {
            setMeetingDates([]);
            return;
        }

        setLoadingDates(true);
        fetch(route('mahasiswa.meetingDates'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ schedule_id: form.schedule_id })
        })
        .then(res => res.json())
        .then(data => {
            setMeetingDates(data.dates || []);
        })
        .catch(err => {
            console.error("Error fetching meeting dates:", err);
            setMeetingDates([]);
        })
        .finally(() => {
            setLoadingDates(false);
        });
    }, [form.schedule_id]);

    // Hierarchical course selection
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isComboboxOpen, setIsComboboxOpen] = useState(false);
    const comboboxRef = useRef(null);

    // Semesters
    const semesters = Array.from(
        new Set(schedules.map(s => s.course?.description).filter(Boolean))
    ).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
    });

    // Classes
    const classesForSemester = selectedSemester
        ? Array.from(
            new Set(
                schedules
                    .filter(s => s.course?.description === selectedSemester)
                    .map(s => s.course?.class_name)
                    .filter(Boolean)
            )
        ).sort()
        : [];

    // Filtered schedules
    const filteredSchedules = schedules.filter(s => 
        s.course?.description === selectedSemester &&
        s.course?.class_name === selectedClass
    );

    const displayedSchedules = filteredSchedules.filter(s => {
        const courseName = (s.course?.name || '').toLowerCase();
        const courseCode = (s.course?.code || '').toLowerCase();
        return courseName.includes(searchQuery.toLowerCase()) ||
               courseCode.includes(searchQuery.toLowerCase());
    });

    useEffect(() => {
        function handleClickOutside(event) {
            if (comboboxRef.current && !comboboxRef.current.contains(event.target)) {
                setIsComboboxOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Auto-select Semester and Class if schedule_id is set
    useEffect(() => {
        if (form.schedule_id) {
            const sel = schedules.find(s => String(s.id) === String(form.schedule_id));
            if (sel) {
                if (sel.course?.description && selectedSemester !== sel.course.description) setSelectedSemester(sel.course.description);
                if (sel.course?.class_name && selectedClass !== sel.course.class_name) setSelectedClass(sel.course.class_name);
            }
        }
    }, [form.schedule_id, schedules]);

    const selectedSchedule = schedules.find(s => String(s.id) === String(form.schedule_id));
    const duration = selectedSchedule ? selectedSchedule.session_duration : 1;

    // Prefill Explorer Filters when a schedule is selected
    useEffect(() => {
        if (selectedSchedule) {
            setExplorerDay(selectedSchedule.day_of_week || 'SENIN');
            setExplorerSessionStart(selectedSchedule.session_start || 1);
            setExplorerDuration(selectedSchedule.session_duration || 1);
            if (!explorerRoomId && rooms.length > 0) {
                setExplorerRoomId(String(selectedSchedule.room_id || rooms[0].id));
            }
        }
    }, [selectedSchedule, rooms]);

    // Fetch available rooms from server when explorer opens or filters change (CARDS view)
    const fetchExplorerRooms = async () => {
        if (!isExplorerOpen || !form.schedule_id || explorerViewMode !== 'CARDS') return;
        setLoadingExplorer(true);
        try {
            const daysArr = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];
            const dayIdx = daysArr.indexOf(explorerDay);
            const dateObj = getWeekDate(dayIdx, explorerWeekOffset);
            const targetDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`;

            const response = await fetch(route('mahasiswa.availableRooms'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    schedule_id: form.schedule_id,
                    day: explorerDay,
                    session_start: explorerSessionStart,
                    target_date: targetDate,
                }),
            });
            const data = await response.json();
            setExplorerAvailableRooms(data.rooms || []);
            setExplorerRoomContext(data.context || null);
        } catch (e) {
            console.error('Error fetching available rooms:', e);
            setExplorerAvailableRooms([]);
        } finally {
            setLoadingExplorer(false);
        }
    };

    // Fetch matrix data from server — single bulk request for all 5 days × 11 sessions
    const fetchMatrixData = async () => {
        if (!isExplorerOpen || !form.schedule_id || explorerViewMode !== 'MATRIX' || !explorerRoomId) return;
        setLoadingMatrix(true);
        try {
            const daysArr = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];
            const dates = daysArr.map((_, idx) => {
                const dateObj = getWeekDate(idx, explorerWeekOffset);
                return `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`;
            });

            const response = await fetch(route('mahasiswa.matrixAvailability'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    schedule_id: form.schedule_id,
                    room_id: parseInt(explorerRoomId),
                    dates: dates,
                }),
            });
            const data = await response.json();
            setMatrixData(data.matrix || {});
        } catch (e) {
            console.error('Error fetching matrix data:', e);
            setMatrixData({});
        } finally {
            setLoadingMatrix(false);
        }
    };

    useEffect(() => {
        if (isExplorerOpen && explorerViewMode === 'CARDS') {
            fetchExplorerRooms();
        } else if (isExplorerOpen && explorerViewMode === 'MATRIX') {
            fetchMatrixData();
        }
    }, [isExplorerOpen, explorerDay, explorerSessionStart, explorerDuration, explorerWeekOffset, explorerViewMode, explorerRoomId]);

    // ─── Handlers ───────────────────────────────

    function handleChange(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: null }));
    }

    const resetFormState = () => {
        setStep(1);
        setSelectedSemester('');
        setSelectedClass('');
        setSearchQuery('');
        setForm({ schedule_id: '', request_type: 'TEMPORARY', target_date: '', effective_from_date: '', proposed_day: '', proposed_start_time: '', proposed_end_time: '', proposed_room_id: '', reason: '' });
        setRecommendations([]);
        setSelectedRecIndex(null);
        setMode('AUTO');
        setIsExplorerOpen(false);
        setExplorerWeekOffset(0);
        setFormErrors({});
        setManualCheckResult(null);
    };

    const toggleForm = () => {
        if (showForm) resetFormState();
        setShowForm(!showForm);
    };

    const getManualStartSesi = () => {
        if (!form.proposed_day || !form.proposed_start_time) return null;
        const isFriday = form.proposed_day === 'JUMAT';
        const times = isFriday ? SESSION_TIMES_JUMAT : SESSION_TIMES_NORMAL;
        for (const [sesi, range] of Object.entries(times)) {
            if (range.start === form.proposed_start_time) {
                return parseInt(sesi);
            }
        }
        return null;
    };

    // Client-side checker for Explorer & validation fallback
    const checkRoomAvailabilityForExplorer = (roomId, day, sessionStart, durationVal, weekOffset) => {
        const isFriday = day === 'JUMAT';
        const times = isFriday ? SESSION_TIMES_JUMAT : SESSION_TIMES_NORMAL;
        const sessionEnd = sessionStart + durationVal - 1;
        const startT = times[sessionStart]?.start;
        const endT = times[sessionEnd]?.end;
        if (!startT || !endT) return { isOccupied: false };

        const daysArr = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];
        const dayIdx = daysArr.indexOf(day);
        const dateObj = getWeekDate(dayIdx, weekOffset);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dateVal = String(dateObj.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${dateVal}`;

        for (const s of schedules) {
            const roomCode = rooms.find(r => r.id === roomId)?.code;
            if (!roomCode || s.ruangan !== roomCode) continue;

            const hasOverrideOnDate = s.overrides?.find(ov => ov.tanggal === dateString);

            if (hasOverrideOnDate) {
                if (
                    hasOverrideOnDate.ruangan_baru === roomCode &&
                    hasOverrideOnDate.hari_baru?.toUpperCase() === day &&
                    hasOverrideOnDate.mulai_baru < endT &&
                    hasOverrideOnDate.selesai_baru > startT
                ) {
                    return {
                        isOccupied: true,
                        courseName: s.nama,
                        className: s.kelas,
                        type: 'override'
                    };
                }
                continue;
            }

            const sIsFriday = s.hari?.toUpperCase() === 'JUMAT';
            const timesS = sIsFriday ? SESSION_TIMES_JUMAT : SESSION_TIMES_NORMAL;
            const sStartT = timesS[s.sesiMulai]?.start;
            const sEndT = timesS[s.sesiMulai + s.durasi - 1]?.end;

            if (
                s.hari?.toUpperCase() === day &&
                sStartT < endT &&
                sEndT > startT
            ) {
                return {
                    isOccupied: true,
                    courseName: s.nama,
                    className: s.kelas,
                    type: 'baseline'
                };
            }
        }

        return { isOccupied: false };
    };

    // Dynamic manual check helper
    const handleCekKetersediaanManual = async () => {
        if (!form.proposed_day || !form.proposed_room_id || !form.proposed_start_time) return;
        setCheckingManual(true);
        setManualCheckResult(null);
        try {
            const startSesi = getManualStartSesi();
            if (!startSesi) {
                setManualCheckResult({ available: false, reason: "Sesi tidak valid" });
                return;
            }
            
            const response = await fetch(route('mahasiswa.cekSesiAvailabilitas'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    schedule_id: form.schedule_id,
                    proposed_day: form.proposed_day,
                    target_date: form.request_type === 'TEMPORARY' ? form.target_date : form.effective_from_date,
                    proposed_room_id: form.proposed_room_id
                })
            });
            const data = await response.json();
            
            // Check if any session within the duration is occupied
            const endSesi = startSesi + duration - 1;
            const targetSessions = data.sessions.filter(s => s.session >= startSesi && s.session <= endSesi);
            
            const conflictSession = targetSessions.find(s => s.is_occupied);
            if (conflictSession) {
                setManualCheckResult({
                    available: false,
                    reason: conflictSession.reason || "Slot waktu ini sudah terisi jadwal lain."
                });
            } else {
                setManualCheckResult({
                    available: true,
                    message: "Slot waktu ini tersedia! Anda bisa melanjutkan ke langkah berikutnya."
                });
            }
        } catch (e) {
            console.error("Error checking manual slot availability:", e);
            setManualCheckResult({ available: false, reason: "Gagal memeriksa ketersediaan." });
        } finally {
            setCheckingManual(false);
        }
    };

    // Auto-reset manual check result when fields change
    useEffect(() => {
        setManualCheckResult(null);
    }, [form.proposed_day, form.proposed_room_id, form.proposed_start_time, form.proposed_end_time]);

    // Fetch recommendations
    const handleCariJadwalPengganti = async () => {
        setLoadingRecs(true);
        setSelectedRecIndex(null);
        try {
            const response = await fetch(route('mahasiswa.recommendSchedules'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    schedule_id: form.schedule_id,
                    request_type: form.request_type,
                    target_date: form.target_date,
                    effective_from_date: form.effective_from_date,
                    is_flexible_room: true,
                    proposed_room_id: null,
                })
            });
            const data = await response.json();
            setRecommendations(data.recommendations || []);
        } catch (e) {
            console.error("Error seeking recommendations:", e);
        } finally {
            setLoadingRecs(false);
        }
    };

    const handleSelectRecommendation = (rec, index) => {
        setSelectedRecIndex(index);
        handleChange('proposed_day', rec.day);
        handleChange('proposed_room_id', rec.room.id);

        const isFriday = rec.day === 'JUMAT';
        const times = isFriday ? SESSION_TIMES_JUMAT : SESSION_TIMES_NORMAL;
        if (times[rec.session_start] && times[rec.session_end]) {
            handleChange('proposed_start_time', times[rec.session_start].start);
            handleChange('proposed_end_time', times[rec.session_end].end);
        }
    };

    // Submit
    async function handleSubmit() {
        if (!form.schedule_id || !form.reason || form.reason.length < 20) return;
        setSubmitting(true);
        const payload = {
            ...form,
            target_date: form.request_type === 'TEMPORARY' ? form.target_date : '',
            effective_from_date: form.request_type === 'PERMANENT' ? form.effective_from_date : '',
        };
        try {
            router.post(route('mahasiswa.requests.submit'), payload, {
                onFinish: () => { 
                    setSubmitting(false); 
                    setShowForm(false); 
                    resetFormState();
                },
                onError: (errors) => { setFormErrors(errors); setSubmitting(false); },
            });
        } catch { setSubmitting(false); }
    }

    const handleOpenExplorer = () => {
        setIsExplorerOpen(true);
        setExplorerViewMode('CARDS');
        if (selectedSchedule) {
            setExplorerDay(selectedSchedule.day_of_week || 'SENIN');
            setExplorerSessionStart(selectedSchedule.session_start || 1);
            setExplorerDuration(selectedSchedule.session_duration || 1);
            setExplorerRoomId(selectedSchedule.room_id ? String(selectedSchedule.room_id) : (rooms[0]?.id ? String(rooms[0].id) : ''));
        } else {
            setExplorerDay('SENIN');
            setExplorerSessionStart(1);
            setExplorerDuration(1);
            if (rooms.length > 0) {
                setExplorerRoomId(String(rooms[0].id));
            }
        }
    };

    // Step navigation helpers
    const canGoStep2 = !!form.schedule_id;
    const canGoStep3 = canGoStep2 && (form.target_date || form.effective_from_date);
    const canGoStep4 = canGoStep3 && !!form.request_type;
    const canGoStep5 = canGoStep4 && form.reason.length >= 20;
    const isAutomaticMode = mode === 'AUTO';
    const hasSelectedManualSlot = !isAutomaticMode && !!form.proposed_day && !!form.proposed_room_id && !!form.proposed_start_time && !!form.proposed_end_time;
    const canGoStep6 = canGoStep5 && (isAutomaticMode ? selectedRecIndex !== null : (hasSelectedManualSlot && manualCheckResult?.available));
    const canSubmit = step === 6 && canGoStep6;

    return (
        <>
            <section className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText size={22} className="text-text-primary" />
                        <h1 className="text-xl font-bold text-text-primary">Requests</h1>
                    </div>
                    <button onClick={toggleForm} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${showForm ? 'bg-danger text-white' : 'bg-primary-500 hover:bg-primary-600 text-white'}`}>
                        {showForm ? <XCircle size={16} /> : <Plus size={16} />}
                        {showForm ? 'Tutup Form' : 'Ajukan Request Baru'}
                    </button>
                </div>
            </section>

            {showForm && (
                <section className="mb-6 bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <StepIndicator current={step} />

                    {/* ══════════ STEP 1: Pilih Mata Kuliah ══════════ */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-base font-bold text-text-primary">Pilih Mata Kuliah</h3>
                                <p className="text-xs text-text-secondary mt-0.5">Pilih jadwal mata kuliah yang ingin diajukan perubahan.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Semester *</label>
                                    <select 
                                        value={selectedSemester} 
                                        onChange={e => {
                                            setSelectedSemester(e.target.value);
                                            setSelectedClass('');
                                            handleChange('schedule_id', '');
                                            setSearchQuery('');
                                        }} 
                                        className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-text-primary"
                                    >
                                        <option value="">Pilih Semester...</option>
                                        {semesters.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Kelas *</label>
                                    <select 
                                        value={selectedClass} 
                                        onChange={e => {
                                            setSelectedClass(e.target.value);
                                            handleChange('schedule_id', '');
                                            setSearchQuery('');
                                        }} 
                                        disabled={!selectedSemester}
                                        className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-text-primary"
                                    >
                                        <option value="">Pilih Kelas...</option>
                                        {classesForSemester.map(cls => (
                                            <option key={cls} value={cls}>Kelas {cls}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Course combobox */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Mata Kuliah *</label>
                                <div className="relative" ref={comboboxRef}>
                                    <input
                                        type="text"
                                        placeholder={!selectedSemester || !selectedClass ? "Pilih semester dan kelas terlebih dahulu..." : "Cari mata kuliah..."}
                                        value={isComboboxOpen ? searchQuery : (selectedSchedule ? selectedSchedule.course?.name : '')}
                                        onChange={e => {
                                            setSearchQuery(e.target.value);
                                            if (!isComboboxOpen) setIsComboboxOpen(true);
                                        }}
                                        onFocus={() => {
                                            if (selectedSemester && selectedClass) {
                                                setIsComboboxOpen(true);
                                                setSearchQuery('');
                                            }
                                        }}
                                        disabled={!selectedSemester || !selectedClass}
                                        className={`w-full pl-3 pr-10 py-2.5 bg-surface border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${
                                            formErrors.schedule_id ? 'border-danger' : 'border-border'
                                        } disabled:opacity-50 disabled:cursor-not-allowed text-text-primary`}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted flex items-center gap-1.5">
                                        {selectedSchedule && (
                                            <button 
                                                type="button" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleChange('schedule_id', '');
                                                    setSearchQuery('');
                                                }}
                                                className="hover:text-text-primary p-0.5 rounded-full"
                                                title="Hapus pilihan"
                                            >
                                                <XCircle size={14} />
                                            </button>
                                        )}
                                        <ChevronDown size={16} className="pointer-events-none" />
                                    </div>

                                    {isComboboxOpen && selectedSemester && selectedClass && (
                                        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto panel-scroll py-1">
                                            {displayedSchedules.length > 0 ? (
                                                displayedSchedules.map(s => {
                                                    const isSelected = String(s.id) === String(form.schedule_id);
                                                    const lecturersList = s.teaching_assignments || s.teachingAssignments || [];
                                                    const lecturerName = lecturersList.find(ta => ta.role_in_class === 'PENGAJAR')?.user?.name;
                                                    return (
                                                        <button
                                                            key={s.id}
                                                            type="button"
                                                            onClick={() => {
                                                                handleChange('schedule_id', s.id);
                                                                setIsComboboxOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-50 dark:hover:bg-primary-500/10 flex flex-col transition-colors ${
                                                                isSelected ? 'bg-primary-500/10 border-l-2 border-primary-500' : ''
                                                            }`}
                                                        >
                                                            <span className="font-semibold text-text-primary">{s.course?.name}</span>
                                                            <span className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                                                                <span>{formatDayName(s.day_of_week)} • Sesi {s.session_start}{s.session_duration > 1 ? `-${s.session_start + s.session_duration - 1}` : ''}</span>
                                                                {lecturerName && (
                                                                    <>
                                                                        <span className="text-text-muted">•</span>
                                                                        <span className="italic text-text-muted truncate max-w-[150px]">{lecturerName}</span>
                                                                    </>
                                                                )}
                                                            </span>
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="py-3 px-4 text-center text-sm text-text-muted">
                                                    Tidak ada jadwal tersedia
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Selected schedule preview - READ ONLY CARD */}
                            {selectedSchedule && (
                                <div className="p-4 bg-surface border border-border/85 rounded-2xl text-sm text-text-secondary">
                                    <p className="font-bold text-text-primary text-[10px] mb-3 uppercase tracking-wider text-primary-500 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                                        Detail Jadwal Kuliah Saat Ini
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                                        <div>
                                            <span className="text-text-muted block text-[9px] font-bold uppercase tracking-wider mb-0.5">Mata Kuliah</span>
                                            <span className="font-bold text-text-primary">{selectedSchedule.course?.name || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-text-muted block text-[9px] font-bold uppercase tracking-wider mb-0.5">Kelas</span>
                                            <span className="font-semibold text-text-primary">{selectedSchedule.course?.class_name ? `Kelas ${selectedSchedule.course.class_name}` : '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-text-muted block text-[9px] font-bold uppercase tracking-wider mb-0.5">Semester</span>
                                            <span className="font-semibold text-text-primary">{selectedSchedule.course?.description || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-text-muted block text-[9px] font-bold uppercase tracking-wider mb-0.5">Hari & Sesi</span>
                                            <span className="font-semibold text-text-primary">
                                                {formatDayName(selectedSchedule.day_of_week)} • Sesi {selectedSchedule.session_start}
                                                {selectedSchedule.session_duration > 1 ? `-${selectedSchedule.session_start + selectedSchedule.session_duration - 1}` : ''}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-text-muted block text-[9px] font-bold uppercase tracking-wider mb-0.5">Ruangan</span>
                                            <span className="font-semibold text-text-primary">{selectedSchedule.room?.name || selectedSchedule.room?.code || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-2 border-t border-border/50">
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!canGoStep2}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
                                >
                                    <span>Lanjut</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ══════════ STEP 2: Pilih Pertemuan ══════════ */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                                    <Calendar size={18} className="text-primary-500" />
                                    Pilih Pertemuan
                                </h3>
                                <p className="text-xs text-text-secondary mt-0.5">Pilih tanggal pertemuan kuliah yang ingin diganti.</p>
                            </div>

                            {loadingDates ? (
                                <div className="space-y-3 py-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-16 bg-surface border border-border/50 rounded-xl animate-pulse flex items-center px-4 justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-surface-hover animate-pulse" />
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-surface-hover rounded w-32 animate-pulse" />
                                                    <div className="h-3 bg-surface-hover rounded w-20 animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="w-5 h-5 rounded-full bg-surface-hover animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            ) : meetingDates.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto panel-scroll pr-1 py-1">
                                    {meetingDates.map((dateObj, idx) => {
                                        const isSelected = form.target_date === dateObj.date;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    handleChange('target_date', dateObj.date);
                                                    handleChange('effective_from_date', dateObj.date);
                                                }}
                                                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between group ${
                                                    isSelected
                                                        ? 'border-primary-500 bg-primary-500/5 shadow-md ring-2 ring-primary-500/20'
                                                        : 'border-border bg-card hover:border-primary-500/40 hover:shadow-sm'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-primary-500 text-white' : 'bg-surface text-text-muted group-hover:bg-primary-50 group-hover:text-primary-500 dark:group-hover:bg-primary-500/10'}`}>
                                                        <Clock size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-text-primary">{dateObj.label}</p>
                                                        <p className="text-[10px] text-text-muted font-medium mt-0.5">Pertemuan Kuliah</p>
                                                    </div>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-border group-hover:border-primary-500'}`}>
                                                    {isSelected && <Check size={12} className="text-white" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 bg-surface/50 border border-border border-dashed rounded-2xl flex flex-col items-center text-center">
                                    <AlertTriangle size={32} className="text-warning mb-3" />
                                    <p className="text-sm font-bold text-text-secondary">Tidak Ada Pertemuan Tersedia</p>
                                    <p className="text-xs text-text-muted mt-1 max-w-sm">Jadwal semester ini telah berakhir atau tidak ada tanggal pertemuan mendatang yang cocok.</p>
                                </div>
                            )}

                            <div className="flex justify-between pt-4 border-t border-border/50">
                                <button onClick={() => setStep(1)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                    <ArrowLeft size={16} />
                                    <span>Kembali</span>
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!canGoStep3}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                                >
                                    <span>Lanjut</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ══════════ STEP 3: Tipe Request ══════════ */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                                    <Layers size={18} className="text-primary-500" />
                                    Tipe Request
                                </h3>
                                <p className="text-xs text-text-secondary mt-0.5">Tentukan apakah perubahan jadwal ini bersifat sementara atau permanen.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleChange('request_type', 'TEMPORARY')}
                                    className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col gap-2 relative ${
                                        form.request_type === 'TEMPORARY'
                                            ? 'border-primary-500 bg-primary-500/5 shadow-md ring-2 ring-primary-500/20'
                                            : 'border-border bg-card hover:border-primary-500/40 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${form.request_type === 'TEMPORARY' ? 'bg-primary-500 text-white' : 'bg-surface text-text-secondary'}`}>
                                            1x Sementara
                                        </span>
                                        <Clock size={18} className={form.request_type === 'TEMPORARY' ? 'text-primary-500' : 'text-text-muted'} />
                                    </div>
                                    <p className="text-sm font-bold text-text-primary mt-1">Perubahan Satu Pertemuan</p>
                                    <p className="text-xs text-text-secondary leading-normal">
                                        Jadwal kuliah hanya bergeser untuk tanggal pertemuan yang dipilih ({formatDateIndo(form.target_date || form.effective_from_date)}). Pertemuan minggu berikutnya kembali ke jadwal normal.
                                    </p>
                                    {form.request_type === 'TEMPORARY' && (
                                        <div className="absolute top-3 right-3 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleChange('request_type', 'PERMANENT')}
                                    className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col gap-2 relative ${
                                        form.request_type === 'PERMANENT'
                                            ? 'border-primary-500 bg-primary-500/5 shadow-md ring-2 ring-primary-500/20'
                                            : 'border-border bg-card hover:border-primary-500/40 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${form.request_type === 'PERMANENT' ? 'bg-primary-500 text-white' : 'bg-surface text-text-secondary'}`}>
                                            Permanen
                                        </span>
                                        <RefreshCw size={16} className={form.request_type === 'PERMANENT' ? 'text-primary-500' : 'text-text-muted'} />
                                    </div>
                                    <p className="text-sm font-bold text-text-primary mt-1">Perubahan Sisa Semester</p>
                                    <p className="text-xs text-text-secondary leading-normal">
                                        Jadwal kuliah akan berubah secara permanen setiap minggunya untuk sisa semester aktif, berlaku mulai tanggal {formatDateIndo(form.target_date || form.effective_from_date)}.
                                    </p>
                                    {form.request_type === 'PERMANENT' && (
                                        <div className="absolute top-3 right-3 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            </div>

                            <div className="flex justify-between pt-4 border-t border-border/50">
                                <button onClick={() => setStep(2)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                    <ArrowLeft size={16} />
                                    <span>Kembali</span>
                                </button>
                                <button
                                    onClick={() => setStep(4)}
                                    disabled={!canGoStep4}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                                >
                                    <span>Lanjut</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ══════════ STEP 4: Alasan ══════════ */}
                    {step === 4 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                                    <FileText size={18} className="text-primary-500" />
                                    Alasan Perubahan
                                </h3>
                                <p className="text-xs text-text-secondary mt-0.5">Jelaskan mengapa permohonan pemindahan jadwal diajukan.</p>
                            </div>

                            <div>
                                <textarea
                                    value={form.reason}
                                    onChange={e => handleChange('reason', e.target.value)}
                                    rows={4}
                                    placeholder="Contoh: Dosen pengampu berhalangan hadir pada tanggal tersebut karena ada kegiatan akademik luar kota yang tidak bisa ditinggalkan..."
                                    className={`w-full px-4 py-3 bg-surface border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all resize-none ${formErrors.reason ? 'border-danger' : 'border-border'} text-text-primary`}
                                />
                                <div className="flex justify-between mt-1.5 px-1">
                                    {formErrors.reason && <p className="text-[10px] text-danger">{formErrors.reason}</p>}
                                    <p className={`text-[10px] ml-auto font-semibold ${form.reason.length >= 20 ? 'text-success' : 'text-text-muted'}`}>
                                        {form.reason.length}/20 karakter {form.reason.length >= 20 ? '✓' : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4 border-t border-border/50">
                                <button onClick={() => setStep(3)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                    <ArrowLeft size={16} />
                                    <span>Kembali</span>
                                </button>
                                <button
                                    onClick={() => { setStep(5); handleCariJadwalPengganti(); }}
                                    disabled={!canGoStep5}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                                >
                                    <Sparkles size={16} className="text-yellow-300 animate-pulse" />
                                    <span>Cari Jadwal Pengganti</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ══════════ STEP 5: Jadwal Pengganti ══════════ */}
                    {step === 5 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
                                <div>
                                    <h3 className="text-base font-bold text-text-primary">Pilih Jadwal Pengganti</h3>
                                    <p className="text-xs text-text-secondary mt-0.5">
                                        Pilih metode pencarian jadwal pengganti untuk pertemuan pada tanggal {formatDateIndo(form.target_date || form.effective_from_date)}.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleOpenExplorer}
                                    className="px-4 py-2 text-xs font-bold border-2 border-primary-500/20 text-primary-500 bg-primary-500/5 hover:bg-primary-500/10 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-center shadow-sm"
                                >
                                    <Search size={12} />
                                    Cari Ruangan Pengganti
                                </button>
                            </div>

                            {/* Mode Toggle Selector */}
                            <div className="flex gap-2 p-1 bg-surface border border-border rounded-xl w-fit">
                                <button
                                    type="button"
                                    onClick={() => setMode('AUTO')}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'AUTO' ? 'bg-primary-500 text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                                >
                                    Cari Otomatis
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('MANUAL')}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'MANUAL' ? 'bg-primary-500 text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                                >
                                    Pilih Manual
                                </button>
                            </div>

                            {/* AUTO MODE */}
                            {mode === 'AUTO' && (
                                <div className="space-y-4">
                                    {loadingRecs ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                                            <div className="relative">
                                                <Loader2 size={32} className="animate-spin text-primary-500" />
                                                <Sparkles size={14} className="absolute -top-1 -right-1 text-yellow-500 animate-pulse" />
                                            </div>
                                            <p className="text-sm text-text-secondary font-medium">Mencari jadwal pengganti terbaik...</p>
                                            <p className="text-xs text-text-muted">Memeriksa ketersediaan ruangan, dosen, dan kelas</p>
                                        </div>
                                    ) : recommendations.length > 0 ? (
                                        <>
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-xs text-text-muted font-medium">{recommendations.length} pilihan tersedia</p>
                                                <button
                                                    type="button"
                                                    onClick={handleCariJadwalPengganti}
                                                    className="flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                                                >
                                                    <RefreshCw size={12} />
                                                    Cari Ulang
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-200">
                                                {recommendations.map((rec, index) => {
                                                    const isSelected = selectedRecIndex === index;
                                                    return (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => handleSelectRecommendation(rec, index)}
                                                            className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 flex flex-col ${
                                                                isSelected
                                                                    ? 'border-primary-500 bg-primary-500/5 shadow-md ring-2 ring-primary-500/20'
                                                                    : rec.is_best
                                                                        ? 'border-yellow-500/40 bg-gradient-to-br from-yellow-500/5 to-transparent hover:border-yellow-500/70 hover:shadow-md'
                                                                        : 'border-border bg-card hover:border-primary-500/40 hover:shadow-sm'
                                                            }`}
                                                        >
                                                            {/* Best badge */}
                                                            {rec.is_best && (
                                                                <div className="absolute -top-2.5 left-3 px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1 shadow-sm">
                                                                    <Star size={10} className="fill-white" />
                                                                    Rekomendasi Terbaik
                                                                </div>
                                                            )}

                                                            {/* Day & Session */}
                                                            <p className={`text-sm font-bold text-text-primary ${rec.is_best ? 'mt-1' : ''}`}>
                                                                {formatDayName(rec.day)} • {rec.session_label}
                                                            </p>

                                                            {/* Room */}
                                                            <p className="text-xs font-semibold text-primary-500 mt-1">
                                                                {rec.room.code}
                                                            </p>

                                                            {/* Time */}
                                                            <p className="text-[11px] text-text-muted mt-0.5">
                                                                {rec.start_time} – {rec.end_time}
                                                            </p>

                                                            {/* Date label */}
                                                            {rec.date_label && (
                                                                <p className="text-[11px] text-text-secondary mt-1.5 font-medium">
                                                                    {rec.date_label}
                                                                </p>
                                                            )}

                                                            {/* Selected indicator */}
                                                            {isSelected && (
                                                                <div className="absolute top-3 right-3 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                                                                    <Check size={14} className="text-white" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="py-10 px-6 bg-surface/50 border border-border rounded-xl flex flex-col items-center text-center animate-in fade-in duration-200">
                                            <AlertTriangle size={32} className="text-warning mb-3" />
                                            <p className="text-sm font-bold text-text-primary">Tidak ada jadwal pengganti otomatis tersedia</p>
                                            <p className="text-xs text-text-secondary mt-1.5 max-w-sm">
                                                Semua slot pada periode ini sudah penuh atau bentrok. Coba gunakan <strong>Pilih Manual</strong> atau hubungi admin.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* MANUAL MODE */}
                            {mode === 'MANUAL' && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* Day Picker */}
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Hari *</label>
                                            <select
                                                value={form.proposed_day}
                                                onChange={(e) => {
                                                    const d = e.target.value;
                                                    setForm(f => ({ ...f, proposed_day: d, proposed_start_time: '', proposed_end_time: '' }));
                                                }}
                                                className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm font-semibold text-text-primary"
                                            >
                                                <option value="">-- Pilih Hari --</option>
                                                {['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'].map(day => (
                                                    <option key={day} value={day}>{formatDayName(day)}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Room Picker */}
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Ruangan *</label>
                                            <select
                                                value={form.proposed_room_id}
                                                onChange={(e) => {
                                                    const rId = e.target.value;
                                                    setForm(f => ({ ...f, proposed_room_id: rId, proposed_start_time: '', proposed_end_time: '' }));
                                                }}
                                                className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm font-semibold text-text-primary"
                                            >
                                                <option value="">-- Pilih Ruangan --</option>
                                                {rooms.map(room => (
                                                    <option key={room.id} value={room.id}>{room.code} - {room.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Session Picker */}
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Sesi Mulai *</label>
                                            <select
                                                value={getManualStartSesi() || ''}
                                                onChange={(e) => {
                                                    const s = parseInt(e.target.value);
                                                    if (s && form.proposed_day) {
                                                        const isFriday = form.proposed_day === 'JUMAT';
                                                        const times = isFriday ? SESSION_TIMES_JUMAT : SESSION_TIMES_NORMAL;
                                                        const endSesi = s + duration - 1;
                                                        setForm(f => ({
                                                            ...f,
                                                            proposed_start_time: times[s]?.start || '',
                                                            proposed_end_time: times[endSesi]?.end || ''
                                                        }));
                                                    }
                                                }}
                                                disabled={!form.proposed_day || !form.proposed_room_id}
                                                className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-text-primary disabled:opacity-50"
                                            >
                                                <option value="">Pilih Sesi...</option>
                                                {Array.from({ length: 11 - duration + 1 }, (_, index) => {
                                                    const s = index + 1;
                                                    const endS = s + duration - 1;
                                                    const isFriday = form.proposed_day === 'JUMAT';
                                                    const times = isFriday ? SESSION_TIMES_JUMAT : SESSION_TIMES_NORMAL;
                                                    const rangeLabel = `${times[s]?.start} - ${times[endS]?.end}`;
                                                    return (
                                                        <option key={s} value={s}>Sesi {s}{duration > 1 ? ` - ${endS}` : ''} ({rangeLabel})</option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Verification section */}
                                    {form.proposed_day && form.proposed_room_id && form.proposed_start_time && (
                                        <div className="flex flex-col gap-3 p-4 bg-surface/50 border border-border rounded-2xl animate-in fade-in duration-200 mt-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-text-secondary font-medium">Verifikasi ketersediaan di database:</span>
                                                <button
                                                    type="button"
                                                    disabled={checkingManual}
                                                    onClick={handleCekKetersediaanManual}
                                                    className="px-4 py-1.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                                                >
                                                    {checkingManual && <Loader2 size={12} className="animate-spin" />}
                                                    Cek Ketersediaan
                                                </button>
                                            </div>

                                            {manualCheckResult && (
                                                <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                                                    manualCheckResult.available
                                                        ? 'bg-success/5 border-success/20 text-success'
                                                        : 'bg-danger/5 border-danger/20 text-danger'
                                                }`}>
                                                    {manualCheckResult.available ? (
                                                        <CheckCircle size={16} className="shrink-0 mt-0.5" />
                                                    ) : (
                                                        <XCircle size={16} className="shrink-0 mt-0.5" />
                                                    )}
                                                    <div className="text-xs">
                                                        <p className="font-bold">{manualCheckResult.available ? 'Tersedia' : 'Bentrok / Tidak Tersedia'}</p>
                                                        <p className="mt-0.5 font-medium leading-normal">{manualCheckResult.available ? manualCheckResult.message : manualCheckResult.reason}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {(!form.proposed_day || !form.proposed_room_id) && (
                                        <div className="p-8 bg-surface/50 border border-border border-dashed rounded-xl flex flex-col items-center text-center">
                                            <p className="text-sm font-bold text-text-secondary">Tentukan Hari dan Ruangan</p>
                                            <p className="text-xs text-text-muted mt-1 max-w-sm">Pilih hari dan ruangan di atas untuk melihat sesi yang tersedia.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-between pt-4 border-t border-border/50">
                                <button onClick={() => setStep(4)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                    <ArrowLeft size={16} />
                                    <span>Kembali</span>
                                </button>
                                <button
                                    onClick={() => setStep(6)}
                                    disabled={mode === 'AUTO' ? selectedRecIndex === null : !form.proposed_day || !form.proposed_room_id || !form.proposed_start_time || !form.proposed_end_time || !manualCheckResult?.available}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                                >
                                    <span>Lanjut</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ══════════ STEP 6: Review & Kirim ══════════ */}
                    {step === 6 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                                    <Send size={18} className="text-primary-500" />
                                    Review & Kirim
                                </h3>
                                <p className="text-xs text-text-secondary mt-0.5">Tinjau kembali seluruh detail permohonan Anda sebelum menekan tombol Kirim.</p>
                            </div>

                            <div className="p-5 bg-gradient-to-br from-primary-500/5 via-transparent to-indigo-500/5 border border-primary-500/20 rounded-2xl space-y-4">
                                {/* Original schedule */}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                                        Jadwal Saat Ini
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-surface/40 p-3 rounded-xl border border-border/45">
                                        <div>
                                            <span className="text-text-muted block text-[9px] uppercase tracking-wider mb-0.5">Mata Kuliah</span>
                                            <span className="font-semibold text-text-primary">{selectedSchedule?.course?.name || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-text-muted block text-[9px] uppercase tracking-wider mb-0.5">Semester & Kelas</span>
                                            <span className="font-semibold text-text-primary">{selectedSchedule?.course?.description} - Kelas {selectedSchedule?.course?.class_name}</span>
                                        </div>
                                        <div>
                                            <span className="text-text-muted block text-[9px] uppercase tracking-wider mb-0.5">Hari, Sesi & Ruangan</span>
                                            <span className="font-semibold text-text-primary">
                                                {selectedSchedule ? `${formatDayName(selectedSchedule.day_of_week)} (Sesi ${selectedSchedule.session_start}${selectedSchedule.session_duration > 1 ? `-${selectedSchedule.session_start + selectedSchedule.session_duration - 1}` : ''}) • ${selectedSchedule.room?.code}` : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border/40" />

                                {/* Replacement schedule */}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary-500 mb-2 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                        Jadwal Pengganti yang Diajukan
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-primary-500/[0.02] p-3 rounded-xl border border-primary-500/10">
                                        <div>
                                            <span className="text-text-muted block text-[9px] uppercase tracking-wider mb-0.5">Hari & Sesi Baru</span>
                                            <span className="font-bold text-text-primary">
                                                {selectedRecIndex !== null && recommendations[selectedRecIndex]
                                                    ? `${formatDayName(recommendations[selectedRecIndex].day)} • ${recommendations[selectedRecIndex].session_label}`
                                                    : `${formatDayName(form.proposed_day)} • ${formatTimesToSessions(form.proposed_day, form.proposed_start_time, form.proposed_end_time)}`
                                                }
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-text-muted block text-[9px] uppercase tracking-wider mb-0.5">Ruangan Baru</span>
                                            <span className="font-bold text-primary-500">
                                                {selectedRecIndex !== null && recommendations[selectedRecIndex]
                                                    ? recommendations[selectedRecIndex].room.code
                                                    : (rooms.find(r => r.id === parseInt(form.proposed_room_id))?.code || '-')
                                                }
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-text-muted block text-[9px] uppercase tracking-wider mb-0.5">Waktu</span>
                                            <span className="font-semibold text-text-primary">
                                                {selectedRecIndex !== null && recommendations[selectedRecIndex]
                                                    ? `${recommendations[selectedRecIndex].start_time} – ${recommendations[selectedRecIndex].end_time}`
                                                    : `${form.proposed_start_time} – ${form.proposed_end_time}`
                                                }
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-text-muted block text-[9px] uppercase tracking-wider mb-0.5">Tipe Perubahan</span>
                                            <span className={`font-semibold ${form.request_type === 'TEMPORARY' ? 'text-cyan-600' : 'text-warning'}`}>
                                                {form.request_type === 'TEMPORARY' ? '1x Sementara' : 'Permanen'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-text-muted block text-[9px] uppercase tracking-wider mb-0.5">
                                                {form.request_type === 'TEMPORARY' ? 'Tanggal Pertemuan' : 'Mulai Berlaku'}
                                            </span>
                                            <span className="font-semibold text-text-primary">
                                                {formatDateIndo(form.request_type === 'TEMPORARY' ? form.target_date : form.effective_from_date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border/40" />

                                {/* Reason */}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                                        Alasan
                                    </p>
                                    <p className="text-sm text-text-secondary bg-surface/30 p-3 rounded-xl border border-border/40 leading-normal">{form.reason}</p>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4 border-t border-border/50">
                                <button onClick={() => setStep(5)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                    <ArrowLeft size={16} />
                                    <span>Kembali</span>
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !canSubmit}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:opacity-90 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    <span>Kirim Request</span>
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Room Availability Explorer Modal */}
            {isExplorerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-card border border-border/60 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200" style={{boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'}}>
                        {/* Modal Header */}
                        <div className="px-8 pt-7 pb-5 border-b border-border/50 bg-gradient-to-b from-surface/60 to-transparent">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                            <Search size={16} className="text-white" />
                                        </div>
                                        Cari Ruangan Pengganti
                                    </h2>
                                    <p className="text-xs text-text-muted mt-2 ml-[46px]">Menampilkan ruangan yang tersedia berdasarkan filter yang dipilih.</p>
                                </div>
                                <button
                                    onClick={() => setIsExplorerOpen(false)}
                                    className="p-2 text-text-muted hover:text-text-primary hover:bg-surface rounded-xl transition-all hover:rotate-90 duration-300"
                                >
                                    <XCircle size={22} />
                                </button>
                            </div>
                            {/* Context header */}
                            {selectedSchedule && (
                                <div className="mt-4 ml-[46px] px-4 py-2.5 bg-gradient-to-r from-primary-500/[0.07] to-indigo-500/[0.05] border border-primary-500/15 rounded-xl text-xs text-text-secondary flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span className="font-bold text-primary-500">Untuk:</span>
                                    <span className="font-bold text-text-primary">{selectedSchedule.course?.name}</span>
                                    <span className="text-text-muted/50">•</span>
                                    <span className="font-medium">{formatDayName(selectedSchedule.day_of_week)}, Sesi {selectedSchedule.session_start}{selectedSchedule.session_duration > 1 ? `-${selectedSchedule.session_start + selectedSchedule.session_duration - 1}` : ''}</span>
                                    <span className="text-text-muted/50">•</span>
                                    <span className="font-semibold text-primary-500">{selectedSchedule.room?.code}</span>
                                </div>
                            )}
                        </div>

                        {/* Modal Navigation and View Toggle */}
                        <div className="px-8 py-4 border-b border-border/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-surface/20">
                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-3 flex-1">
                                {explorerViewMode === 'CARDS' ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Hari:</span>
                                            <select
                                                value={explorerDay}
                                                onChange={(e) => setExplorerDay(e.target.value)}
                                                className="px-3 py-2 text-xs bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-text-primary font-semibold shadow-sm"
                                            >
                                                {['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'].map(d => (
                                                    <option key={d} value={d}>{formatDayName(d)}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Sesi:</span>
                                            <select
                                                value={explorerSessionStart}
                                                onChange={(e) => setExplorerSessionStart(parseInt(e.target.value))}
                                                className="px-3 py-2 text-xs bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-text-primary font-semibold shadow-sm"
                                            >
                                                {Array.from({ length: 11 - (explorerDuration - 1) }, (_, i) => i + 1).map(s => (
                                                    <option key={s} value={s}>Sesi {s}{explorerDuration > 1 ? ` - ${s + explorerDuration - 1}` : ''}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Pilih Ruangan:</span>
                                        <select
                                            value={explorerRoomId}
                                            onChange={(e) => setExplorerRoomId(e.target.value)}
                                            className="px-3 py-2 text-xs bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-text-primary font-semibold shadow-sm"
                                        >
                                            {rooms.map(r => (
                                                <option key={r.id} value={r.id}>{r.code} - {r.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* View Toggle and Week Selector */}
                            <div className="flex items-center gap-3 justify-between md:justify-end">
                                <div className="flex items-center gap-0.5 bg-card p-1 border border-border rounded-xl shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setExplorerViewMode('CARDS')}
                                        className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${explorerViewMode === 'CARDS' ? 'bg-gradient-to-r from-primary-500 to-indigo-600 text-white shadow-md shadow-primary-500/20' : 'text-text-muted hover:text-text-primary hover:bg-surface/60'}`}
                                    >
                                        <LayoutGrid size={12} />
                                        <span>Daftar Ruangan</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setExplorerViewMode('MATRIX')}
                                        className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${explorerViewMode === 'MATRIX' ? 'bg-gradient-to-r from-primary-500 to-indigo-600 text-white shadow-md shadow-primary-500/20' : 'text-text-muted hover:text-text-primary hover:bg-surface/60'}`}
                                    >
                                        <Calendar size={12} />
                                        <span>Jadwal Mingguan</span>
                                    </button>
                                </div>

                                <div className="flex items-center gap-0.5 bg-card p-1 border border-border rounded-xl shadow-sm">
                                    <button
                                        onClick={() => setExplorerWeekOffset(prev => prev - 1)}
                                        className="px-2.5 py-1.5 text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-all"
                                    >
                                        <ArrowLeft size={14} />
                                    </button>
                                    <span className="text-[11px] font-bold text-text-primary px-2 select-none min-w-[90px] text-center">
                                        {explorerWeekOffset === 0 ? 'Minggu Ini' : explorerWeekOffset === 1 ? 'Minggu Depan' : `+${explorerWeekOffset} Minggu`}
                                    </span>
                                    <button
                                        onClick={() => setExplorerWeekOffset(prev => prev + 1)}
                                        className="px-2.5 py-1.5 text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-all"
                                    >
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 bg-background">
                            {(explorerViewMode === 'CARDS' ? loadingExplorer : loadingMatrix) ? (
                                explorerViewMode === 'CARDS' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {[1, 2, 3, 4, 5, 6].map(i => (
                                            <div key={i} className="p-5 rounded-2xl border border-border bg-card animate-pulse space-y-3">
                                                <div className="h-5 bg-surface rounded-lg w-2/3" />
                                                <div className="h-4 bg-surface rounded-lg w-1/2" />
                                                <div className="h-4 bg-surface rounded-lg w-3/4" />
                                                <div className="h-9 bg-surface rounded-xl w-full mt-4" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-center py-16 gap-3">
                                            <div className="relative">
                                                <Loader2 size={28} className="animate-spin text-primary-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text-primary">Memuat Jadwal Mingguan...</p>
                                                <p className="text-xs text-text-muted mt-0.5">Memeriksa ketersediaan untuk setiap sesi</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ) : explorerViewMode === 'CARDS' ? (
                                <>
                                    {/* Count header */}
                                    <div className="flex items-center justify-between mb-5">
                                        <p className="text-xs font-semibold text-text-secondary">
                                            Ditemukan <span className="text-success font-bold text-sm">{explorerAvailableRooms.length}</span> ruangan tersedia
                                        </p>
                                        <button
                                            type="button"
                                            onClick={fetchExplorerRooms}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-500/5"
                                        >
                                            <RefreshCw size={12} />
                                            Refresh
                                        </button>
                                    </div>

                                    {explorerAvailableRooms.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {explorerAvailableRooms.map(room => (
                                                <div
                                                    key={room.id}
                                                    className="p-5 rounded-2xl border-2 border-border/60 bg-card hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 flex flex-col justify-between group"
                                                >
                                                    <div>
                                                        <div className="flex items-start justify-between">
                                                            <h4 className="text-sm font-bold text-text-primary group-hover:text-primary-500 transition-colors">{room.code}</h4>
                                                            <div className="flex items-center gap-1.5">
                                                                {room.is_recommended && (
                                                                    <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500/15 to-amber-500/10 text-yellow-600 text-[8px] font-bold uppercase tracking-wider rounded-full flex items-center gap-0.5 border border-yellow-500/20">
                                                                        <Star size={8} className="fill-yellow-500" />
                                                                        Cocok
                                                                    </span>
                                                                )}
                                                                <span className="px-2 py-0.5 bg-success/10 text-success text-[9px] font-bold uppercase tracking-wider rounded-full border border-success/15">
                                                                    Tersedia
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs font-semibold text-text-secondary mt-1.5">{room.name}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {room.capacity && (
                                                                <span className="text-[10px] text-text-muted px-2 py-0.5 bg-surface rounded-full border border-border/50 font-medium">
                                                                    {room.capacity} kursi
                                                                </span>
                                                            )}
                                                            {room.building && (
                                                                <span className="text-[10px] text-text-muted font-medium">{room.building}</span>
                                                            )}
                                                            {room.type && (
                                                                <span className="text-[10px] text-text-muted capitalize font-medium">{room.type.toLowerCase()}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const isFriday = explorerDay === 'JUMAT';
                                                            const times = isFriday ? SESSION_TIMES_JUMAT : SESSION_TIMES_NORMAL;
                                                            const endSesi = explorerSessionStart + duration - 1;
                                                            setForm(f => ({
                                                                ...f,
                                                                proposed_day: explorerDay,
                                                                proposed_room_id: String(room.id),
                                                                proposed_start_time: times[explorerSessionStart]?.start || '',
                                                                proposed_end_time: times[endSesi]?.end || '',
                                                            }));
                                                            setMode('MANUAL');
                                                            setManualCheckResult({
                                                                available: true,
                                                                message: `Slot ${formatDayName(explorerDay)} Sesi ${explorerSessionStart}${duration > 1 ? `-${endSesi}` : ''} di ${room.code} tersedia.`,
                                                            });
                                                            setIsExplorerOpen(false);
                                                        }}
                                                        className="w-full mt-4 py-2.5 px-4 bg-gradient-to-r from-primary-500 to-indigo-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary-500/15 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
                                                    >
                                                        <Check size={12} />
                                                        <span>Gunakan Ruangan Ini</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-16 px-6 flex flex-col items-center text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
                                                <Building size={28} className="text-text-muted/40" />
                                            </div>
                                            <p className="text-sm font-bold text-text-primary">Tidak ada ruangan tersedia</p>
                                            <p className="text-xs text-text-secondary mt-1.5 max-w-sm leading-relaxed">
                                                Semua ruangan sudah terpakai pada {formatDayName(explorerDay)} Sesi {explorerSessionStart}. Coba ubah hari atau sesi di filter di atas.
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* MATRIX view — server-side data */
                                <div className="overflow-x-auto rounded-2xl border border-border/50 shadow-sm">
                                    <table className="w-full border-collapse min-w-[750px]">
                                        <thead>
                                            <tr>
                                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-text-muted bg-surface/60 text-left w-[110px] sticky left-0 z-10 border-b border-r border-border/40">
                                                    Sesi
                                                </th>
                                                {['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'].map((day, idx) => {
                                                    const dateObj = getWeekDate(idx, explorerWeekOffset);
                                                    const dayLabel = formatDayName(day);
                                                    const dateStr = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
                                                    const isToday = new Date().toDateString() === dateObj.toDateString();
                                                    return (
                                                        <th key={day} className={`p-3 text-center border-b border-border/40 ${isToday ? 'bg-primary-500/[0.06]' : 'bg-surface/40'}`}>
                                                            <div className={`text-[11px] font-bold uppercase tracking-wide ${isToday ? 'text-primary-500' : 'text-text-primary'}`}>{dayLabel}</div>
                                                            <div className={`text-[10px] font-medium mt-0.5 ${isToday ? 'text-primary-500/70' : 'text-text-muted'}`}>{dateStr}</div>
                                                            {isToday && <div className="w-1 h-1 rounded-full bg-primary-500 mx-auto mt-1 animate-pulse" />}
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.from({ length: 11 }, (_, sIdx) => {
                                                const sessionNum = sIdx + 1;
                                                const isEvenRow = sIdx % 2 === 0;
                                                return (
                                                    <tr key={sessionNum} className={`border-b border-border/30 transition-colors hover:bg-surface/30 ${isEvenRow ? 'bg-surface/[0.03]' : ''}`}>
                                                        <td className="p-3 text-xs font-semibold text-text-secondary sticky left-0 z-10 bg-card border-r border-border/30">
                                                            <div className="font-bold text-text-primary">Sesi {sessionNum}</div>
                                                            <div className="text-[10px] text-text-muted font-normal mt-0.5">
                                                                {SESSION_TIMES_NORMAL[sessionNum].start} - {SESSION_TIMES_NORMAL[sessionNum].end}
                                                            </div>
                                                        </td>

                                                        {['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'].map((day, dayIdx) => {
                                                            const daySessions = matrixData[day] || [];
                                                            const sessionData = daySessions.find(s => s.session === sessionNum);
                                                            const occupied = sessionData?.is_occupied;
                                                            const reason = sessionData?.reason || '';
                                                            const conflictWarning = sessionData?.conflict || '';
                                                            const isToday = new Date().toDateString() === getWeekDate(dayIdx, explorerWeekOffset).toDateString();

                                                            // Parse occupant name from reason like "Course Name (Class)"
                                                            let courseName = reason;
                                                            let className = '';
                                                            if (reason) {
                                                                const match = reason.match(/^(.+?)\s*\((.+?)\)(\s*\[Override\])?$/);
                                                                if (match) {
                                                                    courseName = match[1].trim();
                                                                    className = match[2].trim();
                                                                }
                                                            }

                                                            return (
                                                                <td key={day} className={`p-1.5 text-center ${isToday ? 'bg-primary-500/[0.02]' : ''}`}>
                                                                    {occupied ? (
                                                                        <div className="p-2.5 bg-gradient-to-br from-red-500/[0.08] to-rose-500/[0.05] border border-red-500/15 rounded-xl text-[10px] leading-snug hover:from-red-500/[0.12] hover:to-rose-500/[0.08] transition-all cursor-default">
                                                                            <div className="font-bold text-red-500/90 truncate max-w-[120px] mx-auto" title={courseName}>
                                                                                {courseName}
                                                                            </div>
                                                                            {className && (
                                                                                <div className="text-[8px] text-red-400/70 font-medium mt-0.5">{className}</div>
                                                                            )}
                                                                        </div>
                                                                    ) : conflictWarning ? (
                                                                        <div className="p-2.5 bg-gradient-to-br from-amber-500/[0.08] to-yellow-500/[0.04] border border-amber-500/15 rounded-xl text-[10px] leading-snug hover:from-amber-500/[0.12] hover:to-yellow-500/[0.08] transition-all cursor-default" title={conflictWarning}>
                                                                            <div className="font-bold text-amber-600/80">⚠ Konflik</div>
                                                                            <div className="text-[8px] text-amber-500/70 font-medium mt-0.5 truncate max-w-[120px] mx-auto">{conflictWarning}</div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="p-2.5 bg-gradient-to-br from-emerald-500/[0.06] to-green-500/[0.03] border border-emerald-500/10 rounded-xl text-[10px] font-bold text-emerald-600/80 hover:from-emerald-500/[0.1] hover:to-green-500/[0.06] hover:border-emerald-500/20 transition-all cursor-default">
                                                                            Tersedia
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {/* Legend */}
                                    <div className="flex items-center gap-6 px-5 py-3 border-t border-border/30 bg-surface/20">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-[4px] bg-gradient-to-br from-emerald-500/30 to-green-500/20 border border-emerald-500/20" />
                                            <span className="text-[10px] text-text-muted font-medium">Tersedia</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-[4px] bg-gradient-to-br from-red-500/30 to-rose-500/20 border border-red-500/20" />
                                            <span className="text-[10px] text-text-muted font-medium">Terpakai</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-[4px] bg-gradient-to-br from-amber-500/30 to-yellow-500/20 border border-amber-500/20" />
                                            <span className="text-[10px] text-text-muted font-medium">Konflik Dosen/Kelas</span>
                                        </div>
                                        <div className="flex items-center gap-2 ml-auto">
                                            <span className="text-[10px] text-text-muted">Ruangan:</span>
                                            <span className="text-[10px] text-text-primary font-bold">{rooms.find(r => String(r.id) === String(explorerRoomId))?.code || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-4 border-t border-border/40 bg-surface/20 flex justify-end">
                            <button
                                onClick={() => setIsExplorerOpen(false)}
                                className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-indigo-600 hover:opacity-90 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-primary-500/15"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════ Request History List (Polished) ══════════ */}
            <section className="mt-8">
                <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Layers size={18} className="text-primary-500" />
                    Riwayat Request ({requests.length})
                </h2>
                <div className="space-y-3">
                    {requests.map(req => {
                        const st = STATUS_STYLES[req.status] || STATUS_STYLES.PENDING_ASLAB;
                        const StIcon = st.icon;
                        const expanded = expandedId === req.id;
                        return (
                            <div key={req.id} className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:shadow-sm">
                                <button onClick={() => setExpandedId(expanded ? null : req.id)} className="w-full px-5 py-4 flex items-center gap-4 text-left">
                                    <div className={`w-10 h-10 rounded-xl ${st.bg} flex items-center justify-center shrink-0`}>
                                        <StIcon size={18} className={st.text} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-bold text-text-primary">{req.request_code}</span>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${req.request_type === 'TEMPORARY' ? 'bg-cyan-100 text-cyan-700' : 'bg-warning/10 text-warning'}`}>{req.request_type}</span>
                                        </div>
                                        <p className="text-sm text-text-secondary truncate">
                                            {req.schedule?.course?.name || 'N/A'}{' '}
                                            {req.schedule && (
                                                <span className="text-[11px] text-text-muted font-medium">
                                                    ({req.schedule.day_of_week}, Sesi {req.schedule.session_start}
                                                    {req.schedule.session_duration > 1 ? ` - ${req.schedule.session_start + req.schedule.session_duration - 1}` : ''})
                                                </span>
                                            )}{' '}
                                            — {req.schedule?.room?.code || ''}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${st.bg} ${st.text}`}>{st.label}</span>
                                    {expanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                                </button>
                                {expanded && (
                                    <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                            <div><span className="text-text-muted block mb-0.5">{req.request_type === 'TEMPORARY' ? 'Tanggal Pertemuan' : 'Berlaku Mulai'}</span><span className="font-semibold text-text-primary">{req.target_date ? formatDateIndo(req.target_date) : req.effective_from_date ? formatDateIndo(req.effective_from_date) : '-'}</span></div>
                                            <div><span className="text-text-muted block mb-0.5">Hari Usulan</span><span className="font-semibold text-text-primary">{req.proposed_day || '-'}</span></div>
                                            <div>
                                                <span className="text-text-muted block mb-0.5">Sesi Usulan</span>
                                                <span className="font-semibold text-text-primary">
                                                    {formatTimesToSessions(req.proposed_day, req.proposed_start_time, req.proposed_end_time)}
                                                </span>
                                            </div>
                                            <div><span className="text-text-muted block mb-0.5">Ruangan Usulan</span><span className="font-semibold text-text-primary">{req.proposed_room?.code || '-'}</span></div>
                                        </div>
                                        <div><span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">Alasan</span><p className="text-sm text-text-secondary leading-normal">{req.reason}</p></div>
                                        {req.has_conflict && (
                                            <div className="bg-danger/5 border border-danger/20 rounded-lg px-3 py-2 flex items-center gap-2">
                                                <AlertTriangle size={14} className="text-danger shrink-0" />
                                                <p className="text-xs text-danger font-medium">Terdeteksi konflik jadwal pada slot yang diusulkan</p>
                                            </div>
                                        )}
                                        {req.approvals?.length > 0 && (
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2">Pipeline Validasi</span>
                                                <div className="space-y-2">
                                                    {req.approvals.map((a, i) => (
                                                        <div key={i} className="flex items-start gap-3 text-xs">
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${a.decision.includes('REJECTED') ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                                                                {a.decision.includes('REJECTED') ? <XCircle size={12} /> : <CheckCircle size={12} />}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-text-primary">{a.stage} — {a.decision}</p>
                                                                <p className="text-text-muted">{a.actor?.name} • {a.notes}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </>
    );
}

Requests.layout = (page) => <MahasiswaLayout>{page}</MahasiswaLayout>;
