import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Bell, Calendar, AlertTriangle, CheckCircle, Info, Settings, Trash2 } from 'lucide-react';
import DoubleCheck from '../../Components/Shared/DoubleCheck.jsx';

import NotificationDetailModal from '../../Components/Shared/NotificationDetailModal.jsx';
import ConfirmModal from '../../Components/Shared/ConfirmModal.jsx';

const ICON_MAP = {
  jadwal:   Calendar,
  validasi: AlertTriangle,
  sistem:   Settings,
  info:     Info,
  success:  CheckCircle,
};

function tipeToIcon(tipe) {
  return ICON_MAP[tipe] || Info;
}

export default function NotificationPage({ notifications = [], unreadCount = 0 }) {
  const notifData = notifications?.data || notifications;

  const [notifs, setNotifs]         = useState(notifData || []);
  const [modalOpen, setModalOpen]   = useState(false);
  const [activeId, setActiveId]     = useState(null);
  const [error, setError]           = useState(null);

  // Confirm-delete state
  const [confirmOpen, setConfirmOpen]       = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);

  useEffect(() => {
    setNotifs(notifData || []);
  }, [notifications]);

  // ── Mark all as read ──────────────────────────────────────────────────────
  const markAllAsRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, dibaca: true })));
    fetch('/notifications/read-all', {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
        Accept: 'application/json',
      },
    })
      .then(() => router.reload({ only: ['auth', 'notifikasi', 'unreadCount'] }))
      .catch(() => {});
  };

  // ── Mark as read ──────────────────────────────────────────────────────────
  const markAsRead = (notifId) => {
    setNotifs((prev) => prev.map((n) => String(n.id) === String(notifId) ? { ...n, dibaca: true } : n));
    fetch(`/notifications/${notifId}/read`, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
        Accept: 'application/json',
      },
    })
      .then(() => router.reload({ only: ['auth', 'notifikasi', 'unreadCount'] }))
      .catch(() => {});
  };

  // ── Detail modal ───────────────────────────────────────────────────────────
  const openDetail = (notifId) => {
    setActiveId(notifId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    // Sync bell badge + sidebar badge with server state
    router.reload({ only: ['auth', 'notifikasi', 'unreadCount'] });
  };

  // ── Delete flow ────────────────────────────────────────────────────────────
  /** Step 1 — user clicks the X icon → open confirm modal */
  const requestDelete = (notifId) => {
    setPendingDeleteId(notifId);
    setConfirmOpen(true);
  };

  /** Step 2 — user clicks "Hapus" in confirm modal → execute delete */
  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    setError(null);
    setDeleteLoading(true);

    try {
      const res = await fetch(`/notifications/${pendingDeleteId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
          Accept: 'application/json',
        },
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success !== false) {
        setNotifs((prev) => prev.filter((n) => String(n.id) !== String(pendingDeleteId)));
      } else {
        setError(json.message || 'Gagal menghapus notifikasi.');
      }
    } catch (e) {
      setError(e?.message || 'Gagal menghapus notifikasi.');
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  /** Step 3 — user clicks "Batal" in confirm modal */
  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  // ──────────────────────────────────────────────────────────────────────────

  const localUnreadCount = notifs.filter(n => !n.dibaca).length;

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={22} className="text-text-primary" />
            <h1 className="text-xl font-bold text-text-primary">Notifikasi</h1>
            {localUnreadCount > 0 && (
              <span className="text-[10px] font-bold bg-danger/10 text-danger px-2.5 py-1 rounded-full">
                {localUnreadCount} baru
              </span>
            )}
          </div>
          {localUnreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-primary-500/20"
            >
              <CheckCircle size={16} />
              <span className="hidden sm:inline">Tandai Semua Dibaca</span>
            </button>
          )}
        </div>
      </section>

      {/* ── Notification List ────────────────────────────────────────────── */}
      <div className="space-y-2">
        {notifs?.length > 0 ? (
          notifs.map((notif) => {
            const Icon = tipeToIcon(notif.tipe);
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  bg-card border border-border rounded-xl px-5 py-4
                  flex items-start gap-4 transition-all hover:shadow-sm
                  ${!notif.dibaca ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''}
                `}
              >
                {/* Icon */}
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                  ${!notif.dibaca ? 'bg-primary-500/10 text-primary-500' : 'bg-surface text-text-muted'}
                `}>
                  <Icon size={18} />
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-sm leading-tight ${!notif.dibaca ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'}`}>
                      {notif.judul}
                    </h3>
                    <span className="text-[10px] text-text-muted">{notif.waktu || notif.created_at || '-'}</span>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed">{notif.pesan}</p>

                  {notif.request_id && (
                    <p className="text-[10px] text-text-muted mt-2">Request: {notif.request_id}</p>
                  )}

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openDetail(notif.id)}
                      className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      Lihat detail
                    </button>
                    {!notif.dibaca && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notif.id)}
                        className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
                      >
                        <DoubleCheck size={12} /> Tandai dibaca
                      </button>
                    )}
                  </div>
                </div>

                {/* Delete — only visible when read */}
                {notif.dibaca && (
                  <button
                    type="button"
                    onClick={() => requestDelete(notif.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger transition-colors shrink-0"
                    aria-label="Hapus notifikasi"
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Bell size={32} className="mx-auto text-text-muted mb-3" />
            <p className="text-sm text-text-muted">Belum ada notifikasi</p>
          </div>
        )}
      </div>

      {/* Inline error (network/server failures) */}
      {error && (
        <div className="mt-4 text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* ── Detail Modal ────────────────────────────────────────────────── */}
      <NotificationDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        notificationId={activeId}
        initialPayload={null}
      />

      {/* ── Confirm Delete Modal ─────────────────────────────────────────── */}
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
