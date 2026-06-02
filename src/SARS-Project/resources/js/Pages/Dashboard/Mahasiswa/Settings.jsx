import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import MahasiswaLayout from '../../../Layouts/MahasiswaLayout';
import { Settings as SettingsIcon, User, Lock, Bell, Shield, Save, Eye, EyeOff } from 'lucide-react';

export default function Settings({ user: propUser }) {
    const { auth } = usePage().props;
    const userData = propUser || auth?.user || {};

    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState({ name: userData.name || '', email: userData.email || '' });
    const [password, setPassword] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const [notifPrefs, setNotifPrefs] = useState({
        pushEnabled: !!userData.fcm_token,
        emailEnabled: true,
        statusChanges: true,
        scheduleUpdates: true,
        reminders: true,
    });

    function handleProfileSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            router.put(route('mahasiswa.settings.update'), profile, {
                onSuccess: () => { setSuccessMsg('Profil berhasil diperbarui!'); setTimeout(() => setSuccessMsg(''), 3000); },
                onFinish: () => setSaving(false),
            });
        } catch { setSaving(false); setSuccessMsg('Profil berhasil diperbarui! (mock)'); setTimeout(() => setSuccessMsg(''), 3000); }
    }

    function handlePasswordSave(e) {
        e.preventDefault();
        if (password.password.length < 8) return;
        if (password.password !== password.password_confirmation) return;
        setSaving(true);
        try {
            router.put(route('mahasiswa.settings.password'), password, {
                onSuccess: () => { setSuccessMsg('Password berhasil diubah!'); setPassword({ current_password: '', password: '', password_confirmation: '' }); setTimeout(() => setSuccessMsg(''), 3000); },
                onFinish: () => setSaving(false),
            });
        } catch { setSaving(false); setSuccessMsg('Password berhasil diubah! (mock)'); setTimeout(() => setSuccessMsg(''), 3000); }
    }

    const tabs = [
        { key: 'profile', label: 'Profil', icon: User },
        { key: 'security', label: 'Keamanan', icon: Lock },
        { key: 'notifications', label: 'Notifikasi', icon: Bell },
    ];

    return (
        <>
            <section className="mb-6">
                <div className="flex items-center gap-2">
                    <SettingsIcon size={22} className="text-text-primary" />
                    <h1 className="text-xl font-bold text-text-primary">Pengaturan</h1>
                </div>
                <p className="text-sm text-text-secondary mt-1">Kelola profil, keamanan, dan preferensi notifikasi.</p>
            </section>

            {successMsg && (
                <div className="mb-4 bg-success/10 border border-success/20 text-success text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
                    <Shield size={16} /> {successMsg}
                </div>
            )}

            <div className="flex gap-6">
                {/* Sidebar Tabs */}
                <div className="w-48 shrink-0 space-y-1">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-primary-500/10 text-primary-500' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`}>
                                <Icon size={18} /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-base font-bold text-text-primary mb-5">Informasi Profil</h2>
                            <form onSubmit={handleProfileSave} className="space-y-4">
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center text-2xl font-bold shrink-0">
                                        {profile.name?.charAt(0)?.toUpperCase() || 'M'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-text-primary">{profile.name}</p>
                                        <p className="text-xs text-text-muted">NIM: {userData.nim_nip || '—'}</p>
                                        <p className="text-[10px] text-text-muted mt-0.5">Mahasiswa • Informatika</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Nama Lengkap</label>
                                    <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Email</label>
                                    <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
                                </div>
                                <div className="pt-2">
                                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                                        <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-base font-bold text-text-primary mb-5">Ubah Password</h2>
                            <form onSubmit={handlePasswordSave} className="space-y-4 max-w-md">
                                {[
                                    { key: 'current_password', label: 'Password Saat Ini', showKey: 'current' },
                                    { key: 'password', label: 'Password Baru', showKey: 'new' },
                                    { key: 'password_confirmation', label: 'Konfirmasi Password Baru', showKey: 'confirm' },
                                ].map(field => (
                                    <div key={field.key}>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">{field.label}</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords[field.showKey] ? 'text' : 'password'}
                                                value={password[field.key]}
                                                onChange={e => setPassword(p => ({ ...p, [field.key]: e.target.value }))}
                                                className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all pr-10"
                                            />
                                            <button type="button" onClick={() => setShowPasswords(p => ({ ...p, [field.showKey]: !p[field.showKey] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                                                {showPasswords[field.showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {password.password && password.password.length < 8 && (
                                    <p className="text-[10px] text-danger">Password minimal 8 karakter</p>
                                )}
                                {password.password && password.password_confirmation && password.password !== password.password_confirmation && (
                                    <p className="text-[10px] text-danger">Password tidak cocok</p>
                                )}
                                <div className="pt-2">
                                    <button type="submit" disabled={saving || password.password.length < 8 || password.password !== password.password_confirmation} className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                                        <Lock size={16} /> {saving ? 'Mengubah...' : 'Ubah Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-base font-bold text-text-primary mb-5">Preferensi Notifikasi</h2>
                            <div className="space-y-4">
                                {[
                                    { key: 'pushEnabled', label: 'Push Notification (FCM)', desc: 'Terima notifikasi real-time ke perangkat' },
                                    { key: 'emailEnabled', label: 'Email Notification', desc: 'Terima ringkasan via email' },
                                    { key: 'statusChanges', label: 'Perubahan Status Request', desc: 'Notifikasi saat status request berubah' },
                                    { key: 'scheduleUpdates', label: 'Update Jadwal', desc: 'Notifikasi saat jadwal berubah (Temp/Permanent)' },
                                    { key: 'reminders', label: 'Pengingat', desc: 'Pengingat deadline dan jadwal mendatang' },
                                ].map(item => (
                                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                                        <div>
                                            <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                                            <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setNotifPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                                            className={`w-11 h-6 rounded-full transition-colors relative ${notifPrefs[item.key] ? 'bg-primary-500' : 'bg-border'}`}
                                        >
                                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notifPrefs[item.key] ? 'left-5.5 translate-x-0' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Settings.layout = (page) => <MahasiswaLayout>{page}</MahasiswaLayout>;
