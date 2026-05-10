import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { MOCK_NOTIFIKASI } from '../../data/mockData';

const ICON_MAP = {
    0: Calendar,
    1: CheckCircle,
    2: AlertTriangle,
};

export default function NotificationDropdown({ onClose }) {
    return (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl border border-border
                        shadow-lg shadow-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-text-primary">Notifikasi</h3>
                <span className="text-[10px] font-bold bg-danger/10 text-danger px-2 py-0.5 rounded-full">
                    {MOCK_NOTIFIKASI.filter((n) => !n.dibaca).length} baru
                </span>
            </div>

            {/* Items */}
            <div className="max-h-64 overflow-y-auto">
                {MOCK_NOTIFIKASI.map((notif, idx) => {
                    const Icon = ICON_MAP[idx] || Calendar;
                    return (
                        <div
                            key={notif.id}
                            className={`
                                flex items-start gap-3 px-4 py-3 hover:bg-surface transition-colors cursor-pointer
                                ${!notif.dibaca ? 'bg-primary-50/50' : ''}
                            `}
                        >
                            <div className={`
                                w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5
                                ${!notif.dibaca ? 'bg-primary-500/10 text-primary-500' : 'bg-surface text-text-muted'}
                            `}>
                                <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-tight ${!notif.dibaca ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                                    {notif.judul}
                                </p>
                                <p className="text-[11px] text-text-muted mt-0.5">{notif.waktu}</p>
                            </div>
                            {!notif.dibaca && (
                                <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border">
                <button
                    onClick={onClose}
                    className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
                >
                    Tandai Semua Dibaca
                </button>
            </div>
        </div>
    );
}
