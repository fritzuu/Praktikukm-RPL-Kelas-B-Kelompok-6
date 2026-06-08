import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TIPE_BADGES = {
    bentrok_ruangan: { label: 'Bentrok Ruangan', style: 'bg-danger/10 text-danger border-danger/20' },
    bentrok_jadwal:  { label: 'Bentrok Dosen',   style: 'bg-warning/10 text-warning border-warning/20' },
    umum:            { label: 'Konflik',          style: 'bg-info/10 text-info border-info/20' },
};

/**
 * ConflictAlertsBanner — read-only conflict alert for non-admin dashboards.
 *
 * Shows a collapsible banner when schedule conflicts exist.
 * Unlike Admin's ConflictAlerts, this has no resolve/delete actions.
 *
 * Props:
 *   conflicts  {array}   — conflict objects from ConflictDetectionService
 *   role       {string}  — 'aslab' | 'dosen' | 'mahasiswa' — controls the context message
 */
export default function ConflictAlertsBanner({ conflicts = [], role = 'aslab' }) {
    const [expanded, setExpanded] = useState(true);
    const [dismissed, setDismissed] = useState(false);

    if (!conflicts.length || dismissed) return null;

    const contextMessages = {
        aslab:     'Konflik berikut terdeteksi pada jadwal aktif. Laporkan ke Admin untuk penyelesaian.',
        dosen:     'Terdapat konflik pada jadwal Anda. Hubungi Admin atau Aslab untuk penyelesaian.',
        mahasiswa: 'Terdapat konflik jadwal yang berdampak pada kelas Anda.',
    };

    const message = contextMessages[role] ?? contextMessages.aslab;

    return (
        <section className="mb-6">
            {/* ── Banner Header ─────────────────────────────────────── */}
            <div className="flex items-center justify-between bg-danger/5 border border-danger/20 rounded-t-xl px-5 py-3">
                <div className="flex items-center gap-3">
                    {/* Pulsing icon */}
                    <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center">
                            <AlertTriangle size={18} className="text-danger" />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-60" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-danger" />
                        </span>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-text-primary">
                            {conflicts.length} Konflik Jadwal Terdeteksi
                        </h2>
                        <p className="text-xs text-text-muted mt-0.5">{message}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => setExpanded(v => !v)}
                        className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                        aria-label={expanded ? 'Sembunyikan' : 'Tampilkan'}
                    >
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button
                        onClick={() => setDismissed(true)}
                        className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                        aria-label="Tutup"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* ── Conflict List ─────────────────────────────────────── */}
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="border border-t-0 border-danger/20 rounded-b-xl divide-y divide-border">
                            {conflicts.map((conflict) => {
                                const badge = TIPE_BADGES[conflict.tipe] ?? TIPE_BADGES.umum;
                                return (
                                    <div key={conflict.id} className="px-5 py-4">
                                        <div className="flex items-start justify-between gap-3 mb-1">
                                            <h3 className="text-sm font-semibold text-text-primary leading-snug">
                                                {conflict.judul}
                                            </h3>
                                            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border shrink-0 ${badge.style}`}>
                                                {badge.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-secondary leading-relaxed">
                                            {conflict.deskripsi}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
