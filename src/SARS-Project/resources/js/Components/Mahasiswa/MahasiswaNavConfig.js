import {
    LayoutDashboard,
    Calendar,
    FileText,
    Bell,
    Settings,
} from "lucide-react";

export const MAHASISWA_NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, route: "mahasiswa.dashboard" },
    { label: "Jadwal", icon: Calendar, route: "mahasiswa.jadwal" },
    { label: "Requests", icon: FileText, route: "mahasiswa.requests" },
    { label: "Notifikasi", icon: Bell, route: "mahasiswa.notifications" },
    { label: "Pengaturan", icon: Settings, route: "mahasiswa.settings" },
];

export const MAHASISWA_BRANDING = {
    initial: "S",
    title: "SARS",
    subtitle: "Student Portal",
};
