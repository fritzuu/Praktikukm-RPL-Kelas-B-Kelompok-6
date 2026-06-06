import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { AlertTriangle, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';
import Modal from '../../Components/Modal';
import WelcomeHeader from '../../Components/Shared/WelcomeHeader';
import ActivityTable from '../../Components/Shared/ActivityTable';
import AdminStatCards from '../../Components/Admin/AdminStatCards';
import AdminInsightCards from '../../Components/Admin/AdminInsightCards';
import ScheduleGrid from '../../Components/Shared/ScheduleGrid';
import ConflictAlerts from '../../Components/Admin/ConflictAlerts';
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
    jadwal = [],
    konflik = [],
    aktivitas = [],
    syncStatus = {},
    insights = {},
    rooms = [],
    flash = {},
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [scheduleToDelete, setScheduleToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [successMessage, setSuccessMessage] = useState(flash?.success || '');
    const [errorMessage, setErrorMessage] = useState(flash?.error || '');

    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            const timer = setTimeout(() => setSuccessMessage(''), 5000);
            return () => clearTimeout(timer);
        } else {
            setSuccessMessage('');
        }
    }, [flash, flash?.success]);

    useEffect(() => {
        if (flash?.error) {
            setErrorMessage(flash.error);
            const timer = setTimeout(() => setErrorMessage(''), 5000);
            return () => clearTimeout(timer);
        } else {
            setErrorMessage('');
        }
    }, [flash, flash?.error]);

    useEffect(() => {
        const handlePageShow = (event) => {
            if (event.persisted) {
                router.reload();
            }
        };

        window.addEventListener('pageshow', handlePageShow);

        try {
            const perfEntries = performance.getEntriesByType("navigation");
            if (perfEntries.length > 0 && perfEntries[0].type === "back_forward") {
                router.reload();
            }
        } catch (e) {
            console.error("Navigation timing API error:", e);
        }

        return () => {
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    const handleResolve = (scheduleId) => {
        const found = jadwal.find(s => s.id === scheduleId);
        if (found) {
            setScheduleToDelete(found);
        }
    };

    const handleResolveAll = () => {
        if (confirm("Apakah Anda yakin ingin menyelesaikan semua konflik secara otomatis? Tindakan ini akan menghapus jadwal-jadwal yang saling bertumpang tindih.")) {
            router.post(route('admin.jadwal.resolve-conflicts'), {}, {
                onSuccess: () => {
                    // Success flash message will automatically handle notification
                }
            });
        }
    };

    const handleCardClick = (item) => {
        setSelectedSchedule(item);
    };

    const confirmDelete = () => {
        if (!scheduleToDelete) return;
        setDeleteLoading(true);
        router.delete(route('admin.jadwal.destroy', scheduleToDelete.id), {
            onSuccess: () => {
                setDeleteLoading(false);
                setScheduleToDelete(null);
                setSelectedSchedule(null);
            },
            onError: () => {
                setDeleteLoading(false);
            }
        });
    };

    return (
        <>
            <WelcomeHeader user={user}>
                <AdminStatCards syncStatus={syncStatus} />
            </WelcomeHeader>

            {/* Flash Messages */}
            {successMessage && (
                <div className="mb-6 mt-4 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 px-4 py-3 rounded-xl shadow-sm animate-fade-in">
                    <CheckCircle size={18} className="shrink-0" />
                    <p className="text-xs font-semibold">{successMessage}</p>
                </div>
            )}
            {errorMessage && (
                <div className="mb-6 mt-4 flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 px-4 py-3 rounded-xl shadow-sm animate-fade-in">
                    <AlertCircle size={18} className="shrink-0" />
                    <p className="text-xs font-semibold">{errorMessage}</p>
                </div>
            )}

            <AdminInsightCards insights={insights} />

            <ScheduleGrid 
                jadwalItems={jadwal} 
                rooms={rooms} 
                showConflicts={true} 
                onExport={(jadwal) => console.log('Exporting jadwal...', jadwal)}
                onCardClick={handleCardClick}
            />

            <ConflictAlerts 
                conflicts={konflik} 
                onResolve={handleResolve}
                onResolveAll={konflik.length > 0 ? handleResolveAll : null}
            />

            <ActivityTable
                title="Aktivitas Terbaru"
                items={aktivitas}
                columns={ADMIN_ACTIVITY_COLUMNS}
            />

            <Modal
                isOpen={!!selectedSchedule}
                onClose={() => setSelectedSchedule(null)}
                title="Detail Jadwal"
                maxWidth="md"
            >
                {selectedSchedule && (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Mata Kuliah</h4>
                            <p className="text-lg font-bold text-text-primary">{selectedSchedule.nama} ({selectedSchedule.kode})</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Kelas</h4>
                                <p className="font-medium text-text-primary">{selectedSchedule.kelas || '-'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Semester</h4>
                                <p className="font-medium text-text-primary">{selectedSchedule.semesterNum || '-'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Ruangan</h4>
                                <p className="font-medium text-text-primary">{selectedSchedule.ruangan}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Hari</h4>
                                <p className="font-medium text-text-primary capitalize">{selectedSchedule.hari}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Waktu</h4>
                                <p className="font-medium text-text-primary">
                                    {selectedSchedule.jamMulai && selectedSchedule.jamAkhir 
                                        ? `${selectedSchedule.jamMulai.substring(0,5)} - ${selectedSchedule.jamAkhir.substring(0,5)}` 
                                        : 'Waktu belum diatur'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Sesi</h4>
                                <p className="font-medium text-text-primary">
                                    {selectedSchedule.durasi > 1 
                                        ? `Sesi ${selectedSchedule.sesiMulai} - ${selectedSchedule.sesiMulai + selectedSchedule.durasi - 1}`
                                        : `Sesi ${selectedSchedule.sesiMulai}`}
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-border flex flex-col gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Dosen Pengajar</h4>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg">
                                        {selectedSchedule.dosen ? selectedSchedule.dosen.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <p className="font-semibold text-text-primary">{selectedSchedule.dosen}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-2">
                                <button
                                    onClick={() => setScheduleToDelete(selectedSchedule)}
                                    className="flex-1 py-3 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2"
                                >
                                    <Trash2 size={16} /> Hapus Jadwal
                                </button>
                                <button
                                    onClick={() => setSelectedSchedule(null)}
                                    className="flex-1 py-3 bg-surface hover:bg-card border border-border text-text-secondary rounded-xl text-sm font-bold transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirm Delete Modal */}
            <Modal
                isOpen={!!scheduleToDelete}
                onClose={() => !deleteLoading && setScheduleToDelete(null)}
                maxWidth="sm"
            >
                <div className="relative p-2 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={28} className="text-danger" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-1">Hapus Jadwal?</h3>
                    <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                        Apakah Anda yakin ingin menghapus jadwal <strong>{scheduleToDelete?.nama} ({scheduleToDelete?.kode})</strong>? Tindakan ini akan menghapus permanen data jadwal tersebut.
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setScheduleToDelete(null)}
                            disabled={deleteLoading}
                            className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-semibold text-text-primary hover:bg-card transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={confirmDelete}
                            disabled={deleteLoading}
                            className="flex-1 px-4 py-2.5 bg-danger hover:bg-danger/90 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {deleteLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Trash2 size={16} />
                            )}
                            {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

// Inertia persistent layout — sidebar & topbar tetap ada saat navigasi
AdminDashboard.layout = (page) => <AdminLayout>{page}</AdminLayout>;
