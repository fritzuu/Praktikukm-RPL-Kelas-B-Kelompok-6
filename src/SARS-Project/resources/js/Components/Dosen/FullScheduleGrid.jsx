import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SESI_LIST = Array.from({ length: 12 }, (_, i) => i + 1);
const HARI_LIST = [
    { key: 'senin', label: 'Senin' },
    { key: 'selasa', label: 'Selasa' },
    { key: 'rabu', label: 'Rabu' },
    { key: 'kamis', label: 'Kamis' },
    { key: 'jumat', label: 'Jumat' },
];

export default function FullScheduleGrid({ schedules = [], rooms = [] }) {
    const [selectedDay, setSelectedDay] = useState('senin');

    const filteredSchedules = schedules.filter(s => s.hari === selectedDay);

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm mb-8">
            <div className="p-6 border-b border-border bg-surface/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-text-primary">Jadwal & Ketersediaan Ruangan</h2>
                    <div className="flex bg-surface p-1 rounded-xl w-fit">
                        {HARI_LIST.map((hari) => (
                            <button
                                key={hari.key}
                                onClick={() => setSelectedDay(hari.key)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    selectedDay === hari.key
                                        ? 'bg-white text-primary-500 shadow-sm'
                                        : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                {hari.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto overflow-y-hidden no-scrollbar">
                <table className="w-full border-collapse table-fixed min-w-[1200px]">
                    <thead>
                        <tr className="bg-surface/50 border-b border-border">
                            <th className="sticky left-0 z-20 bg-surface/50 border-r border-border p-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest w-40">
                                Ruangan
                            </th>
                            {SESI_LIST.map(sesi => (
                                <th key={sesi} className="p-4 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest border-r border-border/50">
                                    Sesi {sesi}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((room) => (
                            <tr key={room.id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                                <td className="sticky left-0 z-20 bg-white border-r border-border p-4 text-sm font-bold text-text-primary">
                                    {room.code}
                                </td>
                                {SESI_LIST.map(sesi => {
                                    // Cari apakah ada jadwal yg mulai di sesi ini untuk ruangan ini
                                    const schedule = filteredSchedules.find(s => 
                                        s.ruangan_id === room.id && s.sesiMulai === sesi
                                    );

                                    if (schedule) {
                                        return (
                                            <td 
                                                key={sesi} 
                                                colSpan={schedule.durasi} 
                                                className="p-1 border-r border-border/50"
                                            >
                                                <div className={`
                                                    h-full min-h-[80px] p-2.5 rounded-xl border flex flex-col justify-center transition-all
                                                    ${schedule.isOwn 
                                                        ? 'bg-primary-500 border-primary-600 text-white shadow-lg shadow-primary-500/20' 
                                                        : 'bg-white border-border/60 text-text-primary shadow-sm hover:border-primary-500/30'
                                                    }
                                                `}>
                                                    <p className={`text-[9px] font-black uppercase tracking-tighter mb-0.5 ${schedule.isOwn ? 'text-white/80' : 'text-primary-500'}`}>
                                                        {schedule.kode}
                                                    </p>
                                                    <p className="text-[11px] font-bold leading-tight line-clamp-2">
                                                        {schedule.nama}
                                                    </p>
                                                    <p className={`text-[9px] mt-1 font-medium italic ${schedule.isOwn ? 'text-white/70' : 'text-text-muted'}`}>
                                                        {schedule.dosen}
                                                    </p>
                                                </div>
                                            </td>
                                        );
                                    }

                                    // Cek apakah sel ini ditutupi oleh colSpan jadwal sebelumnya
                                    const covered = filteredSchedules.some(s => 
                                        s.ruangan_id === room.id && 
                                        sesi > s.sesiMulai && 
                                        sesi < s.sesiMulai + s.durasi
                                    );

                                    if (covered) return null;

                                    return <td key={sesi} className="p-4 border-r border-border/30 bg-surface/5"></td>;
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="p-4 bg-surface/30 border-t border-border flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Jadwal Anda</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white border border-border"></div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Jadwal Lain</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-surface"></div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Tersedia</span>
                </div>
            </div>
        </div>
    );
}
