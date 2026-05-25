import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import MahasiswaSidebar from '../Components/Mahasiswa/Sidebar';
import MahasiswaTopBar from '../Components/Mahasiswa/TopBar';
import MahasiswaAiPanel from '../Components/Mahasiswa/AiAssistantPanel';
import MahasiswaAiAssistantFab from '../Components/Mahasiswa/AiAssistantFab';

export default function MahasiswaLayout({ children }) {
    const { auth, unreadCount } = usePage().props;
    const user = auth?.user;

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [aiPanelOpen, setAiPanelOpen] = useState(true);

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

    return (
        <div className="min-h-screen bg-surface font-sans">
            {/* ── Left Sidebar ────────────────────────────────────── */}
            <MahasiswaSidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                onAiToggle={() => setAiPanelOpen(!aiPanelOpen)}
                unreadCount={unreadCount}
            />

            {/* ── Top Bar ─────────────────────────────────────────── */}
            <MahasiswaTopBar
                user={user}
                sidebarCollapsed={sidebarCollapsed}
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
                {aiPanelOpen && (
                    <MahasiswaAiPanel
                        isOpen={aiPanelOpen}
                        onClose={() => setAiPanelOpen(false)}
                    />
                )}
            </div>

            {/* FAB when AI panel is closed */}
            {!aiPanelOpen && (
                <MahasiswaAiAssistantFab onClick={() => setAiPanelOpen(true)} />
            )}
        </div>
    );
}
