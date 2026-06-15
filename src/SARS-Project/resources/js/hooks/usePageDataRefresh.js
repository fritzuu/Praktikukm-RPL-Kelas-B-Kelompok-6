import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

/**
 * usePageDataRefresh
 *
 * Listens for a targeted `page:reload:*` CustomEvent dispatched by
 * useNotificationPoll when a data fingerprint changes on the server.
 *
 * When the event fires, triggers a partial Inertia reload of only the
 * specified props — keeping the rest of the page state intact.
 *
 * @param {string}   eventName   The CustomEvent name to listen for.
 *                               e.g. 'page:reload:pending-aslab'
 * @param {string[]} onlyProps   Inertia prop keys to reload.
 *                               e.g. ['pending', 'recent']
 *
 * Usage:
 *   // In AslabValidation page:
 *   usePageDataRefresh('page:reload:pending-aslab', ['pending', 'recent']);
 *
 *   // In AdminPersetujuan page:
 *   usePageDataRefresh('page:reload:pending-admin', ['pending', 'recent', 'insights']);
 *
 *   // In any Notifikasi page:
 *   usePageDataRefresh('page:reload:notifications', ['notifikasi']);
 */
export default function usePageDataRefresh(eventName, onlyProps) {
    // Guard against reload storms — if a reload is already in-flight, skip.
    const reloadingRef = useRef(false);

    useEffect(() => {
        const handler = () => {
            if (reloadingRef.current) return;
            reloadingRef.current = true;

            router.reload({
                only: onlyProps,
                preserveScroll: true,
                onFinish: () => {
                    reloadingRef.current = false;
                },
            });
        };

        window.addEventListener(eventName, handler);
        return () => window.removeEventListener(eventName, handler);
    }, [eventName, onlyProps]);
}
