import AdminLayout from '../../Layouts/AdminLayout';
import NotificationListPage from '../../Components/Shared/NotificationListPage';

export default function AdminNotifikasi({ notifikasi = [] }) {
    return (
        <NotificationListPage
            notifikasi={notifikasi}
            readUrl="/admin/notifikasi"
            readAllUrl="/admin/notifikasi/read-all"
            deleteUrl="/admin/notifikasi"
        />
    );
}

AdminNotifikasi.layout = (page) => <AdminLayout>{page}</AdminLayout>;
