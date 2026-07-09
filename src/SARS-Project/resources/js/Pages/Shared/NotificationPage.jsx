/**
 * @deprecated Use NotificationListPage (Components/Shared/NotificationListPage) instead.
 *
 * This file is kept for backwards compatibility with the shared
 * /notifications (NotificationCenterController) route.
 * It delegates entirely to NotificationListPage.
 * The prop key here is `notifications`, matching what the controller returns.
 */
import NotificationListPage from '../../Components/Shared/NotificationListPage';

export default function NotificationPage({ notifications = [] }) {
    const notifData = Array.isArray(notifications?.data) ? notifications.data : notifications;

    return (
        <NotificationListPage
            notifikasi={notifData}
            readUrl="/notifications"
            readAllUrl="/notifications/read-all"
            deleteUrl="/notifications"
            reloadProp="notifications"
        />
    );
}
