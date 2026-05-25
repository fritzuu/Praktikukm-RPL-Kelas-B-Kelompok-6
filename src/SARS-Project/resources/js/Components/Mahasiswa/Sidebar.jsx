import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Calendar,
    FileText,
    Bell,
    Settings,
    Bot,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import LogoutModal from '../Shared/LogoutModal';

const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, route: 'mahasiswa.dashboard' },
    { label: 'Jadwal', icon: Calendar, route: 'mahasiswa.jadwal' },
    { label: 'Requests', icon: FileText, route: 'mahasiswa.requests' },
    { label: 'Notifikasi', icon: Bell, route: 'mahasiswa.notifications' },
    { label: 'Pengaturan', icon: Settings, route: 'mahasiswa.settings' },
];

export default function MahasiswaSidebar({ isCollapsed, onToggle, onAiToggle, unreadCount = 0 }) {
    const { url } = usePage();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    function isActive(routeName) {
        try {
            const routePath = route(routeName);
            return url.startsWith(new URL(routePath).pathname);
        } catch {
            return url.includes(routeName.replace('mahasiswa.', '/mahasiswa/'));
        }
    }

    function handleNav(routeName) {
        try {
            router.get(route(routeName));
        } catch {
            console.warn(`Route "${routeName}" belum terdaftar.`);
        }
    }

    return (
        <aside
            className={`
                group sidebar-transition flex flex-col bg-sidebar text-white
                fixed top-0 left-0 h-screen z-40
                ${isCollapsed ? 'w-16' : 'w-60'}
            `}
        >
            {/* ── Collapse Toggle ─────────────────────────────────── */}
            <button
                onClick={onToggle}
                title={isCollapsed ? 'Perbesar' : 'Perkecil'}
                className="opacity-0 scale-50 invisible group-hover:scale-100 group-hover:opacity-100 group-hover:visible absolute top-1/2 -translate-y-1/2 -right-3.5 z-50 w-7 h-7 bg-primary-500 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-primary-600 hover:!scale-110 shadow-lg transition-all duration-300"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* ── Branding ─────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-4 pt-6 pb-4">
                <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center font-bold text-sm shrink-0">
                    S
                </div>
                {!isCollapsed && (
                    <div className="overflow-hidden">
                        <p className="font-bold text-sm tracking-wide leading-tight">Scholar Logic</p>
                        <p className="text-[10px] text-white/50 uppercase tracking-widest">
                            Student Portal
                        </p>
                    </div>
                )}
            </div>

            {/* ── Navigation ───────────────────────────────────────── */}
            <nav className="flex-1 px-2 mt-2 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.route);
                    const Icon = item.icon;
                    const showBadge = item.route === 'mahasiswa.notifications' && unreadCount > 0;
                    return (
                        <button
                            key={item.route}
                            onClick={() => handleNav(item.route)}
                            title={isCollapsed ? item.label : undefined}
                            className={`
                                group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                text-sm font-medium transition-all duration-150
                                ${active
                                    ? 'bg-primary-500/20 text-white border-l-[3px] border-white'
                                    : 'text-white/60 hover:bg-sidebar-hover hover:text-white border-l-[3px] border-transparent'
                                }
                                ${isCollapsed ? 'justify-center' : ''}
                            `}
                        >
                            <Icon size={20} className="shrink-0" />
                            {!isCollapsed && <span>{item.label}</span>}
                            {showBadge && !isCollapsed && (
                                <span className="ml-auto bg-danger text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                            {showBadge && isCollapsed && (
                                <span className="absolute -top-1 -right-1 bg-danger text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* ── Bottom Section ────────────────────────────────────── */}
            <div className="px-2 pb-4 space-y-1">
                {/* AI Assistant Toggle */}
                <button
                    onClick={onAiToggle}
                    title={isCollapsed ? 'AI Assistant' : undefined}
                    className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                        text-sm font-medium text-white/60
                        hover:bg-primary-500/20 hover:text-white transition-all duration-150
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                >
                    <Bot size={20} className="shrink-0" />
                    {!isCollapsed && <span>AI Assistant</span>}
                </button>

                {/* Logout */}
                <button
                    onClick={() => setShowLogoutModal(true)}
                    title={isCollapsed ? 'Keluar' : undefined}
                    className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                        text-sm font-medium text-white/60
                        hover:bg-danger/20 hover:text-danger transition-all duration-150
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                >
                    <LogOut size={20} className="shrink-0" />
                    {!isCollapsed && <span>Keluar</span>}
                </button>
            </div>

            <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
        </aside>
    );
}
