import { useEffect, useState } from 'react';
import Modal from '../Modal.jsx';
import {
    CheckCircle,
    Clock, User, ArrowRight, AlertCircle,
} from 'lucide-react';

// ── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const cfg = {
        APPROVED:        { label: 'Disetujui',       cls: 'bg-success/10 text-success' },
        REJECTED_ADMIN:  { label: 'Ditolak Admin',   cls: 'bg-danger/10 text-danger' },
        REJECTED_ASLAB:  { label: 'Ditolak Aslab',   cls: 'bg-danger/10 text-danger' },
        PENDING_ADMIN:   { label: 'Menunggu Admin',  cls: 'bg-warning/10 text-warning' },
        PENDING_ASLAB:   { label: 'Menunggu Aslab',  cls: 'bg-warning/10 text-warning' },
        CANCELLED:       { label: 'Dibatalkan',      cls: 'bg-surface text-text-muted' },
    }[status] ?? { label: status ?? '-', cls: 'bg-surface text-text-muted' };

    return (
        <span className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
}

// ── Reusable labelled cell ────────────────────────────────────────────────
function Cell({ label, children }) {
    const empty = !children || children === '-';
    return (
        <div className="bg-surface border border-border rounded-xl p-3">
            <div className="text-[11px] text-text-muted mb-0.5">{label}</div>
            <div className={`text-sm font-semibold ${empty ? 'text-text-muted' : 'text-text-primary'}`}>
                {empty ? '—' : children}
            </div>
        </div>
    );
}

