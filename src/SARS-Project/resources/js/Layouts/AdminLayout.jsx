import { useState } from 'react';
import { Upload } from 'lucide-react';
import AppLayout from './AppLayout';
import FileUploadModal from '../Components/Shared/FileUploadModal';
import { ADMIN_NAV_ITEMS, ADMIN_BRANDING } from '../Components/Admin/AdminNavConfig';

export default function AdminLayout({ children }) {
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    const topBarActions = (
        <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600
                       text-white text-sm font-medium px-4 py-2 rounded-lg
                       transition-colors duration-150 shrink-0"
        >
            <Upload size={16} />
            <span className="hidden sm:inline">Unggah Jadwal</span>
        </button>
    );

    return (
        <AppLayout
            navItems={ADMIN_NAV_ITEMS}
            branding={ADMIN_BRANDING}
            topBarActions={topBarActions}
        >
            {children}

            {/* Admin-specific: Upload Modal */}
            <FileUploadModal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
            />
        </AppLayout>
    );
}
