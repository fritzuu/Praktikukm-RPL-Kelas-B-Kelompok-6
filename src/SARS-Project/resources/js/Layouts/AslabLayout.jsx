import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from '../Components/Aslab/Sidebar';
import TopBar from '../Components/Aslab/TopBar';
import AiAssistantPanel from '../Components/Shared/AiAssistantPanel';
import AiAssistantFab from '../Components/Shared/AiAssistantFab';

export default function AslabLayout({ children }) {
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
                <AnimatePresence>
                    {aiPanelOpen && (
                        <AiAssistantPanel
                            key="ai-panel"
                            isOpen={aiPanelOpen}
                            onClose={() => setAiPanelOpen(false)}
                            role="aslab"
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* FAB when AI panel is closed */}
            <AnimatePresence>
                {!aiPanelOpen && (
                    <AiAssistantFab key="ai-fab" onClick={() => setAiPanelOpen(true)} />
                )}
            </AnimatePresence>
        </div>
    );
}
