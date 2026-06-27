import {
    LayoutDashboard,
    Calendar,
    ClipboardCheck,
    Bell,
    Settings,
} from "lucide-react";

export const ASLAB_NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, route: "aslab.dashboard" },
    { label: "Jadwal", icon: Calendar, route: "aslab.jadwal" },
    { label: "Validasi", icon: ClipboardCheck, route: "aslab.validasi" },
    { label: "Notifikasi", icon: Bell, route: "aslab.notifikasi" },
    { label: "Pengaturan", icon: Settings, route: "aslab.pengaturan" },
];

export const ASLAB_BRANDING = {
    initial: "S",
    title: "SARS",
    subtitle: "Aslab Panel",
};
