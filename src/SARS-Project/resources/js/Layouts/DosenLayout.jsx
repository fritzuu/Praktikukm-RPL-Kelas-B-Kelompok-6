import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import AppLayout from './AppLayout';
import AiAssistantPanel from '../Components/Shared/AiAssistantPanel';
import AiAssistantFab from '../Components/Shared/AiAssistantFab';
import {
    DOSEN_NAV_ITEMS,
    DOSEN_BRANDING,
} from '../Components/Dosen/DosenNavConfig';

export default function DosenLayout({ children }) {
    const [aiPanelOpen, setAiPanelOpen] = useState(true);

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
            console.log('[Dosen] Database sync:', event);
            window.dispatchEvent(new CustomEvent('notifications:refresh'));
        };

        window.addEventListener('database-sync', handleDatabaseSync);
        return () => window.removeEventListener('database-sync', handleDatabaseSync);
    }, []);

    const aiPanelSlot = (
        <AnimatePresence>
            {aiPanelOpen && (
                <AiAssistantPanel
                    key="dosen-ai-panel"
                    isOpen={aiPanelOpen}
                    onClose={() => setAiPanelOpen(false)}
                    role="dosen"
                />
            )}
        </AnimatePresence>
    );

    const aiFabSlot = (
        <AnimatePresence>
            {!aiPanelOpen && (
                <AiAssistantFab key="dosen-ai-fab" onClick={() => setAiPanelOpen(true)} />
            )}
        </AnimatePresence>
    );

    return (
        <AppLayout
            navItems={DOSEN_NAV_ITEMS}
            branding={DOSEN_BRANDING}
            aiPanel={aiPanelSlot}
            aiFab={aiFabSlot}
        >
            {children}
        </AppLayout>
    );
}
