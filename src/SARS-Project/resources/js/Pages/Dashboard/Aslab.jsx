import { router, usePage } from '@inertiajs/react';

export default function AslabDashboard() {
    const { auth } = usePage().props;
    const user = auth.user;

    function handleLogout() {
        router.post(route('logout'));
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] flex items-center justify-center font-[Inter,sans-serif] px-4">
            <div className="text-center space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"></div>
                    <span className="text-white/80 text-sm font-medium tracking-wide">Asisten Lab</span>
                </div>

                {/* Icon */}
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center shadow-2xl">
                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.712-1.379 2.712H4.178c-1.41 0-2.38-1.712-1.38-2.712L4.5 15.3" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <div>
                    <h1 className="text-5xl font-extrabold text-white tracking-tight">
                        Aslab Dashboard
                    </h1>
                    <p className="text-white/60 mt-3 text-lg">
                        Selamat datang, <span className="text-white font-semibold">{user?.name ?? 'Aslab'}</span>
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
                            <p className="text-white font-semibold text-sm">Asisten Lab / Asisten Dosen</p>
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
                            <p className="text-yellow-400 font-semibold text-sm">Berhasil Masuk</p>
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
