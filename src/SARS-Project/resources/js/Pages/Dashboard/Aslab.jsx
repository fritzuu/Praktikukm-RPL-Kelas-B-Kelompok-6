import { usePage } from '@inertiajs/react';
import AslabLayout from '../../Layouts/AslabLayout';
import WelcomeHeader from '../../Components/Aslab/WelcomeHeader';
import ScheduleGrid from '../../Components/Aslab/ScheduleGrid';

export default function AslabDashboard({
    stats = { pendingVerification: 0, validation: 0, accepted: 0, rejected: 0 },
    jadwal = [],
    rooms = [],
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <>
            <WelcomeHeader user={user} stats={stats} />

            <ScheduleGrid schedules={jadwal} rooms={rooms} />
        </>
    );
}

// Inertia persistent layout
AslabDashboard.layout = (page) => <AslabLayout>{page}</AslabLayout>;
