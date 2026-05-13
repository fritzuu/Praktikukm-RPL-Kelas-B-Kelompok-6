import { usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import WelcomeHeader from '../../Components/Admin/WelcomeHeader';
import ScheduleGrid from '../../Components/Admin/ScheduleGrid';
import ConflictAlerts from '../../Components/Admin/ConflictAlerts';
import RecentActivity from '../../Components/Admin/RecentActivity';
import {
    MOCK_JADWAL,
    MOCK_KONFLIK,
    MOCK_AKTIVITAS,
    MOCK_SYNC_STATUS,
} from '../../data/mockData';

export default function AdminDashboard({
    jadwal = MOCK_JADWAL,
    konflik = MOCK_KONFLIK,
    aktivitas = MOCK_AKTIVITAS,
    syncStatus = MOCK_SYNC_STATUS,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <>
            <WelcomeHeader
                user={user}
                syncStatus={syncStatus}
                pendingConflicts={konflik.length}
            />

            <ScheduleGrid jadwalItems={jadwal} />

            <ConflictAlerts conflicts={konflik} />

            <RecentActivity activities={aktivitas} />
        </>
    );
}

// Inertia persistent layout — sidebar & topbar tetap ada saat navigasi
AdminDashboard.layout = (page) => <AdminLayout>{page}</AdminLayout>;
