import { useState, useEffect } from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';
import { router } from '@inertiajs/react';
import { createPortal } from 'react-dom';

export default function LogoutModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    function handleLogout() {
        setLoading(true);
        router.post(route('logout'), {}, {
            onFinish: () => setLoading(false),
        });
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-[scaleIn_200ms_ease-out]">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={28} className="text-danger" />
                </div>

                {/* Text */}
                <h3 className="text-lg font-bold text-text-primary text-center mb-1">
                    Konfirmasi Keluar
                </h3>
                <p className="text-sm text-text-secondary text-center mb-6 leading-relaxed">
                    Apakah Anda yakin ingin keluar dari sistem? Anda perlu login kembali untuk mengakses dashboard.
                </p>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl
                                   text-sm font-semibold text-text-primary
                                   hover:bg-card transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-danger hover:bg-danger/90 rounded-xl
                                   text-sm font-semibold text-white
                                   transition-colors flex items-center justify-center gap-2
                                   disabled:opacity-50 shadow-lg shadow-danger/20"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <LogOut size={16} />
                        )}
                        {loading ? 'Keluar...' : 'Ya, Keluar'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
            `}</style>
        </div>,
        document.body
    );
}
