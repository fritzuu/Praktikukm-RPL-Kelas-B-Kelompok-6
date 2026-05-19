import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import Modal from '../../Components/Modal';
import WelcomeHeader from '../../Components/Shared/WelcomeHeader';
import ActivityTable from '../../Components/Shared/ActivityTable';
import AdminStatCards from '../../Components/Admin/AdminStatCards';
import AdminInsightCards from '../../Components/Admin/AdminInsightCards';
import ScheduleGrid from '../../Components/Shared/ScheduleGrid';
import ConflictAlerts from '../../Components/Admin/ConflictAlerts';
import {
    MOCK_JADWAL,
    MOCK_KONFLIK,
    MOCK_AKTIVITAS,
    MOCK_SYNC_STATUS,
    MOCK_ROOMS,
    MOCK_INSIGHTS,
} from '../../data/mockData';

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
    jadwal = MOCK_JADWAL,
    konflik = MOCK_KONFLIK,
    aktivitas = MOCK_AKTIVITAS,
    syncStatus = MOCK_SYNC_STATUS,
    insights = MOCK_INSIGHTS,
    rooms = MOCK_ROOMS,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [selectedSchedule, setSelectedSchedule] = useState(null);

    const handleCardClick = (item) => {
        setSelectedSchedule(item);
    };

    return (
        <>
            <WelcomeHeader
                user={user}
                subtitle={
                    <>
                        Operasi akademik stabil dengan{' '}
                        <span className="font-semibold text-danger">{konflik.length} konflik</span> tertunda.
                    </>
                }
            >
                <AdminStatCards syncStatus={syncStatus} />
            </WelcomeHeader>

            <AdminInsightCards insights={insights} />

            <ScheduleGrid 
                jadwalItems={jadwal} 
                rooms={rooms} 
                showConflicts={true} 
                onExport={(jadwal) => console.log('Exporting jadwal...', jadwal)}
                onCardClick={handleCardClick}
            />

            <ConflictAlerts conflicts={konflik} />

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
                                <p className="font-medium text-text-primary">{selectedSchedule.semester || '-'}</p>
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

                        <div className="pt-2 border-t border-border">
                            <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Dosen Pengajar</h4>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg">
                                    {selectedSchedule.dosen ? selectedSchedule.dosen.charAt(0).toUpperCase() : '?'}
                                </div>
                                <p className="font-semibold text-text-primary">{selectedSchedule.dosen}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}

// Inertia persistent layout — sidebar & topbar tetap ada saat navigasi
AdminDashboard.layout = (page) => <AdminLayout>{page}</AdminLayout>;
