import { useState, useMemo, useEffect, useRef } from 'react';
import { Bell, BellOff, CheckCircle, Search } from 'lucide-react';
import NotificationCard from './NotificationCard.jsx';
import NotificationDetailModal from './NotificationDetailModal.jsx';
import ConfirmModal from './ConfirmModal.jsx';

/**
 * NotificationListPage — shared notification archive page component.
 *
 * Live data strategy:
 * - Initial data comes from Inertia props (server-rendered)
 * - When polling detects new notifications (`page:reload:notifications` event),
 *   we fetch the latest list directly from /api/notifications/list — NO Inertia
 *   router.reload() to avoid any role/route mismatch issues
 * - All read/delete actions update local state optimistically and notify the
 *   polling hook via `notifications:refresh` event
 */

const DEFAULT_FILTER_TABS = [
    { key: 'semua',        label: 'Semua' },
    { key: 'belum_dibaca', label: 'Belum Dibaca' },
    { key: 'jadwal',       label: 'Jadwal' },
    { key: 'validasi',     label: 'Validasi' },
    { key: 'info',         label: 'Informasi' },
    { key: 'sistem',       label: 'Sistem' },
];

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

function notifyBadgeRefresh() {
    window.dispatchEvent(new CustomEvent('notifications:refresh'));
}

