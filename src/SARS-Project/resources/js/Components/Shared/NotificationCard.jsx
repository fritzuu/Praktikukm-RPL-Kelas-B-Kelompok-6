import { Calendar, AlertTriangle, CheckCircle, Monitor, Info, Trash2 } from 'lucide-react';
import DoubleCheck from './DoubleCheck.jsx';

/**
 * Shared NotificationCard — role-agnostic.
 *
 * Props:
 *   notif        {object}   Notification data object (id, judul, pesan, waktu, tipe, dibaca)
 *   onOpenDetail {function} Called with (id) when "Lihat detail" is clicked or card is clicked
 *   onMarkRead   {function} Called with (id) when "Tandai dibaca" is clicked
 *   onDelete     {function} Called with (id) when trash button is clicked (only shown when read)
 */

const TIPE_CONFIG = {
    jadwal:   { icon: Calendar,      color: 'bg-primary-500/10 text-primary-500', label: 'Jadwal',     labelColor: 'bg-primary-500/10 text-primary-500' },
    validasi: { icon: CheckCircle,   color: 'bg-success/10 text-success',         label: 'Validasi',   labelColor: 'bg-success/10 text-success' },
    info:     { icon: AlertTriangle, color: 'bg-warning/10 text-warning',          label: 'Informasi',  labelColor: 'bg-warning/10 text-warning' },
    sistem:   { icon: Monitor,       color: 'bg-info/10 text-info',               label: 'Sistem',     labelColor: 'bg-info/10 text-info' },
};

export { TIPE_CONFIG };

export default function NotificationCard({ notif, onOpenDetail, onMarkRead, onDelete }) {
    const cfg  = TIPE_CONFIG[notif.tipe] ?? TIPE_CONFIG.info;
    const Icon = cfg.icon;

    return (
        <div
            onClick={() => onOpenDetail?.(notif.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onOpenDetail?.(notif.id)}
            aria-label={`Buka detail notifikasi: ${notif.judul}`}
            className={`
                group relative bg-card border rounded-xl px-5 py-4
                transition-all duration-200 hover:shadow-md cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40
                ${!notif.dibaca
                    ? 'border-primary-500/30 bg-primary-500/[0.02]'
                    : 'border-border hover:border-primary-500/10'
                }
            `}
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5
                                transition-transform group-hover:scale-110 ${cfg.color}`}
                >
                    <Icon size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${cfg.labelColor}`}>
                            {cfg.label}
                        </span>
                        {!notif.dibaca && (
                            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                        )}
                    </div>

                    <h3 className={`text-sm leading-snug ${
                        !notif.dibaca ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'
                    }`}>
                        {notif.judul}
                    </h3>

                    <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                        {notif.pesan}
                    </p>

                    <div className="flex items-center gap-3 mt-2.5">
                        <span className="text-[11px] text-text-muted">{notif.waktu}</span>

                        <span
                            onClick={(e) => { e.stopPropagation(); onOpenDetail?.(notif.id); }}
                            className="flex items-center gap-1 text-[11px] font-medium text-primary-500 hover:text-primary-600 transition-colors"
                        >
                            Lihat detail
                        </span>

                        {!notif.dibaca && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onMarkRead?.(notif.id); }}
                                className="flex items-center gap-1 text-[11px] font-medium text-primary-500 hover:text-primary-600 transition-colors"
                                aria-label="Tandai dibaca"
                            >
                                <DoubleCheck size={12} />
                                Tandai dibaca
                            </button>
                        )}
                    </div>
                </div>

                {/* Delete — only visible on hover, only when read */}
                {notif.dibaca && onDelete && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete?.(notif.id); }}
                            title="Hapus notifikasi"
                            aria-label="Hapus notifikasi"
                            className="p-1.5 rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
