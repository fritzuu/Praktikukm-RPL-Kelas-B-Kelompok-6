import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Trash2, AlertTriangle } from 'lucide-react';
import MahasiswaLayout from '../../../Layouts/MahasiswaLayout';
import Modal from '../../../Components/Modal';
import ScheduleGrid from '../../../Components/Shared/ScheduleGrid';

export default function Jadwal({ schedules = [], rooms = [] }) {
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [scheduleToDelete, setScheduleToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

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
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                        Jadwal Akademik
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm">
                        Lihat ketersediaan ruangan dan filter matkul.
                    </p>
                </div>
            </div>

            {/* View Tab */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden p-6">
                <ScheduleGrid 
                    jadwalItems={schedules} 
                    rooms={rooms} 
                    showConflicts={true} 
                    onExport={(jadwalItems) => console.log('Exporting jadwal...', jadwalItems)}
                    onCardClick={handleCardClick}
                />
            </div>

            {/* Details Modal */}
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
                                        : selectedSchedule.mulai && selectedSchedule.selesai
                                            ? `${selectedSchedule.mulai.substring(0,5)} - ${selectedSchedule.selesai.substring(0,5)}`
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
                                        {selectedSchedule.dosen && selectedSchedule.dosen !== '-' ? selectedSchedule.dosen.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <p className="font-semibold text-text-primary">
                                        {!selectedSchedule.dosen || selectedSchedule.dosen === '-' ? 'Belum Ditentukan' : selectedSchedule.dosen}
                                    </p>
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

Jadwal.layout = (page) => <MahasiswaLayout>{page}</MahasiswaLayout>;
