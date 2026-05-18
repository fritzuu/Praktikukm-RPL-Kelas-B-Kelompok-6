import { usePage } from '@inertiajs/react';
import AslabLayout from '../../Layouts/AslabLayout';
import WelcomeHeader from '../../Components/Aslab/WelcomeHeader';
import ScheduleGrid from '../../Components/Aslab/ScheduleGrid';

export default function AslabDashboard({
    stats = { pendingValidasi: 0 },
    jadwal = [],
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <>
            <WelcomeHeader user={user} stats={stats} />

            <ScheduleGrid jadwalItems={jadwal} />
        </>
    );
}

// Inertia persistent layout
AslabDashboard.layout = (page) => <AslabLayout>{page}</AslabLayout>;
