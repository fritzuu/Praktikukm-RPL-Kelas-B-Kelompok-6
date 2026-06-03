import { useState } from 'react';
import MahasiswaLayout from '../../../Layouts/MahasiswaLayout';
import { Bell, CheckCircle, AlertTriangle, Calendar, Info, CheckCheck } from 'lucide-react';

const TYPE_CONFIG = {
    STATUS_CHANGE: { icon: CheckCircle, color: 'text-info', bg: 'bg-info/10' },
    CONFLICT_ALERT: { icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
    REMINDER: { icon: Bell, color: 'text-warning', bg: 'bg-warning/10' },
    SYSTEM: { icon: Info, color: 'text-text-muted', bg: 'bg-surface' },
};

export default function Notifications({ notifications: propNotifs }) {
    const notifData = propNotifs?.data || propNotifs || [];
    const [notifs, setNotifs] = useState(notifData);

    function markAsRead(notif) {
        setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        try {
            fetch(route('notifications.read', { id: notif.notif_id }), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '', 'Accept': 'application/json' },
            });
        } catch {}
    }

    function markAllRead() {
        setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
        try {
            fetch(route('notifications.readAll'), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '', 'Accept': 'application/json' },
            });
        } catch {}
    }

    const unreadCount = notifs.filter(n => !n.is_read).length;

    return (
        <>
            <section className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell size={22} className="text-text-primary" />
                        <h1 className="text-xl font-bold text-text-primary">Notifikasi</h1>
                        {unreadCount > 0 && (
                            <span className="text-[10px] font-bold bg-danger/10 text-danger px-2.5 py-1 rounded-full">
                                {unreadCount} belum dibaca
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary-500 hover:text-primary-600 bg-primary-500/5 hover:bg-primary-500/10 rounded-lg transition-colors">
                            <CheckCheck size={14} /> Tandai Semua Dibaca
                        </button>
                    )}
                </div>
            </section>

            <div className="space-y-2">
                {notifs.map(notif => {
                    const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEM;
                    const Icon = config.icon;
                    return (
                        <div
                            key={notif.id}
                            onClick={() => !notif.is_read && markAsRead(notif)}
                            className={`bg-card border border-border rounded-xl px-5 py-4 flex items-start gap-4 transition-all hover:shadow-sm cursor-pointer ${!notif.is_read ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                                <Icon size={18} className={config.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className={`text-sm leading-tight ${!notif.is_read ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'}`}>
                                        {notif.title}
                                    </h3>
                                    {notif.channel === 'PUSH' && (
                                        <span className="text-[8px] font-bold bg-success/10 text-success px-1.5 py-0.5 rounded-full">PUSH</span>
                                    )}
                                </div>
                                <p className="text-xs text-text-muted leading-relaxed">{notif.body}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[10px] text-text-muted">{notif.created_at}</span>
                                    {notif.request_code && (
                                        <span className="text-[10px] font-semibold text-primary-500">{notif.request_code}</span>
                                    )}
                                </div>
                            </div>
                            {!notif.is_read && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0 mt-1.5 animate-pulse" />
                            )}
                        </div>
                    );
                })}
                {notifs.length === 0 && (
                    <div className="bg-card border border-border rounded-xl p-8 text-center">
                        <Bell size={32} className="mx-auto text-text-muted mb-3" />
                        <p className="text-sm text-text-muted">Belum ada notifikasi</p>
                    </div>
                )}
            </div>
        </>
    );
}

Notifications.layout = (page) => <MahasiswaLayout>{page}</MahasiswaLayout>;
