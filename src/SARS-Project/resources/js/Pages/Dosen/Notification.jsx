import { useState } from 'react';
import { 
    Bell, 
    CheckCircle, 
    AlertCircle, 
    Info, 
    Clock,
    Trash2,
    ArrowRight
} from 'lucide-react';
import DosenLayout from '../../Layouts/DosenLayout';

const NOTIFICATION_TYPES = {
    success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    warning: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

export default function DosenNotification({ notifications = [] }) {
    const [filter, setFilter] = useState('all');
    const [dismissed, setDismissed] = useState([]);

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notif.read;
        return notif.type === filter;
    }).filter(notif => !dismissed.includes(notif.id));

    const handleDismiss = (id) => {
        setDismissed([...dismissed, id]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="max-w-5xl mx-auto">
            {/* ── Header Section ────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-1">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Bell className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
                            Notifikasi
                        </h1>
                        <p className="text-text-secondary mt-1 text-sm">
                            {unreadCount > 0 ? `${unreadCount} pesan belum dibaca` : 'Semua pesan sudah dibaca'}
                        </p>
                    </div>
                </div>

                <button 
                    onClick={() => setDismissed(notifications.map(n => n.id))}
                    className="px-4 py-2.5 rounded-lg bg-card hover:bg-surface border border-border text-text-secondary text-sm font-bold transition-all duration-200 shadow-sm"
                >
                    Hapus Semua
                </button>
            </div>

            {/* ── Filter Tabs ────────────────────────────────────── */}
            <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 px-1 no-scrollbar">
                {['all', 'unread', 'success', 'warning', 'info'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`
                            px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border
                            ${filter === tab
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25 border-primary-400/50'
                                : 'bg-card border-border text-text-muted hover:text-text-primary hover:border-primary-500/30'
                            }
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── Notifications List ────────────────────────────── */}
            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-card border border-border rounded-3xl p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell size={36} className="text-text-muted opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary">Tidak ada notifikasi</h3>
                        <p className="text-sm text-text-muted mt-2">
                            {filter === 'all' ? 'Kotak masuk Anda sedang kosong.' : `Tidak ada pesan dengan filter "${filter}"`}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notif) => {
                        const typeConfig = NOTIFICATION_TYPES[notif.type] || NOTIFICATION_TYPES.info;
                        const Icon = typeConfig.icon;
                        const timeAgo = notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Baru saja';

                        return (
                            <div
                                key={notif.id}
                                className={`group bg-card border border-border hover:border-primary-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${!notif.read ? 'border-primary-500/40 ring-1 ring-primary-500/10 bg-primary-500/[0.02]' : ''}`}
                            >
                                <div className="flex items-start gap-5">
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl ${typeConfig.bg} flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-110`}>
                                        <Icon className={`${typeConfig.color}`} size={24} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className={`font-bold text-text-primary group-hover:text-primary-500 transition-colors ${!notif.read ? 'text-lg' : 'text-base'}`}>
                                                    {notif.title}
                                                </h3>
                                                <p className="text-text-secondary text-sm mt-1.5 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                            </div>

                                            {/* Unread Badge */}
                                            {!notif.read && (
                                                <div className="w-2.5 h-2.5 bg-primary-500 rounded-full shrink-0 mt-2 shadow-[0_0_10px_rgba(30,58,138,0.5)]"></div>
                                            )}
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
                                            <div className="flex items-center gap-4 text-[10px] text-text-muted font-bold uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={12} />
                                                    {timeAgo}
                                                </span>
                                                {notif.category && (
                                                    <span className="px-2 py-1 bg-surface rounded-md border border-border">
                                                        {notif.category}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                {notif.actionUrl && (
                                                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-md shadow-primary-500/20">
                                                        Lihat Detail
                                                        <ArrowRight size={12} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDismiss(notif.id)}
                                                    className="p-2 rounded-xl hover:bg-danger/10 text-text-muted hover:text-danger transition-all"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

DosenNotification.layout = (page) => <DosenLayout>{page}</DosenLayout>;
