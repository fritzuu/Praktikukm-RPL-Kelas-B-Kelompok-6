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
    success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
    warning: { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
    info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
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
        <>
            {/* ── Header Section ────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Bell className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            Notifikasi
                        </h1>
                        <p className="text-white/60 mt-1">
                            {unreadCount > 0 ? `${unreadCount} pesan belum dibaca` : 'Semua pesan sudah dibaca'}
                        </p>
                    </div>
                </div>

                <button 
                    onClick={() => setDismissed(notifications.map(n => n.id))}
                    className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all duration-200 hover:shadow-md"
                >
                    Hapus Semua
                </button>
            </div>

            {/* ── Filter Tabs ────────────────────────────────────── */}
            <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
                {['all', 'unread', 'success', 'warning', 'info'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                            ${filter === tab
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 border border-orange-400/50'
                                : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                            }
                        `}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* ── Notifications List ────────────────────────────── */}
            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-sm">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell size={32} className="text-white/40" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Tidak ada notifikasi</h3>
                        <p className="text-sm text-white/60 mt-1">
                            {filter === 'all' ? 'Anda tidak memiliki pesan' : `Tidak ada pesan dengan filter "${filter}"`}
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
                                className={`group bg-white/5 border border-white/10 hover:border-orange-500/30 rounded-2xl p-5 transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:shadow-orange-500/10 ${!notif.read ? 'border-orange-500/40 bg-orange-500/5' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-lg ${typeConfig.bg} border ${typeConfig.border} flex items-center justify-center shrink-0 mt-1`}>
                                        <Icon className={`${typeConfig.color}`} size={20} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-white group-hover:text-orange-300 transition-colors">
                                                    {notif.title}
                                                </h3>
                                                <p className="text-white/70 text-sm mt-1 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                            </div>

                                            {/* Unread Badge */}
                                            {!notif.read && (
                                                <div className="w-2 h-2 bg-orange-400 rounded-full shrink-0 mt-2 animate-pulse"></div>
                                            )}
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-4 text-[10px] text-white/50 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {timeAgo}
                                                </span>
                                                {notif.category && (
                                                    <span className="px-2 py-1 bg-white/10 rounded-md">
                                                        {notif.category}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                {notif.actionUrl && (
                                                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500 border border-orange-500/30 hover:border-orange-500 text-orange-300 hover:text-white text-[10px] font-bold transition-all">
                                                        Tindakan
                                                        <ArrowRight size={12} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDismiss(notif.id)}
                                                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-red-400 transition-all"
                                                    title="Hapus notifikasi"
                                                >
                                                    <Trash2 size={14} />
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

            {/* ── Info Box ────────────────────────────────────── */}
            <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 flex items-start gap-4 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-1">
                    <Info className="text-blue-300" size={18} />
                </div>
                <div>
                    <h4 className="font-bold text-white">Tips</h4>
                    <p className="text-white/70 text-sm mt-1">
                        Notifikasi penting akan selalu ditampilkan di bagian atas. Pastikan untuk selalu memperhatikan pesan dari sistem akademik untuk informasi terbaru tentang jadwal dan kegiatan mengajar Anda.
                    </p>
                </div>
            </div>
        </>
    );
}

DosenNotification.layout = (page) => <DosenLayout>{page}</DosenLayout>;
