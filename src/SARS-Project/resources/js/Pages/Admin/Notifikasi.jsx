import { useState, useMemo } from 'react';
import {
    Bell, BellOff, Calendar, AlertTriangle, CheckCircle,
    Monitor, MailOpen, Search, Trash2, Info,
} from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';

const TIPE_CONFIG = {
    jadwal: { icon: Calendar, color: 'bg-primary-500/10 text-primary-500', label: 'Jadwal', labelColor: 'bg-primary-500/10 text-primary-500' },
    validasi: { icon: CheckCircle, color: 'bg-success/10 text-success', label: 'Validasi', labelColor: 'bg-success/10 text-success' },
    info: { icon: Info, color: 'bg-warning/10 text-warning', label: 'Informasi', labelColor: 'bg-warning/10 text-warning' },
    sistem: { icon: Monitor, color: 'bg-info/10 text-info', label: 'Sistem', labelColor: 'bg-info/10 text-info' },
};

const FILTER_TABS = [
    { key: 'semua', label: 'Semua' },
    { key: 'belum_dibaca', label: 'Belum Dibaca' },
    { key: 'jadwal', label: 'Jadwal' },
    { key: 'validasi', label: 'Validasi' },
    { key: 'info', label: 'Informasi' },
    { key: 'sistem', label: 'Sistem' },
];

export default function AdminNotifikasi({ notifikasi = [] }) {
    const [items, setItems] = useState(notifikasi);
    const [activeFilter, setActiveFilter] = useState('semua');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = useMemo(() => {
        let result = items;
        if (activeFilter === 'belum_dibaca') result = result.filter(n => !n.dibaca);
        else if (activeFilter !== 'semua') result = result.filter(n => n.tipe === activeFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(n => n.judul.toLowerCase().includes(q) || n.pesan.toLowerCase().includes(q));
        }
        return result;
    }, [items, activeFilter, searchQuery]);

    const unreadCount = items.filter(n => !n.dibaca).length;
    const tabCounts = useMemo(() => ({
        semua: items.length,
        belum_dibaca: items.filter(n => !n.dibaca).length,
        jadwal: items.filter(n => n.tipe === 'jadwal').length,
        validasi: items.filter(n => n.tipe === 'validasi').length,
        info: items.filter(n => n.tipe === 'info').length,
        sistem: items.filter(n => n.tipe === 'sistem').length,
    }), [items]);

    function csrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.content || '';
    }

    function markAsRead(id) {
        setItems(prev => prev.map(n => n.id === id ? { ...n, dibaca: true } : n));
        fetch(`/admin/notifikasi/${id}/read`, { method: 'POST', headers: { 'X-CSRF-TOKEN': csrfToken(), 'Accept': 'application/json' } }).catch(() => {});
    }

    function markAllAsRead() {
        setItems(prev => prev.map(n => ({ ...n, dibaca: true })));
        fetch('/admin/notifikasi/read-all', { method: 'POST', headers: { 'X-CSRF-TOKEN': csrfToken(), 'Accept': 'application/json' } }).catch(() => {});
    }

    function deleteNotif(id) {
        setItems(prev => prev.filter(n => n.id !== id));
        fetch(`/admin/notifikasi/${id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': csrfToken(), 'Accept': 'application/json' } }).catch(() => {});
    }

    const grouped = useMemo(() => {
        const groups = {};
        filteredItems.forEach(item => {
            const key = item.tanggal || 'Lainnya';
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });
        return Object.entries(groups);
    }, [filteredItems]);

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                        <Bell size={22} className="text-primary-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Notifikasi</h1>
                        <p className="text-sm text-text-muted mt-0.5">
                            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
                        </p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-primary-500/20">
                        <CheckCircle size={16} />
                        <span className="hidden sm:inline">Tandai Semua Dibaca</span>
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari notifikasi..."
                    className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
                {FILTER_TABS.map(tab => (
                    <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeFilter === tab.key ? 'border-primary-500 text-primary-500' : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'}`}>
                        {tab.label}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeFilter === tab.key ? 'bg-primary-500 text-white' : 'bg-surface text-text-muted'}`}>{tabCounts[tab.key]}</span>
                    </button>
                ))}
            </div>

            {/* Notification List */}
            {grouped.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <BellOff size={48} className="text-text-muted mx-auto mb-4" />
                    <p className="text-text-secondary font-medium text-lg">Tidak ada notifikasi</p>
                    <p className="text-text-muted text-sm mt-1">{searchQuery ? 'Coba kata kunci lain.' : 'Notifikasi baru akan muncul di sini.'}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {grouped.map(([date, notifs]) => (
                        <div key={date}>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 px-1">{date}</p>
                            <div className="space-y-2">
                                {notifs.map(notif => {
                                    const cfg = TIPE_CONFIG[notif.tipe] || TIPE_CONFIG.info;
                                    const Icon = cfg.icon;
                                    return (
                                        <div key={notif.id} onClick={() => markAsRead(notif.id)}
                                            className={`group relative bg-card border rounded-xl px-5 py-4 transition-all duration-200 hover:shadow-md ${!notif.dibaca ? 'border-primary-500/30 bg-primary-500/[0.02]' : 'border-border hover:border-primary-500/10'}`}>
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-110 ${cfg.color}`}>
                                                    <Icon size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${cfg.labelColor}`}>{cfg.label}</span>
                                                        {!notif.dibaca && <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />}
                                                    </div>
                                                    <h3 className={`text-sm leading-snug ${!notif.dibaca ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'}`}>{notif.judul}</h3>
                                                    <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">{notif.pesan}</p>
                                                    <div className="flex items-center gap-3 mt-2.5">
                                                        <span className="text-[11px] text-text-muted">{notif.waktu}</span>
                                                        {!notif.dibaca && (
                                                            <button onClick={e => { e.stopPropagation(); markAsRead(notif.id); }}
                                                                className="flex items-center gap-1 text-[11px] font-medium text-primary-500 hover:text-primary-600 transition-colors">
                                                                <MailOpen size={12} /> Tandai dibaca
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                    {notif.dibaca && (
                                                        <button onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }} title="Hapus"
                                                            className="p-1.5 rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

AdminNotifikasi.layout = (page) => <AdminLayout>{page}</AdminLayout>;
