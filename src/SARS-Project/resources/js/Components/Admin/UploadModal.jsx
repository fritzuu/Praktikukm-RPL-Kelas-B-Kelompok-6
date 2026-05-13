import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';

export default function UploadModal({ isOpen, onClose }) {
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    function handleDragOver(e) {
        e.preventDefault();
        setDragOver(true);
    }

    function handleDragLeave() {
        setDragOver(false);
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) validateAndSet(file);
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) validateAndSet(file);
    }

    function validateAndSet(file) {
        const validTypes = [
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];
        const validExtensions = ['.csv', '.xlsx', '.xls'];
        const extension = '.' + file.name.split('.').pop().toLowerCase();

        if (validTypes.includes(file.type) || validExtensions.includes(extension)) {
            setSelectedFile(file);
        } else {
            alert('Format file tidak valid. Gunakan file CSV atau Excel (.xlsx, .xls).');
        }
    }

    function handleSubmit() {
        if (!selectedFile) return;
        console.log('Upload file:', selectedFile.name, selectedFile.size);
        // TODO: Kirim ke backend via Inertia
        setSelectedFile(null);
        onClose();
    }

    function handleClose() {
        setSelectedFile(null);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-card rounded-2xl border border-border shadow-2xl
                            w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div>
                        <h2 className="text-base font-bold text-text-primary">
                            Import Jadwal Prodi
                        </h2>
                        <p className="text-xs text-text-muted mt-0.5">
                            Unggah file jadwal semester terbaru
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-lg text-text-muted hover:bg-surface
                                   hover:text-text-secondary transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    {!selectedFile ? (
                        /* Dropzone */
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                                flex flex-col items-center justify-center gap-3
                                border-2 border-dashed rounded-xl px-6 py-10 cursor-pointer
                                transition-all duration-200
                                ${dragOver
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-border hover:border-primary-500/40 hover:bg-surface'
                                }
                            `}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                                ${dragOver ? 'bg-primary-500/10' : 'bg-surface'}`}>
                                <Upload
                                    size={24}
                                    className={`transition-colors ${dragOver ? 'text-primary-500' : 'text-text-muted'}`}
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-text-primary">
                                    Seret file ke sini atau{' '}
                                    <span className="text-primary-500 font-semibold">pilih file</span>
                                </p>
                                <p className="text-xs text-text-muted mt-1">
                                    Format: CSV, XLSX, XLS (maks. 10MB)
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    ) : (
                        /* File selected */
                        <div className="flex items-center gap-3 bg-success/5 border border-success/20
                                        rounded-xl px-4 py-3">
                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                                <FileSpreadsheet size={20} className="text-success" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-text-muted">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <CheckCircle size={20} className="text-success shrink-0" />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-surface/50">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-text-secondary
                                   border border-border rounded-lg hover:bg-surface transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedFile}
                        className="px-4 py-2 text-sm font-medium text-white
                                   bg-primary-500 hover:bg-primary-600
                                   disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed
                                   rounded-lg transition-colors"
                    >
                        Unggah Jadwal
                    </button>
                </div>
            </div>
        </div>
    );
}
