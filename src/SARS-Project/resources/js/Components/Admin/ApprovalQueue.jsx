import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../Modal';
import {
    ClipboardCheck,
    CheckCircle,
    XCircle,
    User,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Calendar,
    Clock,
    MapPin,
    FileText,
    ShieldCheck,
    ArrowRight,
    ArrowDown,
} from 'lucide-react';

/**
 * ApprovalQueue — Admin approval card list
 *
 * Displays PENDING_ADMIN change requests as expandable cards.
 * Each card shows:
 *   - Collapsed: student info, course badge, request type, conflict indicator
 *   - Expanded:  full details (Task 3), diff view (Task 4), action buttons (Task 5)
 *
 * Props:
 *   pending:   array of pending request objects
 *   onApprove: (id, notes) => void
 *   onReject:  (id, notes) => void
 */
export default function ApprovalQueue({ pending = [], onApprove, onReject }) {
    const [expandedId, setExpandedId] = useState(null);
    const [approveTarget, setApproveTarget] = useState(null);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [approveNotes, setApproveNotes] = useState('');
    const [rejectNotes, setRejectNotes] = useState('');

    const handleConfirmApprove = () => {
        if (onApprove && approveTarget) {
            onApprove(approveTarget.id, approveNotes);
        }
        setApproveTarget(null);
        setApproveNotes('');
    };

    const handleConfirmReject = () => {
        if (onReject && rejectTarget && rejectNotes.trim().length >= 5) {
            onReject(rejectTarget.id, rejectNotes);
        }
        setRejectTarget(null);
        setRejectNotes('');
    };

    const closeApproveModal = () => {
        setApproveTarget(null);
        setApproveNotes('');
    };

    const closeRejectModal = () => {
        setRejectTarget(null);
        setRejectNotes('');
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const REQUEST_TYPE_LABEL = {
        TEMPORARY: 'Sementara',
        PERMANENT: 'Permanen',
        RESCHEDULE: 'Reschedule',
        EXCHANGE: 'Tukar Jadwal',
        MAKEUP: 'Kelas Pengganti',
    };

    const REQUEST_TYPE_STYLE = {
        TEMPORARY: 'bg-warning/10 text-warning',
        PERMANENT: 'bg-primary-500/10 text-primary-500',
    };

    return (
        <>
        <div className="space-y-8">
            {/* ── Section Header ──────────────────────────────────── */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                        <ClipboardCheck size={22} className="text-warning" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary tracking-tight">
                            Antrian Persetujuan
                        </h2>
                        <p className="text-sm text-text-muted">
                            {pending.length > 0
                                ? `${pending.length} pengajuan menunggu keputusan Anda`
                                : 'Semua pengajuan sudah diputuskan'}
                        </p>
                    </div>
                    {pending.length > 0 && (
                        <span className="ml-auto bg-warning text-white text-xs font-bold px-3 py-1 rounded-full">
                            {pending.length} PENDING
                        </span>
                    )}
                </div>

                {/* ── Empty State ────────────────────────────────────── */}
                {pending.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl p-12 text-center">
                        <CheckCircle size={48} className="text-success mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-text-primary">Semua Telah Diputuskan</h3>
                        <p className="text-text-muted text-sm mt-1">
                            Tidak ada pengajuan yang menunggu persetujuan saat ini.
                        </p>
                    </div>
                ) : (
                    /* ── Card List ────────────────────────────────────── */
                    <div className="space-y-4">
                        {pending.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
                                className={`bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all ${item.hasConflict
                                        ? 'border-danger/40'
                                        : 'border-border'
                                    }`}
                            >
                                {/* ── Card Header (Collapsed) ──────────────── */}
                                <div
                                    onClick={() => toggleExpand(item.id)}
                                    className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-surface/30 transition-colors"
                                >
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold text-sm shrink-0">
                                        {item.requester?.name?.charAt(0)?.toUpperCase() || <User size={20} />}
                                    </div>

                                    {/* Student info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="text-sm font-bold text-text-primary truncate">
                                                {item.requester.name}
                                            </h3>
                                            <span className="text-[10px] font-bold bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-md uppercase shrink-0">
                                                {item.schedule.code}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-muted">
                                            NIM: {item.requester.nimNip} • {item.createdAtDiff}
                                        </p>
                                    </div>

                                    {/* Right side badges */}
                                    <div className="flex items-center gap-2.5 shrink-0">
                                        {/* Conflict indicator */}
                                        {item.hasConflict && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold bg-danger/10 text-danger px-2.5 py-1 rounded-md uppercase">
                                                <AlertTriangle size={12} />
                                                Konflik
                                            </span>
                                        )}

                                        {/* Request type badge */}
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase ${REQUEST_TYPE_STYLE[item.requestType] || 'bg-warning/10 text-warning'
                                            }`}>
                                            {REQUEST_TYPE_LABEL[item.requestType] || item.requestType}
                                        </span>

                                        {/* Expand chevron */}
                                        {expandedId === item.id ? (
                                            <ChevronUp size={18} className="text-text-muted" />
                                        ) : (
                                            <ChevronDown size={18} className="text-text-muted" />
                                        )}
                                    </div>
                                </div>

                                {/* ── Expanded Details ─────────────────────── */}
                                <AnimatePresence initial={false}>
                                {expandedId === item.id && (
                                    <motion.div
                                        key="expanded"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                    <div className="px-6 pb-6 pt-2 border-t border-border space-y-5">
                                        {/* ── Side-by-Side Visual Diff ──────── */}
                                        <div className="bg-surface/30 border border-border/50 rounded-xl p-4">
                                            {/* Diff Header */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Perbandingan Jadwal</span>
                                                <span className="text-[10px] font-bold bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-md uppercase">
                                                    {item.requestCode}
                                                </span>
                                                {item.targetDate && (
                                                    <span className="text-[10px] text-text-muted">
                                                        • Tanggal: {item.targetDate}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Diff Columns */}
                                            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
                                                {/* Left — Current Schedule */}
                                                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Jadwal Saat Ini</span>
                                                    <div className="space-y-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={13} className="text-text-muted shrink-0" />
                                                            <span className={`text-sm ${item.schedule.day !== item.proposedDay
                                                                    ? 'text-text-muted line-through'
                                                                    : 'text-text-primary font-medium'
                                                                }`}>
                                                                {item.schedule.day}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={13} className="text-text-muted shrink-0" />
                                                            <span className={`text-sm ${item.schedule.time !== item.proposedTime
                                                                    ? 'text-text-muted line-through'
                                                                    : 'text-text-primary font-medium'
                                                                }`}>
                                                                {item.schedule.time}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={13} className="text-text-muted shrink-0" />
                                                            <span className={`text-sm ${item.schedule.room !== (item.proposedRoom || item.schedule.room)
                                                                    ? 'text-text-muted line-through'
                                                                    : 'text-text-primary font-medium'
                                                                }`}>
                                                                {item.schedule.room}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Arrow */}
                                                <div className="hidden md:flex items-center justify-center">
                                                    <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center">
                                                        <ArrowRight size={16} className="text-primary-500" />
                                                    </div>
                                                </div>
                                                <div className="flex md:hidden items-center justify-center -my-1">
                                                    <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center">
                                                        <ArrowDown size={16} className="text-primary-500" />
                                                    </div>
                                                </div>

                                                {/* Right — Proposed Change */}
                                                <div className="bg-primary-500/[0.03] border border-primary-500/15 rounded-xl p-4 space-y-3">
                                                    <span className="text-[10px] font-bold text-primary-500 uppercase tracking-wider">Perubahan Diusulkan</span>
                                                    <div className="space-y-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={13} className="text-primary-500/60 shrink-0" />
                                                            <span className={`text-sm ${item.schedule.day !== item.proposedDay
                                                                    ? 'text-primary-500 font-bold'
                                                                    : 'text-text-primary font-medium'
                                                                }`}>
                                                                {item.proposedDay}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={13} className="text-primary-500/60 shrink-0" />
                                                            <span className={`text-sm ${item.schedule.time !== item.proposedTime
                                                                    ? 'text-primary-500 font-bold'
                                                                    : 'text-text-primary font-medium'
                                                                }`}>
                                                                {item.proposedTime}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={13} className="text-primary-500/60 shrink-0" />
                                                            <span className={`text-sm ${item.schedule.room !== (item.proposedRoom || item.schedule.room)
                                                                    ? 'text-primary-500 font-bold'
                                                                    : 'text-text-primary font-medium'
                                                                }`}>
                                                                {item.proposedRoom || item.schedule.room}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Course context */}
                                            <p className="text-[11px] text-text-muted mt-3">
                                                Mata Kuliah: <span className="font-semibold text-text-secondary">{item.schedule.course}</span> ({item.schedule.code})
                                            </p>
                                        </div>

                                        {/* ── Alasan Mahasiswa ────────────────── */}
                                        <div className="bg-primary-500/[0.03] border border-primary-500/10 rounded-xl p-5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText size={14} className="text-primary-500" />
                                                <span className="text-[10px] font-bold text-primary-500 uppercase tracking-wider">Alasan Pengajuan</span>
                                            </div>
                                            <p className="text-sm text-text-secondary leading-relaxed italic">
                                                "{item.reason}"
                                            </p>
                                        </div>

                                        {/* ── Catatan Validasi Aslab ─────────── */}
                                        {item.aslabValidation && (
                                            <div className="bg-indigo-500/[0.04] border border-indigo-500/10 rounded-xl p-5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <ShieldCheck size={14} className="text-indigo-500" />
                                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Catatan Validasi Aslab</span>
                                                </div>
                                                <p className="text-sm text-text-secondary leading-relaxed">
                                                    {item.aslabValidation.notes}
                                                </p>
                                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-indigo-500/10">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-[10px] font-bold shrink-0">
                                                        {item.aslabValidation.validatedBy?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <p className="text-xs text-text-muted">
                                                        <span className="font-semibold text-text-secondary">{item.aslabValidation.validatedBy}</span>
                                                        {' '}• {item.aslabValidation.validatedAt}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Conflict Alert ─────────────────── */}
                                        {item.hasConflict && item.conflictDetails && (
                                            <div className="bg-danger/[0.05] border border-danger/20 rounded-xl p-5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <AlertTriangle size={14} className="text-danger" />
                                                    <span className="text-[10px] font-bold text-danger uppercase tracking-wider">Konflik Terdeteksi</span>
                                                </div>
                                                <p className="text-sm text-danger/80 leading-relaxed">
                                                    {item.conflictDetails}
                                                </p>
                                            </div>
                                        )}

                                        {/* ── Action Buttons ─────────────────── */}
                                        <div className="flex items-center gap-3 pt-2">
                                            <button
                                                onClick={() => setRejectTarget(item)}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-text-secondary text-sm font-bold rounded-xl hover:bg-danger/5 hover:border-danger/30 hover:text-danger transition-all"
                                            >
                                                <XCircle size={16} />
                                                Tolak
                                            </button>
                                            <button
                                                onClick={() => setApproveTarget(item)}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                                            >
                                                <CheckCircle size={16} />
                                                Setujui
                                            </button>
                                        </div>
                                    </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* ── Approval Confirmation Modal ──────────────────────── */}
        <Modal
            isOpen={!!approveTarget}
            onClose={closeApproveModal}
            title="Setujui Pengajuan"
            maxWidth="md"
        >
            {approveTarget && (
                <div className="space-y-5">
                    <div className="bg-emerald-500/[0.05] border border-emerald-500/15 rounded-xl p-4">
                        <p className="text-sm text-text-secondary">
                            Anda akan <span className="font-bold text-emerald-600">menyetujui</span> pengajuan dari:
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                            <div className="w-9 h-9 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold text-sm">
                                {approveTarget.requester?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-text-primary">{approveTarget.requester.name}</p>
                                <p className="text-xs text-text-muted">
                                    {approveTarget.schedule.code} — {approveTarget.schedule.course}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">
                            Catatan (Opsional)
                        </label>
                        <textarea
                            value={approveNotes}
                            onChange={(e) => setApproveNotes(e.target.value)}
                            placeholder="Tambahkan catatan persetujuan jika diperlukan..."
                            rows={3}
                            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                        <button
                            onClick={closeApproveModal}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text-primary bg-surface border border-border rounded-xl transition-all"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleConfirmApprove}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                        >
                            <CheckCircle size={16} />
                            Konfirmasi Setujui
                        </button>
                    </div>
                </div>
            )}
        </Modal>

        {/* ── Rejection Confirmation Modal ─────────────────────── */}
        <Modal
            isOpen={!!rejectTarget}
            onClose={closeRejectModal}
            title="Tolak Pengajuan"
            maxWidth="md"
        >
            {rejectTarget && (
                <div className="space-y-5">
                    <div className="bg-danger/[0.05] border border-danger/15 rounded-xl p-4">
                        <p className="text-sm text-text-secondary">
                            Anda akan <span className="font-bold text-danger">menolak</span> pengajuan dari:
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                            <div className="w-9 h-9 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold text-sm">
                                {rejectTarget.requester?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-text-primary">{rejectTarget.requester.name}</p>
                                <p className="text-xs text-text-muted">
                                    {rejectTarget.schedule.code} — {rejectTarget.schedule.course}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">
                            Alasan Penolakan <span className="text-danger">*</span>
                        </label>
                        <textarea
                            value={rejectNotes}
                            onChange={(e) => setRejectNotes(e.target.value)}
                            placeholder="Jelaskan alasan penolakan pengajuan ini (min. 5 karakter)..."
                            rows={3}
                            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-danger/50 transition-all resize-none"
                        />
                        {rejectNotes.length > 0 && rejectNotes.trim().length < 5 && (
                            <p className="text-[11px] text-danger mt-1.5">Minimal 5 karakter diperlukan.</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                        <button
                            onClick={closeRejectModal}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text-primary bg-surface border border-border rounded-xl transition-all"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleConfirmReject}
                            disabled={rejectNotes.trim().length < 5}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-danger text-white text-sm font-bold rounded-xl hover:bg-danger/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <XCircle size={16} />
                            Konfirmasi Tolak
                        </button>
                    </div>
                </div>
            )}
        </Modal>
        </>
    );
}
