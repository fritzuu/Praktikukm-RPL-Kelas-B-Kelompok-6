import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { AnimatePresence } from 'framer-motion';
import AppLayout from './AppLayout';
import AiAssistantPanel from '../Components/Shared/AiAssistantPanel';
import AiAssistantFab from '../Components/Shared/AiAssistantFab';
import {
    MAHASISWA_NAV_ITEMS,
    MAHASISWA_BRANDING,
} from '../Components/Mahasiswa/MahasiswaNavConfig';

export default function MahasiswaLayout({ children }) {
    const { url, component } = usePage();
    const [aiPanelOpen, setAiPanelOpen] = useState(true);

    const isRequestsTab = component === 'Dashboard/Mahasiswa/Requests' || url?.startsWith('/mahasiswa/requests');

    // Auto-collapse AI panel based on breakpoint
    useEffect(() => {
        const mediaLg = window.matchMedia('(max-width: 1024px)');
        const mediaMd = window.matchMedia('(max-width: 768px)');

        function handleResize() {
            if (mediaMd.matches) {
                setAiPanelOpen(false);
            } else if (mediaLg.matches) {
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
            console.log('[Mahasiswa] Database sync:', event);
            window.dispatchEvent(new CustomEvent('notifications:refresh'));
        };

        window.addEventListener('database-sync', handleDatabaseSync);
        return () => window.removeEventListener('database-sync', handleDatabaseSync);
    }, []);

    const topBarActions = !isRequestsTab && (
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
    );

    const aiPanelSlot = (
        <AnimatePresence>
            {aiPanelOpen && (
                <AiAssistantPanel
                    key="mahasiswa-ai-panel"
                    isOpen={aiPanelOpen}
                    onClose={() => setAiPanelOpen(false)}
                    role="mahasiswa"
                />
            )}
        </AnimatePresence>
    );

    const aiFabSlot = (
        <AnimatePresence>
            {!aiPanelOpen && (
                <AiAssistantFab key="mahasiswa-ai-fab" onClick={() => setAiPanelOpen(true)} />
            )}
        </AnimatePresence>
    );

    return (
        <AppLayout
            navItems={MAHASISWA_NAV_ITEMS}
            branding={MAHASISWA_BRANDING}
            topBarActions={topBarActions}
            aiPanel={aiPanelSlot}
            aiFab={aiFabSlot}
        >
            {children}
        </AppLayout>
    );
}
