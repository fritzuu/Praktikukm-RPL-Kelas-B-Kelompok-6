import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '../Components/Shared/Sidebar';
import TopBar from '../Components/Shared/TopBar';

export default function AppLayout({ navItems, branding, topBarActions, children, aiPanel, aiFab }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
            />

            {/* ── Top Bar ─────────────────────────────────────────── */}
            <TopBar
                user={user}
                sidebarCollapsed={sidebarCollapsed}
                actions={topBarActions}
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
