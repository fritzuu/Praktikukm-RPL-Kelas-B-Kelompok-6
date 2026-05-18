import { usePage } from '@inertiajs/react';
import DosenLayout from '../../Layouts/DosenLayout';
import WelcomeHeader from '../../Components/Dosen/WelcomeHeader';
import TodaySchedule from '../../Components/Dosen/TodaySchedule';
import ScheduleGrid from '../../Components/Dosen/ScheduleGrid';
export default function DosenDashboard({
    jadwal = [],
    stats = {
        totalMataKuliah: 0,
        totalSks: 0,
        totalMahasiswa: 0,
        jadwalHariIni: 0,
        pertemuanMingguIni: 0,
    },
    jadwalHariIni = [],
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <>
            <WelcomeHeader user={user} stats={stats} />

            <TodaySchedule schedules={jadwalHariIni} />

            <ScheduleGrid jadwalItems={jadwal} />
        </>
    );
}

// Inertia persistent layout — sidebar & topbar tetap ada saat navigasi
DosenDashboard.layout = (page) => <DosenLayout>{page}</DosenLayout>;
