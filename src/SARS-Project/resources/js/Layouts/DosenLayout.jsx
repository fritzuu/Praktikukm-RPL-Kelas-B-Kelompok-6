import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from '../Components/Dosen/Sidebar';
import TopBar from '../Components/Dosen/TopBar';
import AiAssistantPanel from '../Components/Shared/AiAssistantPanel';
import AiAssistantFab from '../Components/Shared/AiAssistantFab';
import useNotificationPoll from '../hooks/useNotificationPoll';
import Echo from '../echo';

export default function DosenLayout({ children }) {
    const { auth, unreadCount: initialUnread, notifikasi: initialNotifs } = usePage().props;
    const user = auth?.user;

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [aiPanelOpen, setAiPanelOpen] = useState(true);

    // ── Live notification polling ────────────────────────────────────────────
    const { unreadCount, notifications } = useNotificationPoll({
        unreadCount:   initialUnread ?? 0,
        notifications: initialNotifs ?? auth?.notifications ?? [],
    });

    // Auto-collapse berdasarkan breakpoint
    useEffect(() => {
        const mediaLg = window.matchMedia('(max-width: 1024px)');
        const mediaMd = window.matchMedia('(max-width: 768px)');

        function handleResize() {
            if (mediaMd.matches) {
                setSidebarCollapsed(true);
                setAiPanelOpen(false);
            } else if (mediaLg.matches) {
                setSidebarCollapsed(false);
                setAiPanelOpen(false);
            } else {
                setAiPanelOpen(true);
            }
        }

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle Theme Persistence
    useEffect(() => {
        const theme = localStorage.getItem('theme') || 'light';
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // WebSocket: listen for database sync events
    useEffect(() => {
        const handleDatabaseSync = (event) => {
            console.log('[Dosen] Database sync:', event);
            window.dispatchEvent(new CustomEvent('notifications:refresh'));
        };

        window.addEventListener('database-sync', handleDatabaseSync);
        return () => window.removeEventListener('database-sync', handleDatabaseSync);
    }, []);

    return (
        <div className="min-h-screen bg-surface font-sans">
            {/* ── Left Sidebar ────────────────────────────────────── */}
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                unreadCount={unreadCount}
            />

            {/* ── Top Bar ─────────────────────────────────────────── */}
            <TopBar
                user={user}
                sidebarCollapsed={sidebarCollapsed}
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
                {/* Main content area */}
                <main className="flex-1 min-w-0 p-6">
                    {children}
                </main>

                {/* Right AI Panel */}
                <AnimatePresence>
                    {aiPanelOpen && (
                        <AiAssistantPanel
                            key="ai-panel"
                            isOpen={aiPanelOpen}
                            onClose={() => setAiPanelOpen(false)}
                            role="dosen"
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* FAB saat AI panel tertutup */}
            <AnimatePresence>
                {!aiPanelOpen && (
                    <AiAssistantFab key="ai-fab" onClick={() => setAiPanelOpen(true)} />
                )}
            </AnimatePresence>
        </div>
    );
}
