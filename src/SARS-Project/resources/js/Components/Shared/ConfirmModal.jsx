import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

/**
 * ConfirmModal — reusable destructive-action confirmation dialog.
 *
 * Usage:
 *   <ConfirmModal
 *     open={showConfirm}
 *     onConfirm={handleConfirmedDelete}
 *     onCancel={() => setShowConfirm(false)}
 *   />
 *
 * All text props are optional — defaults are sensible for a generic
 * "delete" scenario but every string is overridable.
 *
 * Props:
 *   open         {boolean}   Whether the modal is visible.
 *   onConfirm    {function}  Called when the user clicks the confirm button.
 *   onCancel     {function}  Called when user clicks Batal or the backdrop.
 *   title        {string}    Modal heading.  Default: "Hapus item?"
 *   description  {string}    Body text.      Default: generic delete warning.
 *   confirmLabel {string}    Confirm button text.  Default: "Hapus"
 *   cancelLabel  {string}    Cancel button text.   Default: "Batal"
 *   loading      {boolean}   Shows spinner on confirm button, disables both.
 *   icon         {ReactNode} Override the warning icon.
 *   variant      {string}    "danger" (default) | "warning"
 */
export default function ConfirmModal({
    open = false,
    onConfirm,
    onCancel,
    title       = 'Hapus item?',
    description = 'Tindakan ini tidak dapat dibatalkan.',
    confirmLabel = 'Hapus',
    cancelLabel  = 'Batal',
    loading      = false,
    icon,
    variant      = 'danger',
}) {
    // Lock body scroll while open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    // Escape key to cancel
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (e.key === 'Escape' && !loading) onCancel?.();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, loading, onCancel]);

    const variantStyles = {
        danger:  { icon: 'bg-danger/10 text-danger',  btn: 'bg-danger hover:bg-danger/90 focus-visible:ring-danger/40' },
        warning: { icon: 'bg-warning/10 text-warning', btn: 'bg-warning hover:bg-warning/90 focus-visible:ring-warning/40' },
    };
    const styles = variantStyles[variant] ?? variantStyles.danger;

    const DefaultIcon = <AlertTriangle size={26} />;

    return createPortal(
        <AnimatePresence>
            {open && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-modal-title"
                    aria-describedby="confirm-modal-desc"
                >
                    {/* ── Backdrop ──────────────────────────────────────────── */}
                    <motion.div
                        key="confirm-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
                        onClick={() => !loading && onCancel?.()}
                    />

                    {/* ── Panel ─────────────────────────────────────────────── */}
                    <motion.div
                        key="confirm-panel"
                        initial={{ opacity: 0, scale: 0.94, y: 12 }}
                        animate={{ opacity: 1, scale: 1,    y: 0  }}
                        exit={{    opacity: 0, scale: 0.94, y: 12 }}
                        transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
                        className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="px-6 pt-6 pb-5 text-center">
                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-2xl ${styles.icon} flex items-center justify-center mx-auto mb-4`}>
                                {icon ?? DefaultIcon}
                            </div>

                            {/* Title */}
                            <h3
                                id="confirm-modal-title"
                                className="text-base font-bold text-text-primary mb-1"
                            >
                                {title}
                            </h3>

                            {/* Description */}
                            <p
                                id="confirm-modal-desc"
                                className="text-sm text-text-secondary leading-relaxed"
                            >
                                {description}
                            </p>
                        </div>

                        {/* ── Actions ───────────────────────────────────────── */}
                        <div className="flex items-center gap-2 px-6 pb-5">
                            {/* Cancel */}
                            <button
                                type="button"
                                onClick={() => !loading && onCancel?.()}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl
                                           text-sm font-semibold text-text-primary
                                           hover:bg-card transition-colors
                                           disabled:opacity-50 disabled:cursor-not-allowed
                                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
                            >
                                {cancelLabel}
                            </button>

                            {/* Confirm */}
                            <button
                                type="button"
                                onClick={() => !loading && onConfirm?.()}
                                disabled={loading}
                                className={`flex-1 px-4 py-2.5 ${styles.btn} rounded-xl
                                            text-sm font-semibold text-white
                                            transition-colors
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            flex items-center justify-center gap-2
                                            focus-visible:outline-none focus-visible:ring-2`}
                            >
                                {loading ? (
                                    <>
                                        <span
                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                            aria-hidden="true"
                                        />
                                        <span>Menghapus…</span>
                                    </>
                                ) : (
                                    confirmLabel
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
