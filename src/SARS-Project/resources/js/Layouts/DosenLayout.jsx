import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '../Components/Dosen/Sidebar';
import TopBar from '../Components/Dosen/TopBar';
import AiAssistantPanel from '../Components/Dosen/AiAssistantPanel';
import AiAssistantFab from '../Components/Dosen/AiAssistantFab';

export default function DosenLayout({ children }) {
    const { auth, notifikasi } = usePage().props;
    const user = auth?.user;

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [aiPanelOpen, setAiPanelOpen] = useState(true);

    // Auto-collapse based on breakpoint
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

    return (
        <div className="min-h-screen bg-surface font-sans">
            {/* ── Left Sidebar ────────────────────────────────────── */}
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* ── Top Bar ─────────────────────────────────────────── */}
            <TopBar
                user={user}
                sidebarCollapsed={sidebarCollapsed}
                notifikasi={notifikasi}
            />

            {/* ── Main Content + AI Panel ─────────────────────────── */}
            <div
                className={`
                    flex transition-all duration-250
                    ${sidebarCollapsed ? 'ml-16' : 'ml-60'}
                `}
            >
                {/* Main content area */}
                <main className="flex-1 min-w-0 p-6 pt-20">
                    {children}
                </main>

                {/* Right AI Panel */}
                {aiPanelOpen && (
                    <AiAssistantPanel
                        isOpen={aiPanelOpen}
                        onClose={() => setAiPanelOpen(false)}
                    />
                )}
            </div>

            {/* FAB when AI panel is closed */}
            {!aiPanelOpen && (
                <AiAssistantFab onClick={() => setAiPanelOpen(true)} />
            )}
        </div>
    );
}
