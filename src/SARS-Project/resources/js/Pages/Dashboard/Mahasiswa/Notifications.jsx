import MahasiswaLayout from '../../../Layouts/MahasiswaLayout';
import NotificationPage from '../../Shared/NotificationPage';

/**
 * Mahasiswa Notifications page.
 * Delegates rendering to the shared NotificationPage component,
 * which handles the full list, detail modal, read state, and deletion.
 *
 * Route: GET /mahasiswa/notifications → MahasiswaController::notifications()
 * Inertia render: 'Dashboard/Mahasiswa/Notifications'
 */
export default function MahasiswaNotifications({ notifications = [], unreadCount = 0 }) {
    return <NotificationPage notifications={notifications} unreadCount={unreadCount} />;
}

MahasiswaNotifications.layout = (page) => <MahasiswaLayout>{page}</MahasiswaLayout>;
