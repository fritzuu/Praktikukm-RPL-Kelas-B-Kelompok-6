import React from 'react';
import { CalendarDays } from 'lucide-react';
import AslabLayout from '../../Layouts/AslabLayout';
import ScheduleGrid from '../../Components/Aslab/ScheduleGrid';

export default function AslabJadwal({ 
    allSchedules = [],
    rooms = [],
    semester = { nama: 'Genap', tahun: '2024/2025' }
}) {
    return (
        <div className="space-y-6">
            {/* ── Page Header ──────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <CalendarDays className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                            Jadwal Keseluruhan
                        </h1>
                        <p className="text-text-secondary text-sm">
                            Semester {semester?.nama || 'Genap'} TA {semester?.tahun || '2024/2025'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Render the unified ScheduleGrid component */}
            <ScheduleGrid schedules={allSchedules} rooms={rooms} />
        </div>
    );
}

AslabJadwal.layout = (page) => <AslabLayout>{page}</AslabLayout>;
