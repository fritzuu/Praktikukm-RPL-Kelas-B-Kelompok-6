import { useState, useRef, useEffect } from 'react';
import {
    Search,
    Bell,
    HelpCircle,
    Calendar,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';
import { MOCK_DOSEN_NOTIFIKASI } from '../../data/dosenMockData';

const ICON_MAP = {
    jadwal: Calendar,
    validasi: CheckCircle,
    info: AlertTriangle,
};

export default function TopBar({ user, sidebarCollapsed }) {
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const notifRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const initial = user?.name?.charAt(0)?.toUpperCase() || 'D';
    const unreadCount = MOCK_DOSEN_NOTIFIKASI.filter(n => !n.dibaca).length;

    return (
        <header
            className={`
                sticky top-0 z-30 bg-card border-b border-border
                flex items-center gap-4 px-6 py-3
                transition-all duration-250
                ${sidebarCollapsed ? 'ml-16' : 'ml-60'}
            `}
        >
            {/* ── Search ───────────────────────────────────────────── */}
            <div className="relative flex-1 max-w-md">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari jadwal, mata kuliah, atau ruangan..."
                    className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg
                               text-sm text-text-primary placeholder:text-text-muted
                               focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                               transition-all"
                />
            </div>

            {/* ── Right Section ──────────────────────────────────────── */}
            <div className="flex items-center gap-4 ml-auto">

                {/* ── Notification Bell ──────────────────────────────────── */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="relative p-2 rounded-lg text-text-secondary hover:bg-surface
                                   hover:text-text-primary transition-colors"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white
                                             text-[9px] font-bold rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    {notifOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl border border-border
                                        shadow-lg shadow-black/5 overflow-hidden z-50">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                <h3 className="text-sm font-semibold text-text-primary">Notifikasi</h3>
                                <span className="text-[10px] font-bold bg-danger/10 text-danger px-2 py-0.5 rounded-full">
                                    {unreadCount} baru
                                </span>
                            </div>

                            {/* Items */}
                            <div className="max-h-64 overflow-y-auto">
                                {MOCK_DOSEN_NOTIFIKASI.map((notif) => {
                                    const Icon = ICON_MAP[notif.tipe] || Calendar;
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
                                    onClick={() => setNotifOpen(false)}
                                    className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
                                >
                                    Tandai Semua Dibaca
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Help Icon ─────────────────────────────────────────── */}
                <button className="p-2 rounded-lg text-text-secondary hover:bg-surface
                                   hover:text-text-primary transition-colors">
                    <HelpCircle size={20} />
                </button>

                {/* ── Profile ───────────────────────────────────────────── */}
                <div className="flex items-center gap-3 pl-3 border-l border-border">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-text-primary leading-tight">
                            {user?.name || 'Dosen'}
                        </p>
                        <p className="text-[11px] text-text-muted uppercase tracking-wide">
                            Dosen Pengampu
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary-500 text-white
                                    flex items-center justify-center font-bold text-sm shrink-0">
                        {initial}
                    </div>
                </div>
            </div>
        </header>
    );
}
