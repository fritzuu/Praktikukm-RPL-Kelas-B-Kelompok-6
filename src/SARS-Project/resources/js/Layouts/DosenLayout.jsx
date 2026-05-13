import { router, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Calendar, 
    Bell, 
    LogOut, 
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';

export default function DosenLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        {
            label: 'Dashboard',
            route: 'dosen.dashboard',
            icon: LayoutDashboard,
        },
        {
            label: 'Jadwal Mengajar',
            route: 'dosen.jadwal',
            icon: Calendar,
        },
        {
            label: 'Notifikasi',
            route: 'dosen.notification',
            icon: Bell,
        },
    ];

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const handleNavigate = (routeName) => {
        router.get(route(routeName));
        setSidebarOpen(false);
    };

    const isActive = (routeName) => {
        return route().current(routeName);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
            {/* ── Mobile Sidebar Toggle ────────────────────────── */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-4 left-4 lg:hidden z-50 p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* ── Sidebar ────────────────────────────────────────── */}
            <aside className={`
                fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#1a1f2e] to-[#0f1419]
                border-r border-white/10 shadow-2xl
                transition-transform duration-300 ease-in-out
                lg:translate-x-0 z-40
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo & Branding */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                            <Calendar className="text-white" size={20} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-white font-bold text-sm">SARS</h2>
                            <p className="text-[10px] text-white/50">Schedule App</p>
                        </div>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-white/10">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-white/60 font-medium">Logged in as</p>
                        <p className="text-white font-bold text-sm truncate">{user?.name}</p>
                        <p className="text-[10px] text-white/40 truncate mt-1">{user?.email}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2 flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.route);
                        return (
                            <button
                                key={item.route}
                                onClick={() => handleNavigate(item.route)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                                    transition-all duration-200
                                    ${active
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 border border-orange-400/50'
                                        : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
                                    }
                                `}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-red-500/20 hover:border-red-400/50 border border-transparent transition-all duration-200"
                    >
                        <LogOut size={18} />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>

            {/* ── Backdrop for Mobile ────────────────────────── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Main Content ────────────────────────────────── */}
            <main className="lg:ml-64 min-h-screen">
                {/* Top Header Bar */}
                <div className="sticky top-0 z-20 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md border-b border-white/10 shadow-sm">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="hidden lg:block">
                            <h1 className="text-white font-bold text-lg">Sistem Akademik Regulasi Jadwal</h1>
                            <p className="text-white/60 text-xs mt-0.5">Kelola jadwal mengajar Anda</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white">
                                <Bell size={20} />
                            </button>
                            <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                            <span className="text-sm text-white/70">{user?.name}</span>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="px-4 md:px-6 py-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
