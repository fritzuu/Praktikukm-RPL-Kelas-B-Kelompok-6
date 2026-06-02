import { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { usePage } from '@inertiajs/react';
import NotificationDropdown from './NotificationDropdown';

const ROLE_LABELS = {
    admin: "Admin Fakultas",
    dosen: "Dosen Mata Kuliah",
    aslab: "Asisten Lab",
    mahasiswa: "Mahasiswa",
};

export default function TopBar({ user, sidebarCollapsed, actions }) {
    const { auth } = usePage().props;
    const notifications = auth?.notifications || [];
    const unreadCount = notifications.filter(n => !n.dibaca).length;

    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);
    const bellControls = useAnimationControls();

    const [searchVal, setSearchVal] = useState(() => window.__globalSearchQuery || '');

    const handleSearchChange = (e) => {
        const value = e.target.value;
        console.log('TopBar: Search input changed to:', value);
        setSearchVal(value);
        window.__globalSearchQuery = value;
        const event = new CustomEvent('global-search', { detail: value });
        window.dispatchEvent(event);
    };

    const handleClearSearch = () => {
        setSearchVal('');
        window.__globalSearchQuery = '';
        const event = new CustomEvent('global-search', { detail: '' });
        window.dispatchEvent(event);
    };

    // Listen to global-search-reset event if any component wants to clear it
    useEffect(() => {
        const handleReset = () => {
            setSearchVal('');
            window.__globalSearchQuery = '';
        };
        window.addEventListener('global-search-reset', handleReset);
        return () => window.removeEventListener('global-search-reset', handleReset);
    }, []);

    const triggerBellWobble = () => {
        if (unreadCount === 0) return;
        bellControls.start({
            rotate: [0, -15, 12, -8, 6, -3, 0],
            transition: { duration: 0.5, ease: "easeInOut" },
        });
    };

    // Trigger periodic bell wobble every 5 seconds to draw attention if there are unread notifications
    useEffect(() => {
        if (unreadCount === 0) return;
        const interval = setInterval(() => {
            triggerBellWobble();
        }, 5000);
        return () => clearInterval(interval);
    }, [unreadCount]);

    // Tutup dropdown saat klik di luar
    useEffect(() => {
        function handleClickOutside(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';
    const activeRole = user?.primaryRole || user?.role;
    const roleLabel = ROLE_LABELS[activeRole] || activeRole || 'User';

    return (
        <header
            className={`
                sticky top-0 z-40 bg-card border-b border-border
                flex items-center gap-4 px-6 py-3
                transition-all duration-250
                ${sidebarCollapsed ? "ml-16" : "ml-60"}
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
                    value={searchVal}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-10 py-2 bg-surface border border-border rounded-lg
                               text-sm text-text-primary placeholder:text-text-muted
                               focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                               transition-all"
                />
                {searchVal && (
                    <button 
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 rounded-full hover:bg-surface-hover transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* ── Right Section ──────────────────────────────────────── */}
            <div className="flex items-center gap-4 ml-auto">
                {/* ── Role-specific action buttons ──────────────────────── */}
                {actions}

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
                                notifications={notifications}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Help Icon ─────────────────────────────────────────── */}
                <button
                    className="p-2 rounded-lg text-text-secondary hover:bg-surface
                                   hover:text-text-primary transition-colors"
                >
                    <HelpCircle size={20} />
                </button>

                {/* ── Profile ───────────────────────────────────────────── */}
                <div className="flex items-center gap-3 pl-3 border-l border-border">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-text-primary leading-tight">
                            {user?.name || "User"}
                        </p>
                        <p className="text-[11px] text-text-muted uppercase tracking-wide">
                            {roleLabel}
                        </p>
                    </div>
                    <div
                        className="w-9 h-9 rounded-full bg-primary-500 text-white
                                    flex items-center justify-center font-bold text-sm shrink-0"
                    >
                        {initial}
                    </div>
                </div>
            </div>
        </header>
    );
}
