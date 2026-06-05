import { Calendar, CheckCircle, AlertTriangle, Bell as BellIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { router } from '@inertiajs/react';

const TYPE_ICONS = {
    jadwal: CheckCircle,
    validasi: AlertTriangle,
    info: BellIcon,
};

const dropdownVariants = {
    hidden: { 
        opacity: 0, 
        scale: 0.92, 
        y: -10 
    },
    visible: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: { 
            type: 'spring', 
            stiffness: 400, 
            damping: 30,
            mass: 0.8
        }
    },
    exit: { 
        opacity: 0, 
        scale: 0.95, 
        y: -6,
        transition: { 
            duration: 0.15, 
            ease: 'easeOut' 
        }
    }
};

const listVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.05,
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -12 },
    visible: { 
        opacity: 1, 
        x: 0,
        transition: { type: 'spring', stiffness: 300, damping: 25 }
    }
};

export default function MahasiswaNotificationDropdown({ onClose, notifikasi = [] }) {
    const items = notifikasi || [];

    const unreadCount = items.filter(n => !n.dibaca).length;

    function handleMarkAllRead() {
        fetch(route('notifications.readAll'), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                'Accept': 'application/json',
            },
        }).then(() => {
            router.reload({ only: ['notifikasi', 'unreadCount', 'auth'] });
        }).catch(() => {});
    }

    function handleNotifClick(notif) {
        if (!notif.dibaca) {
            fetch(route('notifications.read', { id: notif.id }), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    'Accept': 'application/json',
                },
            }).then(() => {
                router.reload({ only: ['notifikasi', 'unreadCount', 'auth'] });
            }).catch(() => {});
        }
        try { router.get(route('mahasiswa.notifications')); } catch {}
        onClose();
    }

    return (
        <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ originX: 1, originY: 0 }}
            className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl border border-border shadow-lg shadow-black/5 overflow-hidden z-50"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-text-primary">Notifikasi</h3>
                {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-danger/10 text-danger px-2 py-0.5 rounded-full">
                        {unreadCount} baru
                    </span>
                )}
            </div>

            {/* Items */}
            <motion.div 
                variants={listVariants}
                className="max-h-64 overflow-y-auto"
            >
                {items.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-text-muted">
                        Belum ada notifikasi
                    </div>
                ) : (
                    items.slice(0, 3).map((notif) => {
                        const Icon = TYPE_ICONS[notif.tipe] || Calendar;
                        return (
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                key={notif.id}
                                onClick={() => handleNotifClick(notif)}
                                className={`
                                    flex items-start gap-3 px-4 py-3 hover:bg-surface transition-colors cursor-pointer
                                    ${!notif.dibaca ? 'bg-primary-50/50' : ''}
                                `}
                            >
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5
                                    ${!notif.dibaca ? 'bg-primary-500/10 text-primary-500' : 'bg-surface text-text-muted'}
                                `}>
                                    <Icon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm leading-tight ${!notif.dibaca ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                                        {notif.judul}
                                    </p>
                                    <p className="text-[11px] text-text-muted mt-0.5">{notif.waktu}</p>
                                </div>
                                <AnimatePresence>
                                    {!notif.dibaca && (
                                        <motion.div 
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" 
                                        />
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })
                )}
            </motion.div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border flex items-center justify-between">
                <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
                >
                    Tandai Semua Dibaca
                </button>
                <button
                    onClick={() => {
                        onClose();
                        try { router.get(route('mahasiswa.notifications')); } catch {}
                    }}
                    className="text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
                >
                    Lihat Semua →
                </button>
            </div>
        </motion.div>
    );
}