export default function NotificationListPage({
    notifikasi   = [],
    readUrl,
    readAllUrl,
    deleteUrl,
    detailUrl,
    extraFilterTabs = [],
}) {
    const [items, setItems]                     = useState(notifikasi);
    const [activeFilter, setActiveFilter]       = useState('semua');
    const [searchQuery, setSearchQuery]         = useState('');
    const [modalOpen, setModalOpen]             = useState(false);
    const [activeNotifId, setActiveNotifId]     = useState(null);
    const [confirmOpen, setConfirmOpen]         = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading]     = useState(false);
    const fetchingRef                           = useRef(false);

    // ── Auto-refresh when polling detects new/changed notifications ──────────
    // Uses a direct fetch to /api/notifications/list — safe for all roles.
    // Does NOT use router.reload() to avoid Inertia route/role mismatches.
    useEffect(() => {
        const handler = async () => {
            if (fetchingRef.current) return;
            fetchingRef.current = true;
            try {
                const res = await fetch('/api/notifications/list', {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });
                if (!res.ok) return;
                const data = await res.json();
                if (Array.isArray(data.notifications)) {
                    setItems(data.notifications);
                }
            } catch (_) {}
            finally {
                fetchingRef.current = false;
            }
        };

        window.addEventListener('page:reload:notifications', handler);
        return () => window.removeEventListener('page:reload:notifications', handler);
    }, []);

    // ── Detail modal ─────────────────────────────────────────────────────────
    function openDetail(id) {
        setActiveNotifId(id);
        setModalOpen(true);
    }

    function closeModal() {
        const closingId = activeNotifId;
        setModalOpen(false);
        setActiveNotifId(null);
        if (closingId) {
            setItems(prev =>
                prev.map(n => String(n.id) === String(closingId) ? { ...n, dibaca: true } : n)
            );
        }
        notifyBadgeRefresh();
    }

    // ── Mark single as read ──────────────────────────────────────────────────
    function markAsRead(id) {
        setItems(prev => prev.map(n => String(n.id) === String(id) ? { ...n, dibaca: true } : n));
        notifyBadgeRefresh();
        if (!readUrl) return;
        fetch(`${readUrl}/${id}/read`, {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': csrfToken(), 'Accept': 'application/json' },
        }).catch(() => {});
    }

    // ── Mark all as read ─────────────────────────────────────────────────────
    function markAllAsRead() {
        setItems(prev => prev.map(n => ({ ...n, dibaca: true })));
        notifyBadgeRefresh();
        if (!readAllUrl) return;
        fetch(readAllUrl, {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': csrfToken(), 'Accept': 'application/json' },
        }).catch(() => {});
    }

    // ── Delete flow ──────────────────────────────────────────────────────────
    function requestDelete(id) {
        setPendingDeleteId(id);
        setConfirmOpen(true);
    }

    async function handleConfirmDelete() {
        if (!pendingDeleteId) return;
        setDeleteLoading(true);
        try {
            const res = await fetch(`${deleteUrl}/${pendingDeleteId}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrfToken(), 'Accept': 'application/json' },
            });
            const json = await res.json().catch(() => ({}));
            if (res.ok && json.success !== false) {
                setItems(prev => prev.filter(n => String(n.id) !== String(pendingDeleteId)));
                notifyBadgeRefresh();
            }
        } catch (_) {}
        finally {
            setDeleteLoading(false);
            setConfirmOpen(false);
            setPendingDeleteId(null);
        }
    }

    function handleCancelDelete() {
        setConfirmOpen(false);
        setPendingDeleteId(null);
    }

    // ── Filtering ────────────────────────────────────────────────────────────
    const filteredItems = useMemo(() => {
        let result = items;
        if (activeFilter === 'belum_dibaca') {
            result = result.filter(n => !n.dibaca);
        } else if (activeFilter !== 'semua') {
            result = result.filter(n => n.tipe === activeFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                n => n.judul?.toLowerCase().includes(q) || n.pesan?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [items, activeFilter, searchQuery]);

    const unreadCount = items.filter(n => !n.dibaca).length;

    const tabCounts = useMemo(() => {
        const counts = { semua: items.length, belum_dibaca: unreadCount };
        DEFAULT_FILTER_TABS.forEach(({ key }) => {
            if (!['semua', 'belum_dibaca'].includes(key)) {
                counts[key] = items.filter(n => n.tipe === key).length;
            }
        });
        extraFilterTabs.forEach(({ key }) => {
            counts[key] = items.filter(n => n.tipe === key).length;
        });
        return counts;
    }, [items, unreadCount, extraFilterTabs]);

    // ── Group by date ─────────────────────────────────────────────────────────
    const grouped = useMemo(() => {
        const groups = {};
        filteredItems.forEach(item => {
            const key = item.tanggal || 'Lainnya';
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });
        return Object.entries(groups);
    }, [filteredItems]);

    const allTabs = [...DEFAULT_FILTER_TABS, ...extraFilterTabs];

    return (
        <>
            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                        <Bell size={22} className="text-primary-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Notifikasi</h1>
                        <p className="text-sm text-text-muted mt-0.5">
                            {unreadCount > 0
                                ? `${unreadCount} notifikasi belum dibaca`
                                : 'Semua notifikasi sudah dibaca'}
                        </p>
                    </div>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600
                                   text-white text-sm font-medium rounded-lg transition-colors
                                   shadow-sm shadow-primary-500/20"
                    >
                        <CheckCircle size={16} />
                        <span className="hidden sm:inline">Tandai Semua Dibaca</span>
                    </button>
                )}
            </div>

            {/* ── Search Bar ──────────────────────────────────────────────── */}
            <div className="relative mb-4">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari notifikasi..."
                    className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl
                               text-sm text-text-primary placeholder:text-text-muted
                               focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                               transition-all"
                />
            </div>

            {/* ── Filter Tabs ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
                {allTabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveFilter(tab.key)}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 text-sm font-semibold
                            border-b-2 transition-all whitespace-nowrap
                            ${activeFilter === tab.key
                                ? 'border-primary-500 text-primary-500'
                                : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
                            }
                        `}
                    >
                        {tab.label}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            activeFilter === tab.key
                                ? 'bg-primary-500 text-white'
                                : 'bg-surface text-text-muted'
                        }`}>
                            {tabCounts[tab.key] ?? 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Notification List ─────────────────────────────────────────── */}
            {grouped.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <BellOff size={48} className="text-text-muted mx-auto mb-4" />
                    <p className="text-text-secondary font-medium text-lg">Tidak ada notifikasi</p>
                    <p className="text-text-muted text-sm mt-1">
                        {searchQuery ? 'Coba kata kunci lain.' : 'Notifikasi baru akan muncul di sini.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {grouped.map(([date, notifs]) => (
                        <div key={date}>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 px-1">
                                {date}
                            </p>
                            <div className="space-y-2">
                                {notifs.map(notif => (
                                    <NotificationCard
                                        key={notif.id}
                                        notif={notif}
                                        onOpenDetail={openDetail}
                                        onMarkRead={markAsRead}
                                        onDelete={deleteUrl ? requestDelete : undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Modals ───────────────────────────────────────────────────── */}
            <NotificationDetailModal
                open={modalOpen}
                onClose={closeModal}
                notificationId={activeNotifId}
                detailUrl={detailUrl}
            />

            <ConfirmModal
                open={confirmOpen}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                loading={deleteLoading}
                title="Hapus Notifikasi?"
                description="Notifikasi yang dihapus tidak akan muncul lagi pada halaman notifikasi."
                confirmLabel="Hapus"
                cancelLabel="Batal"
            />
        </>
    );
}
