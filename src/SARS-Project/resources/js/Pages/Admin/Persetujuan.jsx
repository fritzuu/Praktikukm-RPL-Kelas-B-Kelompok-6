import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import AdminInsightCards from '../../Components/Admin/AdminInsightCards';
import ApprovalQueue from '../../Components/Admin/ApprovalQueue';
import ActivityTable from '../../Components/Shared/ActivityTable';
import { CheckCircle, History } from 'lucide-react';
import {
    MOCK_INSIGHTS,
    MOCK_ADMIN_PENDING,
    MOCK_ADMIN_RECENT,
} from '../../data/mockData';

const DECISION_STYLES = {
    APPROVED: 'bg-success/10 text-success',
    REJECTED_ADMIN: 'bg-danger/10 text-danger',
};

const DECISION_LABELS = {
    APPROVED: 'Disetujui',
    REJECTED_ADMIN: 'Ditolak',
};

const TYPE_LABELS = {
    TEMPORARY: 'Sementara',
    PERMANENT: 'Permanen',
};

const HISTORY_COLUMNS = [
    {
        key: 'student',
        header: 'Mahasiswa',
        cell: (item) => (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-xs font-bold shrink-0">
                    {item.student?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                    <span className="font-medium text-text-primary text-sm block truncate">{item.student}</span>
                    <span className="text-[11px] text-text-muted">{item.requestCode}</span>
                </div>
            </div>
        ),
    },
    {
        key: 'course',
        header: 'Mata Kuliah',
        cell: (item) => (
            <span className="text-sm text-text-secondary">{item.course}</span>
        ),
    },
    {
        key: 'requestType',
        header: 'Tipe',
        cell: (item) => (
            <span className="text-[10px] font-bold bg-warning/10 text-warning px-2 py-0.5 rounded-md uppercase">
                {TYPE_LABELS[item.requestType] || item.requestType}
            </span>
        ),
    },
    {
        key: 'decision',
        header: 'Keputusan',
        cell: (item) => (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${DECISION_STYLES[item.decision] || 'bg-surface text-text-muted'}`}>
                {DECISION_LABELS[item.decision] || item.decision}
            </span>
        ),
    },
    {
        key: 'notes',
        header: 'Catatan',
        cell: (item) => (
            <span className="text-sm text-text-muted max-w-[200px] truncate block">
                {item.notes || '—'}
            </span>
        ),
    },
    {
        key: 'decidedAt',
        header: 'Tanggal',
        cell: (item) => (
            <span className="text-text-muted text-sm whitespace-nowrap">{item.decidedAt}</span>
        ),
    },
];

/**
 * Admin Persetujuan (Approval) Page
 *
 * Final decision gate in the 3-stage validation pipeline:
 *   Student → Aslab (forward/reject) → **Admin (approve/reject)**
 *
 * Props (from Inertia):
 *   - pending:  array of PENDING_ADMIN change requests
 *   - recent:   array of recently decided requests (history)
 *   - insights: stats object for AdminInsightCards
 */
export default function Persetujuan({
    pending = MOCK_ADMIN_PENDING,
    recent = MOCK_ADMIN_RECENT,
    insights = MOCK_INSIGHTS,
    flash = {},
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const handleApprove = (id, notes) => {
        router.post(route('admin.persetujuan.approve', id), { notes }, {
            preserveScroll: true,
        });
    };

    const handleReject = (id, notes) => {
        router.post(route('admin.persetujuan.reject', id), { notes }, {
            preserveScroll: true,
        });
    };

    return (
        <div className="space-y-6">
            {/* ── Page Header ──────────────────────────────────────── */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                    Persetujuan Pengajuan
                </h1>
                <p className="text-text-secondary mt-1 text-sm">
                    Tinjau dan putuskan pengajuan perubahan jadwal yang telah divalidasi oleh Asisten Lab.
                </p>
            </div>

            {/* ── Insight Stats (reused from dashboard) ─────────── */}
            <AdminInsightCards insights={insights} />

            {/* ── Pending Approval Queue ────────────────────────── */}
            <ApprovalQueue
                pending={pending}
                onApprove={handleApprove}
                onReject={handleReject}
            />

            {/* ── Decision History ──────────────────────────────── */}
            {recent.length > 0 && (
                <ActivityTable
                    title="Riwayat Keputusan"
                    items={recent}
                    columns={HISTORY_COLUMNS}
                    actions={
                        <div className="flex items-center gap-2">
                            <History size={14} className="text-text-muted" />
                            <span className="text-xs text-text-muted">{recent.length} keputusan terakhir</span>
                        </div>
                    }
                />
            )}
        </div>
    );
}

// Inertia persistent layout — sidebar & topbar remain during navigation
Persetujuan.layout = (page) => <AdminLayout>{page}</AdminLayout>;
