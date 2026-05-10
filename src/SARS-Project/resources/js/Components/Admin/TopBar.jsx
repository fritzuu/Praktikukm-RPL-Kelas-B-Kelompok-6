import { useState, useRef, useEffect } from 'react';
import {
    Search,
    Upload,
    Bell,
    HelpCircle,
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function TopBar({ user, onUploadClick, sidebarCollapsed }) {
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);

    // Tutup dropdown saat klik di luar
    useEffect(() => {
        function handleClickOutside(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const initial = user?.name?.charAt(0)?.toUpperCase() || 'A';

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
                    placeholder="Cari jadwal, ruangan, atau dosen..."
                    className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg
                               text-sm text-text-primary placeholder:text-text-muted
                               focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                               transition-all"
                    readOnly
                />
            </div>

            {/* ── Upload Button ─────────────────────────────────────── */}
            <button
                onClick={onUploadClick}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600
                           text-white text-sm font-medium px-4 py-2 rounded-lg
                           transition-colors duration-150 shrink-0"
            >
                <Upload size={16} />
                <span className="hidden sm:inline">Unggah Jadwal</span>
            </button>

            {/* ── Notification Bell ──────────────────────────────────── */}
            <div className="relative" ref={notifRef}>
                <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 rounded-lg text-text-secondary hover:bg-surface
                               hover:text-text-primary transition-colors"
                >
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white
                                     text-[9px] font-bold rounded-full flex items-center justify-center">
                        3
                    </span>
                </button>
                {notifOpen && (
                    <NotificationDropdown onClose={() => setNotifOpen(false)} />
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
                        {user?.name || 'Admin'}
                    </p>
                    <p className="text-[11px] text-text-muted uppercase tracking-wide">
                        Admin Fakultas
                    </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary-500 text-white
                                flex items-center justify-center font-bold text-sm shrink-0">
                    {initial}
                </div>
            </div>
        </header>
    );
}
