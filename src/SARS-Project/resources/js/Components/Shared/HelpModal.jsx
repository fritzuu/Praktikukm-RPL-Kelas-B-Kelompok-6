import { HelpCircle, Keyboard, X, Calendar, Search as SearchIcon, Bell, Moon, MessageSquare } from 'lucide-react';

const SHORTCUTS = [
    { keys: ['Ctrl', 'K'], desc: 'Fokus ke Search Bar' },
    { keys: ['Ctrl', 'B'], desc: 'Toggle Sidebar' },
    { keys: ['?'], desc: 'Tampilkan Bantuan Ini' },
];

const FEATURES = [
    { icon: Calendar, label: 'Jadwal', desc: 'Lihat jadwal kuliah per hari (Senin–Jumat) dalam format grid ruangan × sesi.' },
    { icon: SearchIcon, label: 'Pencarian', desc: 'Cari mata kuliah, dosen, atau ruangan lewat search bar di atas.' },
    { icon: Bell, label: 'Notifikasi', desc: 'Pantau perubahan jadwal, validasi, dan pengumuman sistem terbaru.' },
    { icon: Moon, label: 'Mode Gelap', desc: 'Atur tema terang/gelap di halaman Pengaturan sesuai preferensi Anda.' },
    { icon: MessageSquare, label: 'AI Assistant', desc: 'Klik ikon chat di pojok kanan bawah untuk bertanya seputar jadwal.' },
];

export default function HelpModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-[scaleIn_200ms_ease-out]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/30">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
                            <HelpCircle size={20} className="text-primary-500" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-text-primary">Bantuan & Panduan</h3>
                            <p className="text-[11px] text-text-muted">SARS — Sistem Atur Ruang & Sesi</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-text-primary transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-6">
                    {/* Shortcuts */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Keyboard size={14} className="text-text-muted" />
                            <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest">Pintasan Keyboard</h4>
                        </div>
                        <div className="space-y-2">
                            {SHORTCUTS.map((s, i) => (
                                <div key={i} className="flex items-center justify-between bg-surface/50 rounded-lg px-4 py-2.5 border border-border/50">
                                    <span className="text-sm text-text-secondary">{s.desc}</span>
                                    <div className="flex items-center gap-1">
                                        {s.keys.map((k, j) => (
                                            <kbd key={j} className="px-2 py-0.5 bg-card border border-border rounded text-[11px] font-mono font-bold text-text-primary shadow-sm">
                                                {k}
                                            </kbd>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Fitur Utama</h4>
                        <div className="space-y-3">
                            {FEATURES.map((f, i) => {
                                const Icon = f.icon;
                                return (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <Icon size={16} className="text-primary-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-text-primary">{f.label}</p>
                                            <p className="text-xs text-text-muted leading-relaxed mt-0.5">{f.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Version */}
                    <div className="text-center pt-2 border-t border-border">
                        <p className="text-[10px] text-text-muted font-medium">SARS v1.0 — Kelompok 6 RPL Kelas B</p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
            `}</style>
        </div>
    );
}
