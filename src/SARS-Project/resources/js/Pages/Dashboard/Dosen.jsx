import { router, usePage } from '@inertiajs/react';

export default function DosenDashboard() {
    const { auth } = usePage().props;
    const user = auth.user;

    function handleLogout() {
        router.post(route('logout'));
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#431407] via-[#7c2d12] to-[#c2410c] flex items-center justify-center font-[Inter,sans-serif] px-4">
            <div className="text-center space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-300 animate-pulse"></div>
                    <span className="text-white/80 text-sm font-medium tracking-wide">Dosen Mata Kuliah</span>
                </div>

                {/* Icon */}
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center shadow-2xl">
                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <div>
                    <h1 className="text-5xl font-extrabold text-white tracking-tight">
                        Dosen Dashboard
                    </h1>
                    <p className="text-white/60 mt-3 text-lg">
                        Selamat datang, <span className="text-white font-semibold">{user?.name ?? 'Dosen'}</span>
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
                            <p className="text-white font-semibold text-sm">Dosen Mata Kuliah</p>
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
                            <p className="text-orange-300 font-semibold text-sm">Berhasil Masuk</p>
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
