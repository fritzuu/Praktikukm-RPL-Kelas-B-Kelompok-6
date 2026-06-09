import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useNotificationPoll
 *
 * Polls GET /api/poll every `intervalMs` ms. Handles two concerns:
 *
 * 1. Badge/dropdown freshness — updates unreadCount, pendingCounts, notifications
 *    in layout state so TopBar and Sidebar re-render immediately.
 *
 * 2. Page content freshness — when the server signals that a data set changed
 *    (via fingerprint), dispatches a targeted CustomEvent so the currently
 *    visible page can reload only its own Inertia props without a full nav.
 *
 * Dispatched events:
 *   `page:reload:pending-aslab`   → Aslab/Validation listens → reload pending list
 *   `page:reload:pending-admin`   → Admin/Persetujuan listens → reload pending list
 *   `page:reload:notifications`   → Any Notifikasi page listens → reload notif list
 *   `page:reload:my-requests`     → Mahasiswa/Requests listens → reload request statuses
 *   `notifications:refresh`       → Sent by notification pages; triggers forceRefresh
 */
export default function useNotificationPoll(initialData = {}, intervalMs = 30_000) {
    const [state, setState] = useState({
        unreadCount:       initialData.unreadCount       ?? 0,
        pendingAslabCount: initialData.pendingAslabCount ?? 0,
        pendingAdminCount: initialData.pendingAdminCount ?? 0,
        notifications:     initialData.notifications     ?? [],
    });

    // Store last-known fingerprints to detect changes between polls
    const fingerprintRef = useRef({
        pendingAslab:  null,
        pendingAdmin:  null,
        notifications: null,
        myRequests:    null,
    });

    const timerRef  = useRef(null);
    const isMounted = useRef(true);

    const doPoll = useCallback(async () => {
        if (document.visibilityState === 'hidden') return;

        try {
            const res = await fetch('/api/poll', {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });

            if (!res.ok || !isMounted.current) return;

            const data = await res.json();
            if (!isMounted.current) return;

            // ── Update badge/dropdown state ──────────────────────────────
            setState(prev => {
                if (
                    prev.unreadCount       === data.unreadCount       &&
                    prev.pendingAslabCount === data.pendingAslabCount &&
                    prev.pendingAdminCount === data.pendingAdminCount &&
                    prev.notifications.length === (data.notifications?.length ?? 0)
                ) {
                    return prev;
                }
                return {
                    unreadCount:       data.unreadCount       ?? prev.unreadCount,
                    pendingAslabCount: data.pendingAslabCount ?? prev.pendingAslabCount,
                    pendingAdminCount: data.pendingAdminCount ?? prev.pendingAdminCount,
                    notifications:     data.notifications     ?? prev.notifications,
                };
            });

            // ── Fingerprint-based targeted page reloads ──────────────────
            // On the very first poll (fingerprints are null), just record the
            // baseline without dispatching — avoids a reload on mount.
            const fp = data.fingerprints ?? {};
            const prev = fingerprintRef.current;

            const isFirstPoll =
                prev.pendingAslab  === null &&
                prev.pendingAdmin  === null &&
                prev.notifications === null;

            if (isFirstPoll) {
                fingerprintRef.current = {
                    pendingAslab:  fp.pendingAslab  ?? null,
                    pendingAdmin:  fp.pendingAdmin  ?? null,
                    notifications: fp.notifications ?? null,
                    myRequests:    fp.myRequests    ?? null,
                };
                return;
            }

            // Aslab validation queue changed
            if (fp.pendingAslab !== undefined && fp.pendingAslab !== prev.pendingAslab) {
                fingerprintRef.current.pendingAslab = fp.pendingAslab;
                window.dispatchEvent(new CustomEvent('page:reload:pending-aslab'));
            }

            // Admin approval queue changed
            if (fp.pendingAdmin !== undefined && fp.pendingAdmin !== prev.pendingAdmin) {
                fingerprintRef.current.pendingAdmin = fp.pendingAdmin;
                window.dispatchEvent(new CustomEvent('page:reload:pending-admin'));
            }

            // Notification list changed (new notif arrived or read-state changed)
            if (fp.notifications !== undefined && fp.notifications !== prev.notifications) {
                fingerprintRef.current.notifications = fp.notifications;
                window.dispatchEvent(new CustomEvent('page:reload:notifications'));
            }

            // Mahasiswa's own request statuses changed (admin/aslab made a decision)
            if (fp.myRequests !== undefined && fp.myRequests !== prev.myRequests) {
                fingerprintRef.current.myRequests = fp.myRequests;
                window.dispatchEvent(new CustomEvent('page:reload:my-requests'));
            }

        } catch (_) {
            // Network errors are silent
        }
    }, []);

    const scheduleNext = useCallback(() => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            doPoll().then(scheduleNext);
        }, intervalMs);
    }, [doPoll, intervalMs]);

    const forceRefresh = useCallback(() => {
        clearTimeout(timerRef.current);
        doPoll().then(scheduleNext);
    }, [doPoll, scheduleNext]);

    useEffect(() => {
        isMounted.current = true;

        // Poll immediately on mount
        doPoll().then(scheduleNext);

        // Listen for imperative refresh requests from notification pages
        const handleRefreshEvent = () => forceRefresh();
        window.addEventListener('notifications:refresh', handleRefreshEvent);

        // Resume polling when tab becomes visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') forceRefresh();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isMounted.current = false;
            clearTimeout(timerRef.current);
            window.removeEventListener('notifications:refresh', handleRefreshEvent);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [doPoll, scheduleNext, forceRefresh]);

    return { ...state, forceRefresh };
}
