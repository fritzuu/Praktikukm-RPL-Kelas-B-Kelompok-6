import { useState } from "react";
import { Upload } from "lucide-react";
import { router } from "@inertiajs/react";
import AppLayout from "./AppLayout";
import FileUploadModal from "../Components/Shared/FileUploadModal";
import {
    ADMIN_NAV_ITEMS,
    ADMIN_BRANDING,
} from "../Components/Admin/AdminNavConfig";

export default function AdminLayout({ children }) {
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    /**
     * Read the dropped/selected file as plain text and POST to jadwal.import.
     * Works for .txt and .csv files that follow the raw-text schedule format.
     */
    const handleFileSubmit = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setUploading(true);
            router.post(
                route("admin.jadwal.import"),
                { raw_text: e.target.result, overwrite: false },
                {
                    onFinish: () => {
                        setUploading(false);
                        setUploadModalOpen(false);
                    },
                },
            );
        };
        reader.readAsText(file);
    };

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

            {/* Admin-specific: Upload Modal — wired to jadwal.import */}
            <FileUploadModal
                isOpen={uploadModalOpen}
                onClose={() => !uploading && setUploadModalOpen(false)}
                title="Import Jadwal Kuliah"
                subtitle="Upload file teks/CSV berformat jadwal sesi"
                submitLabel={uploading ? "Mengunggah..." : "Unggah Jadwal"}
                onSubmit={handleFileSubmit}
            />
        </AppLayout>
    );
}
