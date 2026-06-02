import { Calendar, AlertTriangle, CheckCircle, BellOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ICON_MAP = {
    0: Calendar,
    1: CheckCircle,
    2: AlertTriangle,
};

const dropdownVariants = {
    hidden: {
        opacity: 0,
        scale: 0.92,
        y: -10,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 30,
            mass: 0.8,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: -6,
        transition: {
            duration: 0.15,
            ease: "easeOut",
        },
    },
};

const listVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -12 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: "spring", stiffness: 300, damping: 25 },
    },
};

export default function NotificationDropdown({ onClose, notifications = [] }) {
    return (
        <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ originX: 1, originY: 0 }}
            className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl border border-border shadow-lg shadow-black/5 overflow-hidden z-50"
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-text-primary">
                    Notifikasi
                </h3>
                <span className="text-[10px] font-bold bg-danger/10 text-danger px-2 py-0.5 rounded-full">
                    {notifications.filter((n) => !n.dibaca).length} baru
                </span>
            </div>
            <motion.div
                variants={listVariants}
                className="max-h-64 overflow-y-auto"
            >
                {notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-text-muted">
                        <BellOff size={32} strokeWidth={1.5} />
                        <p className="text-xs font-medium">
                            Tidak ada notifikasi
                        </p>
                    </div>
                )}
                {notifications.map((notif, idx) => {
                    const Icon = ICON_MAP[idx] || Calendar;
                    return (
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            key={notif.id}
                            className={`flex items-start gap-3 px-4 py-3 hover:bg-surface transition-colors cursor-pointer ${!notif.dibaca ? "bg-primary-50/50" : ""}`}
                        >
                            <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${!notif.dibaca ? "bg-primary-500/10 text-primary-500" : "bg-surface text-text-muted"}`}
                            >
                                <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className={`text-sm leading-tight ${!notif.dibaca ? "font-medium text-text-primary" : "text-text-secondary"}`}
                                >
                                    {notif.judul}
                                </p>
                                <p className="text-[11px] text-text-muted mt-0.5">
                                    {notif.waktu}
                                </p>
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
                })}
            </motion.div>
            <div className="px-4 py-2.5 border-t border-border">
                <button
                    onClick={onClose}
                    className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
                >
                    Tandai Semua Dibaca
                </button>
            </div>
        </motion.div>
    );
}
