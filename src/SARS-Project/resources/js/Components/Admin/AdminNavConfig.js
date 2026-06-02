import {
    LayoutDashboard,
    Calendar,
    ClipboardCheck,
    BarChart3,
    Settings,
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, route: "admin.dashboard" },
    { label: "Jadwal", icon: Calendar, route: "admin.jadwal" },
    { label: "Persetujuan", icon: ClipboardCheck, route: "admin.persetujuan" },
    { label: "Statistik", icon: BarChart3, route: "admin.statistik" },
    { label: "Pengaturan", icon: Settings, route: "admin.pengaturan" },
];

export const ADMIN_BRANDING = {
    initial: "S",
    title: "SARS",
    subtitle: "Academic Admin",
};
