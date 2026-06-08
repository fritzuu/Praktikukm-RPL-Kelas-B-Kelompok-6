import { usePage } from '@inertiajs/react';
import DosenLayout from '../../Layouts/DosenLayout';
import WelcomeHeader from '../../Components/Dosen/WelcomeHeader';
import TodaySchedule from '../../Components/Dosen/TodaySchedule';
import ScheduleGrid from '../../Components/Dosen/ScheduleGrid';
import ConflictAlertsBanner from '../../Components/Shared/ConflictAlertsBanner';

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
    konflik = [],
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <>
            <WelcomeHeader user={user} stats={stats} />

            {/* Konflik Jadwal — only shows when dosen's own schedules have conflicts */}
            <ConflictAlertsBanner conflicts={konflik} role="dosen" />

            <TodaySchedule schedules={jadwalHariIni} />

            <ScheduleGrid jadwalItems={jadwal} />
        </>
    );
}

// Inertia persistent layout — sidebar & topbar tetap ada saat navigasi
DosenDashboard.layout = (page) => <DosenLayout>{page}</DosenLayout>;
