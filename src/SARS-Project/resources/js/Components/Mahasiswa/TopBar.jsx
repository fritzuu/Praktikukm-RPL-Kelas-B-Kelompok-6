import { useState, useRef, useEffect, useMemo } from 'react';
import {
    Search,
    Bell,
    Settings,
    HelpCircle,
    X,
    Calendar,
} from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import MahasiswaNotificationDropdown from './NotificationDropdown';
import HelpModal from '../Shared/HelpModal';

export default function MahasiswaTopBar({ user, sidebarCollapsed }) {
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

    const notifRef = useRef(null);
    const searchRef = useRef(null);

    const { url, component, props } = usePage();
    
    const isRequestsTab = component === 'Dashboard/Mahasiswa/Requests' || url?.startsWith('/mahasiswa/requests');
    const notifikasi = props.notifikasi || [];
    const unreadCount = props.unreadCount || 0;
    const schedules = props.schedules || [];

    useEffect(() => {
        function handleClickOutside(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Ctrl+K to search, ? for help
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

    const initial = user?.name?.charAt(0)?.toUpperCase() || 'M';

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return schedules.filter(s =>
            s.nama?.toLowerCase().includes(q) ||
            s.kode?.toLowerCase().includes(q) ||
            s.ruangan?.toLowerCase().includes(q) ||
            s.dosen?.toLowerCase().includes(q)
        ).slice(0, 5);
    }, [searchQuery, schedules]);

    return (
        <>
            <header
                className={`
                    sticky top-0 z-40 bg-card border-b border-border
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
                        placeholder="Cari jadwal, ruangan, atau mata kuliah..."
                        className="w-full pl-10 pr-16 py-2 bg-surface border border-border rounded-lg
                                   text-sm text-text-primary placeholder:text-text-muted
                                   focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                                   transition-all"
                    />
                    {!searchFocused && !searchQuery && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                            <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px] font-mono text-text-muted">Ctrl</kbd>
                            <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px] font-mono text-text-muted">K</kbd>
                        </div>
                    )}
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                        >
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
                                        <div
                                            key={item.id}
                                            onClick={() => {
                                                setSearchQuery('');
                                                try { router.get(route('mahasiswa.jadwal')); } catch {}
                                            }}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-surface transition-colors cursor-pointer border-b border-border/50 last:border-b-0"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                                                <Calendar size={14} className="text-primary-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-text-primary truncate">{item.nama}</p>
                                                <p className="text-[11px] text-text-muted">
                                                    {item.kode} • {item.ruangan} • {item.hari.toUpperCase()} Sesi {item.sesiMulai} ({item.mulai}-{item.selesai})
                                                </p>
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
                    {/* ── New Request Button ─────────────────────────────── */}
                    {!isRequestsTab && (
                        <button
                            onClick={() => {
                                try { router.get(route('mahasiswa.requests')); } catch {}
                            }}
                            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600
                                       text-white text-sm font-medium px-4 py-2 rounded-lg
                                       transition-colors duration-150 shrink-0"
                        >
                            <span className="text-lg leading-none">+</span>
                            <span className="hidden sm:inline">New Request</span>
                        </button>
                    )}

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
                            <MahasiswaNotificationDropdown
                                notifikasi={notifikasi}
                                unreadCount={unreadCount}
                                onClose={() => setNotifOpen(false)}
                            />
                        )}
                    </div>

                    {/* ── Help Icon ─────────────────────────────────────────── */}
                    <button
                        onClick={() => setHelpOpen(true)}
                        title="Bantuan (tekan ?)"
                        className="p-2 rounded-lg text-text-secondary hover:bg-surface
                                   hover:text-text-primary transition-colors"
                    >
                        <HelpCircle size={20} />
                    </button>

                    {/* ── Settings Icon ─────────────────────────────────────── */}
                    <button
                        onClick={() => {
                            try { router.get(route('mahasiswa.settings')); } catch {}
                        }}
                        className="p-2 rounded-lg text-text-secondary hover:bg-surface
                                   hover:text-text-primary transition-colors"
                    >
                        <Settings size={20} />
                    </button>

                    {/* ── Profile ───────────────────────────────────────────── */}
                    <div className="flex items-center gap-3 pl-3 border-l border-border">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-text-primary leading-tight">
                                {user?.name || 'Mahasiswa'}
                            </p>
                            <p className="text-[11px] text-text-muted uppercase tracking-wide">
                                Mahasiswa
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
