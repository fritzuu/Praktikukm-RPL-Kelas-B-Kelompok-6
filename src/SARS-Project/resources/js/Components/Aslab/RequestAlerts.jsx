import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    FileText,
    User,
    Calendar,
    Clock,
    MapPin,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    XCircle,
    ArrowRight,
    Inbox,
    AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const REQUEST_TYPE_BADGE = {
    TEMPORARY:  { label: 'Sementara',       style: 'bg-cyan-500/10 text-cyan-600' },
    PERMANENT:  { label: 'Permanen',        style: 'bg-amber-500/10 text-amber-600' },
    RESCHEDULE: { label: 'Reschedule',      style: 'bg-primary-500/10 text-primary-500' },
    EXCHANGE:   { label: 'Tukar Jadwal',    style: 'bg-violet-500/10 text-violet-600' },
    MAKEUP:     { label: 'Kelas Pengganti', style: 'bg-emerald-500/10 text-emerald-600' },
};

export default function RequestAlerts({ requests = [] }) {
    const [expandedId, setExpandedId] = useState(null);

    // No requests = nothing rendered
    if (!requests.length) return null;

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleGoToValidasi = () => {
        try {
            router.visit(route('aslab.validasi'));
        } catch {
            // fallback if route helper unavailable
            window.location.href = '/aslab/validasi';
        }
    };

    return (
        <section className="mb-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                            <FileText size={20} className="text-warning" />
                        </div>
                        {/* Pulse indicator */}
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-warning"></span>
                        </span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-text-primary tracking-tight">
                            Pengajuan Masuk
                        </h2>
                        <p className="text-xs text-text-muted">
                            {requests.length} pengajuan mahasiswa menunggu validasi
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleGoToValidasi}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors group"
                >
                    Lihat Semua
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* Request Cards */}
            <div className="space-y-3">
                <AnimatePresence initial={false}>
                    {requests.map((req, idx) => {
                        const badge = REQUEST_TYPE_BADGE[req.requestType] || REQUEST_TYPE_BADGE.TEMPORARY;
                        const isExpanded = expandedId === req.id;

                        return (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ delay: idx * 0.05, duration: 0.25 }}
                                className="bg-card border border-border rounded-xl overflow-hidden
                                           border-l-4 border-l-warning shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                {/* Card Header — clickable */}
                                <div
                                    onClick={() => toggleExpand(req.id)}
                                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-surface/30 transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-full bg-warning/10 flex items-center justify-center text-warning shrink-0">
                                        <User size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="text-sm font-bold text-text-primary truncate">
                                                {req.requester?.name || 'Mahasiswa'}
                                            </h3>
                                            <span className="text-[10px] font-bold bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-md uppercase shrink-0">
                                                {req.schedule?.code || '-'}
                                            </span>
                                            {req.hasConflict && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold bg-danger/10 text-danger border border-danger/20 px-2 py-0.5 rounded-md uppercase shrink-0">
                                                    <AlertTriangle size={10} />
                                                    Konflik
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-text-muted truncate">
                                            {req.schedule?.course || '-'} • {req.createdAtDiff || 'baru saja'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide ${badge.style}`}>
                                            {badge.label}
                                        </span>
                                        {isExpanded
                                            ? <ChevronUp size={16} className="text-text-muted" />
                                            : <ChevronDown size={16} className="text-text-muted" />
                                        }
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-5 pt-2 border-t border-border space-y-4">
                                                {/* Detail Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div className="bg-surface/50 rounded-xl p-3.5 border border-border/50">
                                                        <div className="flex items-center gap-1.5 mb-1.5">
                                                            <Calendar size={12} className="text-text-muted" />
                                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Hari</span>
                                                        </div>
                                                        <p className="text-sm font-semibold text-text-primary">
                                                            {req.proposedDay || '-'}
                                                        </p>
                                                        {req.targetDate && (
                                                            <p className="text-[11px] text-text-muted mt-0.5">
                                                                {req.targetDate}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="bg-surface/50 rounded-xl p-3.5 border border-border/50">
                                                        <div className="flex items-center gap-1.5 mb-1.5">
                                                            <Clock size={12} className="text-text-muted" />
                                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Waktu</span>
                                                        </div>
                                                        <p className="text-sm font-semibold text-text-primary">
                                                            {req.proposedTime || '-'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-surface/50 rounded-xl p-3.5 border border-border/50">
                                                        <div className="flex items-center gap-1.5 mb-1.5">
                                                            <MapPin size={12} className="text-text-muted" />
                                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Ruangan</span>
                                                        </div>
                                                        <p className="text-sm font-semibold text-text-primary">
                                                            {req.schedule?.room || '-'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Conflict Warning */}
                                                {req.hasConflict && (
                                                    <div className="flex items-start gap-3 bg-danger/5 border border-danger/20 rounded-xl px-4 py-3">
                                                        <AlertTriangle size={15} className="text-danger shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-danger">
                                                                Terdeteksi konflik jadwal pada slot yang diusulkan
                                                            </p>
                                                            <p className="text-xs text-text-secondary mt-0.5">
                                                                Slot waktu atau ruangan yang diminta bertabrakan dengan jadwal lain.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Reason */}
                                                {req.reason && (
                                                    <div className="bg-primary-500/[0.03] border border-primary-500/10 rounded-xl p-4">
                                                        <div className="flex items-center gap-1.5 mb-1.5">
                                                            <FileText size={12} className="text-primary-500" />
                                                            <span className="text-[10px] font-bold text-primary-500 uppercase tracking-wider">Alasan</span>
                                                        </div>
                                                        <p className="text-sm text-text-secondary leading-relaxed italic">
                                                            "{req.reason}"
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Quick Action */}
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleGoToValidasi();
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-xs font-bold rounded-lg
                                                                   shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all"
                                                    >
                                                        <CheckCircle size={14} />
                                                        Proses di Halaman Validasi
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </section>
    );
}
