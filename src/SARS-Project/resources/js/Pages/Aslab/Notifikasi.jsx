import AslabLayout from '../../Layouts/AslabLayout';
import NotificationListPage from '../../Components/Shared/NotificationListPage';

export default function AslabNotifikasi({ notifikasi = [] }) {
    return (
        <NotificationListPage
            notifikasi={notifikasi}
            readUrl="/aslab/notifikasi"
            readAllUrl="/aslab/notifikasi/read-all"
            deleteUrl="/aslab/notifikasi"
        />
    );
}

AslabNotifikasi.layout = (page) => <AslabLayout>{page}</AslabLayout>;
