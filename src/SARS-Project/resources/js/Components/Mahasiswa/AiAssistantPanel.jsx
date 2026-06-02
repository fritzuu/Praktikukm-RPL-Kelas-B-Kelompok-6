import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Bot, Sparkles, Send, Calendar, Search as SearchIcon } from 'lucide-react';

export default function MahasiswaAiPanel({ isOpen, onClose, ref }) {
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: 'Halo! Saya AI Assistant SARS. Saya bisa membantu kamu dengan:\n• Informasi jadwal kuliah\n• Cek slot ruangan kosong\n• Panduan pengajuan request\n• Status request kamu\n\nSilakan tanyakan sesuatu!',
        },
    ]);
    const [loading, setLoading] = useState(false);

    async function handleSend() {
        if (!chatInput.trim() || loading) return;

        const userMsg = chatInput.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatInput('');
        setLoading(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            const res = await fetch(route('mahasiswa.aiQuery'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ query: userMsg }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
        } catch {
            // Fallback for when route is not available
            const fallback = generateFallbackResponse(userMsg);
            setMessages(prev => [...prev, { role: 'assistant', text: fallback }]);
        } finally {
            setLoading(false);
        }
    }

    function generateFallbackResponse(query) {
        const q = query.toLowerCase();
        if (q.includes('jadwal') || q.includes('schedule')) {
            return 'Kamu bisa melihat seluruh jadwal di halaman "Jadwal". Jadwal ditampilkan dalam format kalender mingguan Senin-Sabtu dengan kode warna untuk setiap tipe.';
        }
        if (q.includes('slot') || q.includes('kosong') || q.includes('ruang')) {
            return 'Untuk mengecek slot kosong, buka halaman "Jadwal" lalu gunakan fitur "Cek Slot Kosong". Pilih hari dan rentang waktu yang diinginkan.';
        }
        if (q.includes('request') || q.includes('ajukan') || q.includes('pengajuan')) {
            return 'Untuk mengajukan perubahan jadwal:\n1. Buka halaman "Requests"\n2. Klik "Ajukan Request Baru"\n3. Pilih tipe (Temporary/Permanent)\n4. Isi form dengan alasan minimal 20 karakter\n5. Sistem akan otomatis cek konflik';
        }
        if (q.includes('status') || q.includes('tracking')) {
            return 'Pipeline status request: PENDING_ASLAB → FORWARDED → APPROVED/REJECTED. Pantau status di halaman "Requests".';
        }
        return 'Saya bisa membantu dengan informasi jadwal, slot ruangan, pengajuan request, dan notifikasi. Silakan tanya yang lebih spesifik!';
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <motion.aside
            ref={ref}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className="shrink-0 border-l border-border bg-card flex flex-col h-[calc(100vh-57px)] sticky top-[57px] z-40 overflow-hidden"
        >
            {/* Fixed width mask wrapper to prevent content squishing during transition */}
            <div className="w-[320px] flex flex-col h-full shrink-0">
            {/* ── Header ───────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
                <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <Bot size={20} className="text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary leading-tight">
                        AI Assistant
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <span className="text-[10px] font-semibold text-success uppercase tracking-wide">
                            Always Online
                        </span>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-text-secondary transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* ── Chat Messages ─────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto panel-scroll px-4 py-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                                msg.role === 'user'
                                    ? 'bg-primary-500 text-white rounded-br-md'
                                    : 'bg-surface text-text-secondary rounded-bl-md'
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-surface rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Quick Actions ───────────────────────────────────── */}
            <div className="px-4 py-2 border-t border-border">
                <div className="flex gap-1.5 overflow-x-auto">
                    {['Jadwal hari ini?', 'Slot kosong?', 'Cara ajukan request?'].map((q, i) => (
                        <button
                            key={i}
                            onClick={() => { setChatInput(q); }}
                            className="text-[10px] font-medium text-primary-500 bg-primary-500/5 hover:bg-primary-500/10 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Chat Input ───────────────────────────────────────── */}
            <div className="px-4 py-3 border-t border-border">
                <div className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2 border border-border
                                focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tanyakan tentang jadwal..."
                        className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted
                                   focus:outline-none"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!chatInput.trim() || loading}
                        className="w-8 h-8 rounded-lg bg-primary-500 hover:bg-primary-600
                                   disabled:bg-border disabled:cursor-not-allowed
                                   text-white flex items-center justify-center transition-colors shrink-0"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </div>
            </div>
        </motion.aside>
    );
}
