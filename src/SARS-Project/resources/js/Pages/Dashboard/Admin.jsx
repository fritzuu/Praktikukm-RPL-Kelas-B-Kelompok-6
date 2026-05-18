import { usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import WelcomeHeader from '../../Components/Shared/WelcomeHeader';
import ActivityTable from '../../Components/Shared/ActivityTable';
import AdminStatCards from '../../Components/Admin/AdminStatCards';
import AdminInsightCards from '../../Components/Admin/AdminInsightCards';
import ScheduleGrid from '../../Components/Shared/ScheduleGrid';
import ConflictAlerts from '../../Components/Admin/ConflictAlerts';
import {
    MOCK_JADWAL,
    MOCK_KONFLIK,
    MOCK_AKTIVITAS,
    MOCK_SYNC_STATUS,
    MOCK_ROOMS,
    MOCK_INSIGHTS,
} from '../../data/mockData';

const STATUS_STYLES = {
    disetujui: 'bg-success/10 text-success',
    tertunda: 'bg-warning/10 text-warning',
    ditolak: 'bg-danger/10 text-danger',
};

const STATUS_LABELS = {
    disetujui: 'Disetujui',
    tertunda: 'Tertunda',
    ditolak: 'Ditolak',
};

const ADMIN_ACTIVITY_COLUMNS = [
    {
        key: 'nama',
        header: 'Anggota Fakultas',
        cell: (item) => (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {item.avatarInitial}
                </div>
                <span className="font-medium text-text-primary text-sm">{item.nama}</span>
            </div>
        ),
    },
    {
        key: 'aksi',
        header: 'Aksi',
    },
    {
        key: 'status',
        header: 'Status',
        cell: (item) => (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[item.status] || STATUS_STYLES.tertunda}`}>
                {STATUS_LABELS[item.status] || item.status}
            </span>
        ),
    },
    {
        key: 'waktu',
        header: 'Waktu',
        cell: (item) => (
            <span className="text-text-muted text-sm whitespace-nowrap">{item.waktu}</span>
        ),
    },
];

export default function AdminDashboard({
    jadwal = MOCK_JADWAL,
    konflik = MOCK_KONFLIK,
    aktivitas = MOCK_AKTIVITAS,
    syncStatus = MOCK_SYNC_STATUS,
    insights = MOCK_INSIGHTS,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <>
            <WelcomeHeader
                user={user}
                subtitle={
                    <>
                        Operasi akademik stabil dengan{' '}
                        <span className="font-semibold text-danger">{konflik.length} konflik</span> tertunda.
                    </>
                }
            >
                <AdminStatCards syncStatus={syncStatus} />
            </WelcomeHeader>

            <AdminInsightCards insights={insights} />

            <ScheduleGrid 
                jadwalItems={jadwal} 
                rooms={MOCK_ROOMS} 
                showConflicts={true} 
                onExport={(jadwal) => console.log('Exporting jadwal...', jadwal)}
            />

            <ConflictAlerts conflicts={konflik} />

            <ActivityTable
                title="Aktivitas Terbaru"
                items={aktivitas}
                columns={ADMIN_ACTIVITY_COLUMNS}
            />
        </>
    );
}

// Inertia persistent layout — sidebar & topbar tetap ada saat navigasi
AdminDashboard.layout = (page) => <AdminLayout>{page}</AdminLayout>;
