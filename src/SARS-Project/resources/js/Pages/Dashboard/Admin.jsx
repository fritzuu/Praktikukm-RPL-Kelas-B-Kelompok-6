import { router, usePage } from '@inertiajs/react';

export default function AdminDashboard() {
    const { auth } = usePage().props;
    const user = auth.user;

    function handleLogout() {
        router.post(route('logout'));
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#1e40af] flex items-center justify-center font-[Inter,sans-serif] px-4">
            <div className="text-center space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-white/80 text-sm font-medium tracking-wide">Admin Fakultas</span>
                </div>

                {/* Icon */}
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center shadow-2xl">
                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <div>
                    <h1 className="text-5xl font-extrabold text-white tracking-tight">
                        Admin Dashboard
                    </h1>
                    <p className="text-white/60 mt-3 text-lg">
                        Selamat datang, <span className="text-white font-semibold">{user?.name ?? 'Admin'}</span>
                    </p>
                    <p className="text-white/40 text-sm mt-1">{user?.email}</p>
                </div>

                {/* Info Card */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-6 inline-block text-left space-y-3 min-w-72">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white/50 text-xs">Role</p>
                            <p className="text-white font-semibold text-sm">Admin Fakultas</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white/50 text-xs">Status</p>
                            <p className="text-emerald-400 font-semibold text-sm">Berhasil Masuk</p>
                        </div>
                    </div>
                </div>

                {/* Logout */}
                <div>
                    <button
                        onClick={handleLogout}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        Keluar
                    </button>
                </div>
            </div>
        </div>
    );
}
