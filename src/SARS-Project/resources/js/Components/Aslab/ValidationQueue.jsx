import { useState } from "react";
import {
    ClipboardCheck,
    CheckCircle,
    XCircle,
    User,
    Calendar,
    Clock,
    MapPin,
    FileText,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

export default function ValidationQueue({
    pending = [],
    recent = [],
    onForward,
    onReject,
}) {
    const [expandedId, setExpandedId] = useState(null);
    const [rejectNotes, setRejectNotes] = useState("");
    const [forwardNotes, setForwardNotes] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleForward = (id) => {
        if (onForward) {
            onForward(
                id,
                forwardNotes || "Diteruskan ke Admin untuk keputusan akhir.",
            );
        }
        setForwardNotes("");
    };

    const handleReject = (id) => {
        if (onReject && rejectNotes.trim().length >= 5) {
            onReject(id, rejectNotes);
        }
        setRejectNotes("");
        setShowRejectModal(null);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const REQUEST_TYPE_LABEL = {
        TEMPORARY: "Sementara",
        PERMANENT: "Permanen",
        RESCHEDULE: "Reschedule",
        EXCHANGE: "Tukar Jadwal",
        MAKEUP: "Kelas Pengganti",
    };

    return (
        <div className="space-y-8">
            {/* ── Pending Queue ──────────────────────────────────── */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                        <ClipboardCheck size={22} className="text-warning" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary tracking-tight">
                            Antrian Validasi
                        </h2>
                        <p className="text-sm text-text-muted">
                            {pending.length > 0
                                ? `${pending.length} pengajuan menunggu validasi`
                                : "Semua pengajuan sudah divalidasi"}
                        </p>
                    </div>
                    {pending.length > 0 && (
                        <span className="ml-auto bg-warning text-white text-xs font-bold px-3 py-1 rounded-full">
                            {pending.length} PENDING
                        </span>
                    )}
                </div>

                {pending.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl p-12 text-center">
                        <CheckCircle
                            size={48}
                            className="text-success mx-auto mb-4"
                        />
                        <h3 className="text-lg font-bold text-text-primary">
                            Semua Tervalidasi
                        </h3>
                        <p className="text-text-muted text-sm mt-1">
                            Tidak ada pengajuan yang menunggu validasi saat ini.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pending.map((item) => (
                            <div
                                key={item.id}
                                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                            >
                                {/* Card Header */}
                                <div
                                    onClick={() => toggleExpand(item.id)}
                                    className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-surface/30 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-text-muted shrink-0">
                                        <User size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="text-sm font-bold text-text-primary">
                                                {item.requester.name}
                                            </h3>
                                            <span className="text-[10px] font-bold bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-md uppercase">
                                                {item.schedule.code}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-muted">
                                            NIM: {item.requester.nimNip} •{" "}
                                            {item.createdAtDiff}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-[10px] font-bold bg-warning/10 text-warning px-2.5 py-1 rounded-md uppercase">
                                            {REQUEST_TYPE_LABEL[
                                                item.requestType
                                            ] || item.requestType}
                                        </span>
                                        {expandedId === item.id ? (
                                            <ChevronUp
                                                size={18}
                                                className="text-text-muted"
                                            />
                                        ) : (
                                            <ChevronDown
                                                size={18}
                                                className="text-text-muted"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedId === item.id && (
                                    <div className="px-6 pb-6 pt-2 border-t border-border space-y-5">
                                        {/* Request Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-surface/50 rounded-xl p-4 border border-border/50">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Calendar
                                                        size={14}
                                                        className="text-text-muted"
                                                    />
                                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                        Jadwal Diajukan
                                                    </span>
                                                </div>
                                                {item.targetDate ? (
                                                    <p className="text-sm font-bold text-text-primary capitalize">
                                                        {formatDate(
                                                            item.targetDate,
                                                        )}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm font-semibold text-text-primary">
                                                        {item.proposedDay}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="bg-surface/50 rounded-xl p-4 border border-border/50">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Clock
                                                        size={14}
                                                        className="text-text-muted"
                                                    />
                                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                        Waktu
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-text-primary">
                                                    {item.proposedTime}
                                                </p>
                                            </div>
                                            <div className="bg-surface/50 rounded-xl p-4 border border-border/50">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MapPin
                                                        size={14}
                                                        className="text-text-muted"
                                                    />
                                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                        MK & Ruangan
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-text-primary">
                                                    {item.schedule.course}
                                                </p>
                                                <p className="text-xs text-text-muted mt-0.5">
                                                    Ruangan:{" "}
                                                    {item.schedule.room}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Reason */}
                                        <div className="bg-primary-500/[0.03] border border-primary-500/10 rounded-xl p-5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText
                                                    size={14}
                                                    className="text-primary-500"
                                                />
                                                <span className="text-[10px] font-bold text-primary-500 uppercase tracking-wider">
                                                    Alasan Pengajuan
                                                </span>
                                            </div>
                                            <p className="text-sm text-text-secondary leading-relaxed italic">
                                                "{item.reason}"
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 pt-2">
                                            {showRejectModal === item.id ? (
                                                <div className="flex-1 flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={rejectNotes}
                                                        onChange={(e) =>
                                                            setRejectNotes(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Alasan penolakan (min. 5 karakter)..."
                                                        className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-danger/50 transition-all"
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            handleReject(
                                                                item.id,
                                                            )
                                                        }
                                                        disabled={
                                                            rejectNotes.trim()
                                                                .length < 5
                                                        }
                                                        className="px-5 py-2.5 bg-danger text-white text-sm font-bold rounded-xl hover:bg-danger/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        Konfirmasi Tolak
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowRejectModal(
                                                                null,
                                                            );
                                                            setRejectNotes("");
                                                        }}
                                                        className="px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            setShowRejectModal(
                                                                item.id,
                                                            )
                                                        }
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-text-secondary text-sm font-bold rounded-xl hover:bg-danger/5 hover:border-danger/30 hover:text-danger transition-all"
                                                    >
                                                        <XCircle size={16} />
                                                        Tolak
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleForward(
                                                                item.id,
                                                            )
                                                        }
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all"
                                                    >
                                                        <CheckCircle
                                                            size={16}
                                                        />
                                                        Validasi & Teruskan
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Recently Validated ─────────────────────────────── */}
            {recent.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
                            <CheckCircle size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-text-primary">
                            Riwayat Validasi
                        </h2>
                    </div>

                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-surface/50 border-b border-border">
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                            Mahasiswa
                                        </th>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                            Mata Kuliah
                                        </th>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                            Ruangan
                                        </th>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                            Keputusan
                                        </th>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                            Waktu
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-border last:border-b-0 hover:bg-surface/20 transition-colors"
                                        >
                                            <td className="px-5 py-3.5">
                                                <p className="text-sm font-semibold text-text-primary">
                                                    {item.student}
                                                </p>
                                                <p className="text-[11px] text-text-muted">
                                                    {item.requestCode}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-text-secondary">
                                                {item.course}
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-text-secondary">
                                                {item.room}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase ${
                                                        item.decision ===
                                                        "FORWARDED"
                                                            ? "bg-success/10 text-success"
                                                            : "bg-danger/10 text-danger"
                                                    }`}
                                                >
                                                    {item.decision ===
                                                    "FORWARDED"
                                                        ? "✓ Diteruskan"
                                                        : "✗ Ditolak"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-text-muted">
                                                {item.decidedAt}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
