import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import MahasiswaLayout from '../../Layouts/MahasiswaLayout';
import {
    Calendar,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    ArrowRight,
    BookOpen,
    DoorOpen,
    AlertCircle,
} from 'lucide-react';
import ScheduleGrid from '../../Components/Shared/ScheduleGrid';
import WelcomeHeader from '../../Components/Shared/WelcomeHeader';
import LiveClockCard from '../../Components/Shared/LiveClockCard';
import SyncStatusCard from '../../Components/Shared/SyncStatusCard';

const HARI_MAP = {
    senin: 'Senin',
    selasa: 'Selasa',
    rabu: 'Rabu',
    kamis: 'Kamis',
    jumat: 'Jumat',
    sabtu: 'Sabtu',
};

const STATUS_STYLES = {
    PENDING_ASLAB: { bg: 'bg-warning/10', text: 'text-warning', label: 'Pending Aslab' },
    PENDING_ADMIN: { bg: 'bg-info/10', text: 'text-info', label: 'Pending Admin' },
    APPROVED: { bg: 'bg-success/10', text: 'text-success', label: 'Disetujui' },
    REJECTED_ASLAB: { bg: 'bg-danger/10', text: 'text-danger', label: 'Ditolak Aslab' },
    REJECTED_ADMIN: { bg: 'bg-danger/10', text: 'text-danger', label: 'Ditolak Admin' },
    CANCELLED: { bg: 'bg-text-muted/10', text: 'text-text-muted', label: 'Dibatalkan' },
};

const TIPE_COLORS = {
    baseline: 'bg-primary-500/10 border-primary-500/30 text-primary-600',
    temp: 'bg-cyan-50 border-cyan-300 text-cyan-700',
    permanent: 'bg-warning/10 border-warning/50 text-amber-800',
};

export default function MahasiswaDashboard({
    stats = { totalRequests: 0, pendingRequests: 0, approvedRequests: 0, rejectedRequests: 0 },
    semester = null,
    recentRequests = [],
    schedules = [],
    rooms = [],
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <>
            {/* ── Welcome Header ───────────────────────────────────── */}
            <WelcomeHeader
                user={user}
                subtitle="Minggu ini dalam satu pandangan."
            >
                <div className="flex items-stretch gap-3 shrink-0">
                    <SyncStatusCard />
                    <LiveClockCard />
                </div>
            </WelcomeHeader>

            {/* ── Stats Cards ──────────────────────────────────────── */}
            <section className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                    <StatCard
                        icon={FileText}
                        label="Total Requests"
                        value={stats.totalRequests}
                        color="text-primary-500"
                        bgColor="bg-primary-500/10"
                    />
                    <StatCard
                        icon={Clock}
                        label="Pending"
                        value={stats.pendingRequests}
                        color="text-warning"
                        bgColor="bg-warning/10"
                    />
                    <StatCard
                        icon={CheckCircle}
                        label="Disetujui"
                        value={stats.approvedRequests}
                        color="text-success"
                        bgColor="bg-success/10"
                    />
                    <StatCard
                        icon={XCircle}
                        label="Ditolak"
                        value={stats.rejectedRequests}
                        color="text-danger"
                        bgColor="bg-danger/10"
                    />
                </div>
            </section>

            {/* ── Weekly Calendar Preview ───────────────────────────── */}
            <div className="mb-6">
                <ScheduleGrid 
                    jadwalItems={schedules} 
                    rooms={rooms}
                />
            </div>

            {/* ── Bottom Section: Request Form ────────── */}
            <div className="w-full">
                <RequestFormPreview schedules={schedules} rooms={rooms} />
            </div>
        </>
    );
}

/* ── Stat Card Component ──────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, bgColor }) {
    return (
        <div className="bg-card border border-border rounded-xl px-5 py-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
                <Icon size={20} className={color} />
            </div>
            <div>
                <p className="text-2xl font-bold text-text-primary">{value}</p>
                <p className="text-[11px] text-text-muted font-medium">{label}</p>
            </div>
        </div>
    );
}

/* ── Request Form Preview Component ───────────────────────────────────────── */
function RequestFormPreview({ schedules = [], rooms = [] }) {
    const [formData, setFormData] = useState({
        nama: '',
        nim: '',
        kelas: '',
        mataKuliah: '',
        ruangan: '',
        reason: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Extract unique courses from schedule
    const uniqueCourses = [...new Map((schedules || []).map(item =>
        [item.kode, item]
    )).values()];

    // Extract unique classes from schedule
    const uniqueClasses = [...new Set((schedules || []).map(item => item.kelas).filter(c => c && c !== '-'))].sort();

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <FileText size={20} className="text-primary-500" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-text-primary">Request Schedule Change</h3>
                    <p className="text-xs text-text-secondary">Please fill in the details below to request a slot modification.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Full Name</label>
                    <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">NIM (Student ID)</label>
                    <input
                        type="text"
                        name="nim"
                        value={formData.nim}
                        onChange={handleChange}
                        placeholder="e.g. 21004567"
                        className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Class</label>
                    <select
                        name="kelas"
                        value={formData.kelas}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                    >
                        <option value="" disabled>Select your class</option>
                        {uniqueClasses.map(cls => (
                            <option key={cls} value={cls}>Kelas {cls}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Mata Kuliah</label>
                    <select
                        name="mataKuliah"
                        value={formData.mataKuliah}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                    >
                        <option value="" disabled>Pilih Mata Kuliah</option>
                        {uniqueCourses.map(course => (
                            <option key={course.kode} value={course.kode}>
                                {course.kode} - {course.nama}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Ruangan Request</label>
                    <select
                        name="ruangan"
                        value={formData.ruangan}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                    >
                        <option value="" disabled>Pilih Ruangan</option>
                        {rooms?.map(room => {
                            const roomCode = typeof room === 'object' && room !== null ? (room.code || room.name) : room;
                            const roomLabel = typeof room === 'object' && room !== null ? (room.name || room.code) : room;
                            return (
                                <option key={typeof room === 'object' && room !== null ? room.id : roomCode} value={roomCode}>
                                    {roomLabel}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            <div className="mb-5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Reason for Request</label>
                <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Explain why you need a schedule change (e.g., laboratory conflict, research duty)..."
                    rows={3}
                    className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                />
            </div>

            <div className="flex items-center gap-3 justify-end">
                <button className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                    Cancel
                </button>
                <button
                    onClick={() => { try { window.location.href = route('mahasiswa.requests'); } catch { } }}
                    className="px-6 py-2.5 bg-danger hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                    Submit Request
                </button>
            </div>
        </div>
    );
}

// Inertia persistent layout
MahasiswaDashboard.layout = (page) => <MahasiswaLayout>{page}</MahasiswaLayout>;