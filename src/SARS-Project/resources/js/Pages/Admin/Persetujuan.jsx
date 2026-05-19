import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import AdminInsightCards from '../../Components/Admin/AdminInsightCards';
import ApprovalQueue from '../../Components/Admin/ApprovalQueue';
import { CheckCircle } from 'lucide-react';
import {
    MOCK_INSIGHTS,
    MOCK_ADMIN_PENDING,
    MOCK_ADMIN_RECENT,
} from '../../data/mockData';

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
            {/* TODO: Task 6 — Replace with decision history table */}
            {recent.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
                            <CheckCircle size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-text-primary">Riwayat Keputusan</h2>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-6 text-center text-text-muted text-sm">
                        {/* Placeholder for history table — Task 6 */}
                        <p>{recent.length} keputusan terbaru — tabel akan ditambahkan di Task 6.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Inertia persistent layout — sidebar & topbar remain during navigation
Persetujuan.layout = (page) => <AdminLayout>{page}</AdminLayout>;
