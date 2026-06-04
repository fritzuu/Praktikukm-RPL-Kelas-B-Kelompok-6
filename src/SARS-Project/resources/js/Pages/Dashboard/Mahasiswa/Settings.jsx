import { useState, useRef, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import {
    User,
    Camera,
    Shield,
    Moon,
    Sun,
    Monitor,
    CheckCircle,
    AlertCircle,
    Save,
    Image as ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MahasiswaLayout from '../../../Layouts/MahasiswaLayout';

export default function Settings({ user }) {
    const [previewUrl, setPreviewUrl] = useState(user.avatar_url);
    const [activeTheme, setActiveTheme] = useState(
        () => localStorage.getItem('theme') || 'light'
    );
    const fileInputRef = useRef();

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: user.name || '',
        photo: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { alert('Ukuran file maksimal 2MB'); return; }
            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('mahasiswa.settings.update'), { forceFormData: true, preserveScroll: true });
    };

    const handleThemeChange = (theme) => {
        setActiveTheme(theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else if (theme === 'light') document.documentElement.classList.remove('dark');
        else {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches)
                document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        }
    };

    useEffect(() => { handleThemeChange(localStorage.getItem('theme') || 'light'); }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 px-1">
                <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <User className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Pengaturan Profil</h1>
                    <p className="text-text-secondary text-sm">Kelola informasi akun dan preferensi tampilan Anda</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-3xl p-6 text-center shadow-sm">
                        <div className="relative w-32 h-32 mx-auto mb-4 group">
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl bg-surface">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                                        <User size={48} />
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="absolute bottom-0 right-0 w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg hover:bg-primary-600 transition-all scale-90 group-hover:scale-100"
                            >
                                <Camera size={18} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={handleFileChange}
                            />
                        </div>
                        <h3 className="text-lg font-bold text-text-primary">{user.name}</h3>
                        <p className="text-text-muted text-[10px] font-black uppercase tracking-widest mt-1">Mahasiswa</p>

                        <div className="mt-6 pt-6 border-t border-border space-y-3">
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-text-secondary">
                                    <Shield size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Metode Login</p>
                                    <p className="text-xs font-bold text-text-primary">Single Sign-On (SSO)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary-500/5 border border-primary-500/10 rounded-2xl p-5">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-primary-500 shrink-0" size={18} />
                            <p className="text-[11px] text-primary-700 leading-relaxed font-semibold">
                                Akun Anda terhubung melalui sistem SSO. Password hanya dapat diubah melalui portal pusat universitas.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Settings */}
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleSubmit}
                        className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
                                    <ImageIcon size={18} />
                                </div>
                                <h2 className="text-lg font-bold text-text-primary">Informasi Umum</h2>
                            </div>
                            <AnimatePresence>
                                {recentlySuccessful && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-2 text-green-500 text-sm font-bold"
                                    >
                                        <CheckCircle size={16} /> Berhasil disimpan
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary-500/50 transition-all font-medium"
                                    placeholder="Masukkan nama lengkap..."
                                />
                                {errors.name && <p className="text-xs text-red-500 font-medium px-1 mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 opacity-70">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Email</label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full px-4 py-3 bg-surface/50 border border-border rounded-xl text-text-muted cursor-not-allowed font-medium"
                                    />
                                </div>
                                <div className="space-y-2 opacity-70">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">NIM</label>
                                    <input
                                        type="text"
                                        value={user.nim_nip}
                                        disabled
                                        className="w-full px-4 py-3 bg-surface/50 border border-border rounded-xl text-text-muted cursor-not-allowed font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 px-8 py-3 bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all disabled:opacity-50"
                            >
                                {processing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save size={18} />
                                )}
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </motion.form>

                    {/* Appearance */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
                                <Monitor size={18} />
                            </div>
                            <h2 className="text-lg font-bold text-text-primary">Tampilan</h2>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { id: 'light', label: 'Terang', icon: Sun },
                                { id: 'dark', label: 'Gelap', icon: Moon },
                                { id: 'system', label: 'Sistem', icon: Monitor },
                            ].map(theme => (
                                <button
                                    key={theme.id}
                                    type="button"
                                    onClick={() => handleThemeChange(theme.id)}
                                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-300
                                        ${activeTheme === theme.id
                                            ? 'bg-primary-500/10 border-primary-500/40 text-primary-500 shadow-md scale-[1.02]'
                                            : 'bg-surface border-border text-text-muted hover:border-primary-500/20 hover:text-text-primary'
                                        }`}
                                >
                                    <theme.icon size={28} strokeWidth={activeTheme === theme.id ? 2.5 : 2} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">{theme.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="pt-2 bg-surface/50 p-4 rounded-xl border border-border/50">
                            <p className="text-[11px] text-text-muted font-medium italic leading-relaxed">
                                Fitur tema menyesuaikan kenyamanan mata Anda saat bekerja. Pilihan "Sistem" akan mengikuti pengaturan default perangkat Anda.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

Settings.layout = (page) => <MahasiswaLayout>{page}</MahasiswaLayout>;