// ── Schedule side-by-side card ────────────────────────────────────────────
function ScheduleCard({ heading, accentClass, dotClass, data }) {
    return (
        <div className={`border rounded-xl p-4 space-y-3 ${accentClass}`}>
            <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${dotClass}`} />
                <span className={`text-xs font-bold ${dotClass.replace('bg-', 'text-')}`}>
                    {heading}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Cell label="Hari">{data?.day}</Cell>
                <Cell label="Sesi">{data?.session}</Cell>
                <Cell label="Jam">{data?.time}</Cell>
                <Cell label="Kode Ruang">{data?.room}</Cell>
            </div>
            {data?.room_name && (
                <Cell label="Nama Ruang">{data.room_name}</Cell>
            )}
        </div>
    );
}

export default function NotificationDetailModal({
    open,
    onClose,
    notificationId,
    initialPayload = null,
}) {
    const [loading, setLoading] = useState(false);
    const [payload, setPayload] = useState(initialPayload);
    const [error, setError]     = useState(null);

    useEffect(() => {
        if (!open) return;
        setError(null);
        setPayload(initialPayload);
        if (!notificationId) return;

        setLoading(true);
        fetch(`/notifications/${notificationId}/detail`, {
            headers: { Accept: 'application/json' },
        })
            .then(r => {
                if (!r.ok) throw new Error('Gagal memuat detail');
                return r.json();
            })
            .then(json => {
                if (!json?.success) throw new Error(json?.message || 'Gagal memuat');
                setPayload(json.notification);
            })
            .catch(e => setError(e?.message || 'Terjadi kesalahan'))
            .finally(() => setLoading(false));
    }, [open, notificationId]);

    const summary   = payload?.request_summary  ?? {};
    const schChange = payload?.schedule_change  ?? {};
    const reason    = payload?.student_reason?.reason ?? null;
    const decision  = payload?.decision         ?? {};
    const timeline  = Array.isArray(payload?.timeline) ? payload.timeline : [];

    const hasScheduleData =
        schChange.old?.day || schChange.old?.time ||
        schChange.new?.day || schChange.new?.time;

    return (
        <Modal isOpen={open} onClose={onClose} title={payload?.fallback?.title || 'Detail Notifikasi'}>
            <div className="relative">

                {/* ── Preview subtitle ────────────────────────────────── */}
                {payload?.fallback?.preview && !loading && !error && (
                    <p className="text-sm text-text-muted -mt-2 mb-5 leading-relaxed">
                        {payload.fallback.preview}
                    </p>
                )}

                {/* ── Loading ─────────────────────────────────────────── */}
                {loading && (
                    <div className="py-12 flex flex-col items-center gap-3 text-text-muted">
                        <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                        <p className="text-sm">Memuat detail…</p>
                    </div>
                )}

                {/* ── Error ───────────────────────────────────────────── */}
                {!loading && error && (
                    <div className="flex items-center gap-2 bg-danger/10 text-danger rounded-xl px-4 py-3 text-sm">
                        <AlertCircle size={16} className="shrink-0" />
                        {error}
                    </div>
                )}

                {/* ── Content ─────────────────────────────────────────── */}
                {!loading && !error && payload && (
                    <div className="space-y-5">

                        {/* ── 1. Ringkasan Permintaan ──────────────────── */}
                        <section>
                            <h3 className="text-sm font-semibold text-text-primary mb-2">
                                Ringkasan Permintaan
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                <Cell label="Kode Pengajuan">{summary.request_code}</Cell>
                                <Cell label="Mata Kuliah">{summary.course_name}</Cell>
                                <Cell label="Kelas">{summary.class_name}</Cell>
                                <Cell label="Tipe Perubahan">
                                    {summary.request_type === 'TEMPORARY' ? 'Sementara' :
                                     summary.request_type === 'PERMANENT' ? 'Permanen' :
                                     summary.request_type}
                                </Cell>
                            </div>
                            {/* Status spans full width */}
                            <div className="mt-2 bg-surface border border-border rounded-xl p-3">
                                <div className="text-[11px] text-text-muted mb-1">Status</div>
                                <StatusBadge status={summary.current_status} />
                            </div>
                        </section>

                        {/* ── 2. Perubahan Jadwal ──────────────────────── */}
                        {hasScheduleData && (
                            <section>
                                <h3 className="text-sm font-semibold text-text-primary mb-2">
                                    Perubahan Jadwal
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <ScheduleCard
                                        heading="Jadwal Saat Ini"
                                        accentClass="bg-surface border-border"
                                        dotClass="bg-text-muted"
                                        data={schChange.old}
                                    />
                                    <ScheduleCard
                                        heading="Jadwal Diajukan"
                                        accentClass="bg-primary-500/[0.03] border-primary-500/20"
                                        dotClass="bg-primary-500"
                                        data={schChange.new}
                                    />
                                </div>
                            </section>
                        )}

                        {/* ── 3. Alasan Mahasiswa ──────────────────────── */}
                        {reason && (
                            <section>
                                <h3 className="text-sm font-semibold text-text-primary mb-2">
                                    Alasan Pengajuan
                                </h3>
                                <div className="bg-surface border border-border rounded-xl p-3">
                                    <p className="text-sm text-text-primary leading-relaxed">{reason}</p>
                                </div>
                            </section>
                        )}

                        {/* ── 4. Keputusan ────────────────────────────── */}
                        {(decision.approved || decision.rejected || decision.forwarded) && (
                            <section>
                                <h3 className="text-sm font-semibold text-text-primary mb-2">
                                    Keputusan
                                </h3>
                                <div className="space-y-2">
                                    {decision.forwarded && (
                                        <div className="bg-surface border border-border rounded-xl p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <ArrowRight size={13} className="text-primary-500" />
                                                <span className="text-xs font-semibold text-primary-500">Diteruskan ke Admin</span>
                                            </div>
                                            <p className="text-xs text-text-muted">
                                                Oleh <span className="font-medium text-text-secondary">{decision.forwarded.by}</span>
                                                {decision.forwarded.at && <> &mdash; {decision.forwarded.at}</>}
                                            </p>
                                            {decision.forwarded.notes && (
                                                <p className="text-xs text-text-secondary mt-1">{decision.forwarded.notes}</p>
                                            )}
                                        </div>
                                    )}

                                    {decision.approved && (
                                        <div className="bg-success/5 border border-success/20 rounded-xl p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle size={13} className="text-success" />
                                                <span className="text-xs font-semibold text-success">Disetujui</span>
                                            </div>
                                            <p className="text-xs text-text-muted">
                                                Oleh <span className="font-medium text-text-secondary">{decision.approved.by}</span>
                                                {decision.approved.at && <> &mdash; {decision.approved.at}</>}
                                            </p>
                                            {decision.approved.notes && (
                                                <p className="text-xs text-text-secondary mt-1">{decision.approved.notes}</p>
                                            )}
                                        </div>
                                    )}

                                    {decision.rejected && (
                                        <div className="bg-danger/5 border border-danger/20 rounded-xl p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertCircle size={13} className="text-danger" />
                                                <span className="text-xs font-semibold text-danger">
                                                    Ditolak{decision.rejected.stage ? ` (${decision.rejected.stage})` : ''}
                                                </span>
                                            </div>
                                            <p className="text-xs text-text-muted">
                                                Oleh <span className="font-medium text-text-secondary">{decision.rejected.by}</span>
                                                {decision.rejected.at && <> &mdash; {decision.rejected.at}</>}
                                            </p>
                                            {decision.rejected.notes && (
                                                <p className="text-xs text-text-secondary mt-1 italic">
                                                    "{decision.rejected.notes}"
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* ── 5. Timeline ──────────────────────────────── */}
                        <section>
                            <h3 className="text-sm font-semibold text-text-primary mb-2">
                                Timeline Proses
                            </h3>

                            {timeline.length > 0 ? (
                                <div className="relative pl-5">
                                    {/* Vertical connector line */}
                                    <div className="absolute left-[7px] top-3 bottom-3 w-px bg-border" />

                                    <div className="space-y-3">
                                        {timeline.map((step, idx) => (
                                            <div key={idx} className="relative flex items-start gap-3">
                                                {/* Dot */}
                                                <div className="absolute -left-5 top-[5px] w-3.5 h-3.5 rounded-full bg-primary-500 border-2 border-card shrink-0" />

                                                <div className="bg-surface border border-border rounded-xl p-3 flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-text-primary">
                                                        {step.label}
                                                    </p>
                                                    {step.by && (
                                                        <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
                                                            <User size={10} className="shrink-0" />
                                                            {step.by}
                                                        </p>
                                                    )}
                                                    {step.time && (
                                                        <p className="text-[11px] text-text-muted flex items-center gap-1">
                                                            <Clock size={10} className="shrink-0" />
                                                            {step.time}
                                                        </p>
                                                    )}
                                                    {step.notes && (
                                                        <p className="text-[11px] text-text-secondary mt-1.5 italic border-t border-border/50 pt-1.5">
                                                            "{step.notes}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-surface border border-border rounded-xl p-3 text-sm text-text-muted">
                                    Timeline belum tersedia.
                                </div>
                            )}
                        </section>

                    </div>
                )}
            </div>
        </Modal>
    );
}
