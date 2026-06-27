import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '../Components/Shared/Sidebar';
import TopBar from '../Components/Shared/TopBar';
import useNotificationPoll from '../hooks/useNotificationPoll';

export default function AppLayout({ navItems, branding, topBarActions, children, aiPanel, aiFab }) {
    const { auth, unreadCount: initialUnread, notifikasi: initialNotifs, pendingAdminCount: initialPendingAdmin, pendingAslabCount: initialPendingAslab } = usePage().props;
    const user = auth?.user;

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // ── Live notification polling ────────────────────────────────────────────
    const { unreadCount, pendingAdminCount, pendingAslabCount, notifications } = useNotificationPoll({
        unreadCount:       initialUnread        ?? 0,
        pendingAdminCount: initialPendingAdmin  ?? 0,
        pendingAslabCount: initialPendingAslab  ?? 0,
        notifications:     initialNotifs        ?? auth?.notifications ?? [],
    });

    // Auto-collapse berdasarkan breakpoint
    useEffect(() => {
        const mediaLg = window.matchMedia('(max-width: 1024px)');
        const mediaMd = window.matchMedia('(max-width: 768px)');

        function handleResize() {
            if (mediaMd.matches) {
                setSidebarCollapsed(true);
            } else if (mediaLg.matches) {
                setSidebarCollapsed(false);
            }
        }

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-surface font-sans">
            {/* ── Left Sidebar ────────────────────────────────────── */}
            <Sidebar
                navItems={navItems}
                branding={branding}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                pendingAdminCount={pendingAdminCount}
                pendingAslabCount={pendingAslabCount}
                unreadCount={unreadCount}
            />

            {/* ── Top Bar ─────────────────────────────────────────── */}
            <TopBar
                user={user}
                sidebarCollapsed={sidebarCollapsed}
                actions={topBarActions}
                unreadCount={unreadCount}
                notifications={notifications}
            />

            {/* ── Main Content + AI Panel ─────────────────────────── */}
            <div
                className={`
                    flex transition-all duration-250
                    ${sidebarCollapsed ? 'ml-16' : 'ml-60'}
                `}
            >
                <main className="flex-1 min-w-0 p-6">
                    {children}
                </main>

                {/* Right AI Panel slot */}
                {aiPanel}
            </div>

            {/* FAB slot (renders at root level for fixed positioning) */}
            {aiFab}
        </div>
    );
}
