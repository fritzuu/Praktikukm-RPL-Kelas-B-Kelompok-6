import { usePage, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import MahasiswaLayout from '../../Layouts/MahasiswaLayout';
import {
    FileText,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';
import ScheduleGrid from '../../Components/Shared/ScheduleGrid';
import WelcomeHeader from '../../Components/Shared/WelcomeHeader';
import LiveClockCard from '../../Components/Shared/LiveClockCard';
import SyncStatusCard from '../../Components/Shared/SyncStatusCard';
import Modal from '../../Components/Modal';
import EmptyRoomsCard from '../../Components/Mahasiswa/EmptyRoomsCard';
import LiveCampusActivityCard from '../../Components/Mahasiswa/LiveCampusActivityCard';

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

const EMPTY_CAMPUS_WIDGETS = {
    emptyRooms: [],
    stats: { activeSchedules: 0, usedRooms: 0, emptyRooms: 0, totalToday: 0 },
    currentTime: '',
    roomTypes: [],
    hasSemester: false,
    isWeekend: false,
    availabilityStatus: 'no_semester',
    lectureWindow: null,
};

export default function MahasiswaDashboard({
    stats = { totalRequests: 0, pendingRequests: 0, approvedRequests: 0, rejectedRequests: 0 },
    semester = null,
    recentRequests = [],
    schedules = [],
    rooms = [],
    campusWidgets = EMPTY_CAMPUS_WIDGETS,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

        const [selectedSchedule, setSelectedSchedule] = useState(null);

    const [widgetData, setWidgetData] = useState(campusWidgets);
    const [widgetLoading, setWidgetLoading] = useState(false);

    const fetchWidgets = useCallback((showSpinner = true) => {
        if (showSpinner) setWidgetLoading(true);
        fetch(route('mahasiswa.dashboardWidgets'))
            .then(res => res.json())
            .then(data => {
                setWidgetData(data);
                setWidgetLoading(false);
            })
            .catch(() => setWidgetLoading(false));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => fetchWidgets(false), 60000);
        return () => clearInterval(interval);
    }, [fetchWidgets]);

    const handleCardClick = (item) => {
        setSelectedSchedule(item);
    };

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
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden p-6 mb-6">
                <ScheduleGrid
                    jadwalItems={schedules}
                    rooms={rooms}
                    showConflicts={true}
                    onCardClick={handleCardClick}
                />
            </div>

            {/* ── Bottom Section: Dashboard Widgets ────────── */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="w-full lg:w-[65%]">
                    <EmptyRoomsCard
                        rooms={widgetData.emptyRooms ?? []}
                        roomTypes={widgetData.roomTypes ?? []}
                        loading={widgetLoading}
                        hasSemester={widgetData.hasSemester}
                        isWeekend={widgetData.isWeekend}
                        availabilityStatus={widgetData.availabilityStatus ?? 'active'}
                        lectureWindow={widgetData.lectureWindow ?? null}
                        onRefresh={() => fetchWidgets(true)}
                    />
                </div>
                <div className="w-full lg:w-[35%]">
                    <LiveCampusActivityCard
                        stats={widgetData.stats ?? {}}
                        loading={widgetLoading}
                        hasSemester={widgetData.hasSemester}
                        isWeekend={widgetData.isWeekend}
                    />
                </div>
            </div>

            {/* Details Modal */}
            <Modal
                isOpen={!!selectedSchedule}
                onClose={() => setSelectedSchedule(null)}
                title="Detail Jadwal"
                maxWidth="md"
            >
                {selectedSchedule && (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Mata Kuliah</h4>
                            <p className="text-lg font-bold text-text-primary">{selectedSchedule.nama} ({selectedSchedule.kode})</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Kelas</h4>
                                <p className="font-medium text-text-primary">{selectedSchedule.kelas || '-'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Semester</h4>
                                <p className="font-medium text-text-primary">{selectedSchedule.semesterNum || '-'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Ruangan</h4>
                                <p className="font-medium text-text-primary">{selectedSchedule.ruangan}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Hari</h4>
                                <p className="font-medium text-text-primary capitalize">{selectedSchedule.hari}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Waktu</h4>
                                <p className="font-medium text-text-primary">
                                    {selectedSchedule.jamMulai && selectedSchedule.jamAkhir
                                        ? `${selectedSchedule.jamMulai.substring(0, 5)} - ${selectedSchedule.jamAkhir.substring(0, 5)}`
                                        : selectedSchedule.mulai && selectedSchedule.selesai
                                            ? `${selectedSchedule.mulai.substring(0, 5)} - ${selectedSchedule.selesai.substring(0, 5)}`
                                            : 'Waktu belum diatur'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Sesi</h4>
                                <p className="font-medium text-text-primary">
                                    {selectedSchedule.durasi > 1
                                        ? `Sesi ${selectedSchedule.sesiMulai} - ${selectedSchedule.sesiMulai + selectedSchedule.durasi - 1}`
                                        : `Sesi ${selectedSchedule.sesiMulai}`}
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-border flex flex-col gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Dosen Pengajar</h4>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg">
                                        {selectedSchedule.dosen && selectedSchedule.dosen !== '-' ? selectedSchedule.dosen.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <p className="font-semibold text-text-primary">
                                        {!selectedSchedule.dosen || selectedSchedule.dosen === '-' ? 'Belum Ditentukan' : selectedSchedule.dosen}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-2">
                                <button
                                    onClick={() => setSelectedSchedule(null)}
                                    className="flex-1 py-3 bg-surface hover:bg-card border border-border text-text-secondary rounded-xl text-sm font-bold transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
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



// Inertia persistent layout
MahasiswaDashboard.layout = (page) => <MahasiswaLayout>{page}</MahasiswaLayout>;