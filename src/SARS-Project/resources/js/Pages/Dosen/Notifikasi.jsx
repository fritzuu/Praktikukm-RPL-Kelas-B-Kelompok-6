import DosenLayout from '../../Layouts/DosenLayout';
import NotificationListPage from '../../Components/Shared/NotificationListPage';

export default function DosenNotifikasi({ notifikasi = [] }) {
    return (
        <NotificationListPage
            notifikasi={notifikasi}
            readUrl="/dosen/notifikasi"
            readAllUrl="/dosen/notifikasi/read-all"
            deleteUrl="/dosen/notifikasi"
        />
    );
}

DosenNotifikasi.layout = (page) => <DosenLayout>{page}</DosenLayout>;
