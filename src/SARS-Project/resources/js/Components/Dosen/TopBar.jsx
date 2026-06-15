import { useState, useRef, useEffect, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    Search,
    Bell,
    HelpCircle,
    Calendar,
    CheckCircle,
    AlertTriangle,
    X,
} from 'lucide-react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import HelpModal from '../Shared/HelpModal';
import NotificationDropdown from '../Shared/NotificationDropdown';

const ICON_MAP = {
    jadwal: Calendar,
    validasi: CheckCircle,
    info: AlertTriangle,
};

export default function TopBar({ user, sidebarCollapsed, unreadCount: unreadCountProp, notifications: notificationsProp }) {
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const notifRef = useRef(null);
    const searchRef = useRef(null);
    const bellControls = useAnimationControls();
    const { props } = usePage();

    // Get jadwal from page props for search
    const jadwal = props.jadwal || props.jadwalItems || [];

    // Use live polled data when provided by layout, fall back to Inertia shared props
    const notifikasi   = notificationsProp ?? props.auth?.notifications ?? [];
    const unreadCount  = unreadCountProp   ?? notifikasi.filter(n => !n.dibaca).length;

    const triggerBellWobble = () => {
        if (unreadCount === 0) return;
        bellControls.start({
            rotate: [0, -15, 12, -8, 6, -3, 0],
            transition: { duration: 0.5, ease: "easeInOut" }
        });
    };

    useEffect(() => {
        if (unreadCount === 0) return;
        const interval = setInterval(() => {
            triggerBellWobble();
        }, 5000);
        return () => clearInterval(interval);
    }, [unreadCount]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Ctrl+K shortcut for search, ? for help
    useEffect(() => {
        function handleKeyDown(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchRef.current?.focus();
            }
            if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                setHelpOpen(true);
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const initial = user?.name?.charAt(0)?.toUpperCase() || 'D';

    // Search results
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return jadwal.filter(j =>
            j.nama?.toLowerCase().includes(q) ||
            j.kode?.toLowerCase().includes(q) ||
            j.ruangan?.toLowerCase().includes(q)
        ).slice(0, 5);
    }, [searchQuery, jadwal]);

    return (
        <>
            <header
                className={`
                    sticky top-0 z-50 bg-card border-b border-border
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
                        ref={searchRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                        placeholder="Cari jadwal, mata kuliah, atau ruangan..."
                        className="w-full pl-10 pr-16 py-2 bg-surface border border-border rounded-lg
                                   text-sm text-text-primary placeholder:text-text-muted
                                   focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                                   transition-all"
                    />
                    {/* Ctrl+K hint */}
                    {!searchFocused && !searchQuery && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                            <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px] font-mono text-text-muted">Ctrl</kbd>
                            <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px] font-mono text-text-muted">K</kbd>
                        </div>
                    )}
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                            <X size={14} />
                        </button>
                    )}

                    {/* Search Results Dropdown */}
                    {searchFocused && searchQuery.trim() && (
                        <div className="absolute left-0 top-full mt-2 w-full bg-card rounded-xl border border-border shadow-xl z-50 overflow-hidden">
                            {searchResults.length === 0 ? (
                                <div className="px-4 py-6 text-center text-sm text-text-muted">
                                    Tidak ditemukan hasil untuk "{searchQuery}"
                                </div>
                            ) : (
                                <div className="max-h-60 overflow-y-auto">
                                    {searchResults.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface transition-colors cursor-pointer border-b border-border/50 last:border-b-0">
                                            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                                                <Calendar size={14} className="text-primary-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-text-primary truncate">{item.nama}</p>
                                                <p className="text-[11px] text-text-muted">{item.kode} • {item.ruangan} • {item.waktu || `Sesi ${item.sesiMulai}`}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Right Section ──────────────────────────────────────── */}
                <div className="flex items-center gap-4 ml-auto">

                    {/* ── Notification Bell ──────────────────────────────────── */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setNotifOpen(!notifOpen)}
                            onMouseEnter={triggerBellWobble}
                            className="relative p-2 rounded-lg text-text-secondary hover:bg-surface
                                       hover:text-text-primary transition-colors group"
                        >
                            <motion.div
                                animate={bellControls}
                                style={{ originX: 0.5, originY: 0 }}
                            >
                                <Bell size={20} />
                            </motion.div>
                            {unreadCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.1 }}
                                    className="absolute top-1 right-1 w-4 h-4 bg-danger text-white
                                                     text-[9px] font-bold rounded-full flex items-center justify-center"
                                >
                                    {unreadCount}
                                </motion.span>
                            )}
                        </button>
                        <AnimatePresence>
                            {notifOpen && (
                                <NotificationDropdown 
                                    onClose={() => setNotifOpen(false)} 
                                    notifications={notifikasi}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── Help Icon ─────────────────────────────────────────── */}
                    <button
                        onClick={() => setHelpOpen(true)}
                        className="p-2 rounded-lg text-text-secondary hover:bg-surface
                                   hover:text-text-primary transition-colors"
                        title="Bantuan (tekan ?)"
                    >
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

            <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
        </>
    );
}
