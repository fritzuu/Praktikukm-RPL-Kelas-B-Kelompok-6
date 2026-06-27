import {
    LayoutDashboard,
    Calendar,
    Bell,
    Settings,
} from "lucide-react";

export const DOSEN_NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, route: "dosen.dashboard" },
    { label: "Jadwal", icon: Calendar, route: "dosen.jadwal" },
    { label: "Notifikasi", icon: Bell, route: "dosen.notifikasi" },
    { label: "Pengaturan", icon: Settings, route: "dosen.pengaturan" },
];

export const DOSEN_BRANDING = {
    initial: "S",
    title: "SARS",
    subtitle: "Dosen Panel",
};
