import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AslabLayout from '../../Layouts/AslabLayout';
import WelcomeHeader from '../../Components/Aslab/WelcomeHeader';
import Modal from '../../Components/Modal';
import ScheduleGrid from '../../Components/Shared/ScheduleGrid';

export default function AslabDashboard({
    stats = { pendingVerification: 0, validation: 0, accepted: 0, rejected: 0 },
    jadwal = [],
    rooms = [],
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [selectedSchedule, setSelectedSchedule] = useState(null);

    const handleCardClick = (item) => {
        setSelectedSchedule(item);
    };

    return (
        <>
            <WelcomeHeader user={user} stats={stats} />

            {/* Schedule Grid — identical to Admin */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden p-6">
                <ScheduleGrid
                    jadwalItems={jadwal}
                    rooms={rooms}
                    showConflicts={true}
                    onCardClick={handleCardClick}
                />
            </div>

            {/* Details Modal — identical to Admin */}
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

// Inertia persistent layout
AslabDashboard.layout = (page) => <AslabLayout>{page}</AslabLayout>;
