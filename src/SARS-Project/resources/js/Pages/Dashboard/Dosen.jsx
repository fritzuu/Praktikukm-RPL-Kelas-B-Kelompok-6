import { usePage } from '@inertiajs/react';
import DosenLayout from '../../Layouts/DosenLayout';
import WelcomeHeader from '../../Components/Dosen/WelcomeHeader';
import TodaySchedule from '../../Components/Dosen/TodaySchedule';
import ScheduleGrid from '../../Components/Dosen/ScheduleGrid';
import {
    MOCK_DOSEN_JADWAL,
    MOCK_DOSEN_STATS,
    MOCK_JADWAL_HARI_INI,
} from '../../data/dosenMockData';

export default function DosenDashboard({
    jadwal = MOCK_DOSEN_JADWAL,
    stats = MOCK_DOSEN_STATS,
    jadwalHariIni = MOCK_JADWAL_HARI_INI,
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
