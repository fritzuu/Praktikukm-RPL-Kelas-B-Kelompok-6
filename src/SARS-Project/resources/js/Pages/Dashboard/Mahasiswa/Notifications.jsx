import MahasiswaLayout from '../../../Layouts/MahasiswaLayout';
import NotificationListPage from '../../../Components/Shared/NotificationListPage';

/**
 * Mahasiswa Notifications page.
 * Route: GET /mahasiswa/notifications → MahasiswaController::notifications()
 *
 * All notification action endpoints are scoped under /mahasiswa/notifications/*
 * (inside the role:mahasiswa group) so the mahasiswa never needs to call
 * shared or role-restricted routes. The detail endpoint delegates to the same
 * NotificationCenterController::detail() — authorization is recipient-based,
 * not role-based — so mahasiswa can always open their own notification details.
 *
 * Live updates come from /api/notifications/list (role-agnostic JSON endpoint),
 * not from Inertia router.reload(), so no 403 risk from route/role mismatch.
 */
export default function MahasiswaNotifications({ notifications = [] }) {
    return (
        <NotificationListPage
            notifikasi={notifications}
            readUrl="/mahasiswa/notifications"
            readAllUrl="/mahasiswa/notifications/read-all"
            deleteUrl="/mahasiswa/notifications"
            detailUrl="/mahasiswa/notifications"
        />
    );
}

MahasiswaNotifications.layout = (page) => <MahasiswaLayout>{page}</MahasiswaLayout>;
