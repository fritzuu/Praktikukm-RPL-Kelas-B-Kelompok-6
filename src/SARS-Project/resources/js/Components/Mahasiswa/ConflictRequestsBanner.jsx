import { useState } from 'react';
import { router } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_LABELS = {
    TEMPORARY: 'Sementara',
    PERMANENT: 'Permanen',
};

const STATUS_LABELS = {
    PENDING_ASLAB: 'Menunggu Aslab',
    PENDING_ADMIN: 'Menunggu Admin',
};

/**
 * ConflictRequestsBanner — shown on Mahasiswa dashboard when they have
 * pending requests that the system detected as having a slot conflict.
 *
 * Props:
 *   conflictRequests  {array}  — from MahasiswaController::dashboard()
 *                                [{id, request_code, course_name, request_type, status}]
 */
export default function ConflictRequestsBanner({ conflictRequests = [] }) {
    const [dismissed, setDismissed] = useState(false);

    if (!conflictRequests.length || dismissed) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-warning/5 border border-warning/30 rounded-xl overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-warning/20">
                <div className="flex items-start gap-3">
                    <div className="relative shrink-0 mt-0.5">
                        <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center">
                            <AlertTriangle size={18} className="text-warning" />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-60" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-warning" />
                        </span>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-text-primary">
                            {conflictRequests.length === 1
                                ? '1 Pengajuan Terdeteksi Konflik'
                                : `${conflictRequests.length} Pengajuan Terdeteksi Konflik`}
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">
                            Slot waktu yang diajukan bertabrakan dengan jadwal lain. Admin atau Aslab akan mempertimbangkan saat memvalidasi.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="p-1.5 rounded-lg hover:bg-warning/10 text-text-muted hover:text-warning transition-colors shrink-0"
                    aria-label="Tutup"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Request list */}
            <div className="divide-y divide-border/50">
                {conflictRequests.map(req => (
                    <div key={req.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-text-primary truncate">
                                    {req.course_name}
                                </p>
                                <p className="text-[11px] text-text-muted">
                                    {req.request_code}
                                    {' · '}
                                    <span className="text-warning font-medium">
                                        {TYPE_LABELS[req.request_type] ?? req.request_type}
                                    </span>
                                    {' · '}
                                    {STATUS_LABELS[req.status] ?? req.status}
                                </p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold bg-warning/10 text-warning border border-warning/20 px-2 py-0.5 rounded-md uppercase shrink-0">
                            Konflik
                        </span>
                    </div>
                ))}
            </div>

            {/* Footer CTA */}
            <div className="px-5 py-3 border-t border-warning/20 flex justify-end">
                <button
                    onClick={() => {
                        try { router.get(route('mahasiswa.requests')); } catch { window.location.href = '/mahasiswa/requests'; }
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors group"
                >
                    Lihat semua pengajuan
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
}
