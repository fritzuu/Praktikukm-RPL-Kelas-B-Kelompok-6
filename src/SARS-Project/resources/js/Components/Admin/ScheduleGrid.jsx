import { useState } from 'react';
import { CalendarDays, ExternalLink } from 'lucide-react';
import { MOCK_JADWAL } from '../../data/mockData';

const HARI_LIST = [
    { key: 'senin', label: 'Sen' },
    { key: 'selasa', label: 'Sel' },
    { key: 'rabu', label: 'Rab' },
    { key: 'kamis', label: 'Kam' },
    { key: 'jumat', label: 'Jum' },
];

const TIME_SLOTS = [
    { label: '08:00 – 10:00', mulai: '08:00', selesai: '10:00' },
    { label: '10:00 – 12:00', mulai: '10:00', selesai: '12:00' },
    { label: '13:00 – 15:00', mulai: '13:00', selesai: '15:00' },
    { label: '15:00 – 17:00', mulai: '15:00', selesai: '17:00' },
];

const TIPE_STYLES = {
    resmi: 'bg-danger/5 border-danger/30 text-danger/80',
    override: 'bg-warning/5 border-warning/30 text-warning/80',
    konflik: 'bg-danger/10 border-danger/50 border-dashed text-danger',
};

const TIPE_LABELS = {
    resmi: null,
    override: 'Override',
    konflik: 'Konflik',
};

export default function ScheduleGrid({ jadwalItems = MOCK_JADWAL }) {
    const [viewMode, setViewMode] = useState('mingguan');

    function getJadwalForSlot(hari, mulai, selesai) {
        return jadwalItems.filter(
            (j) => j.hari === hari && j.jamMulai === mulai && j.jamSelesai === selesai
        );
    }

    // Tanggal header mock (mengikuti desain mockup)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    function getDateLabel(idx) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + idx);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${dd}/${mm}`;
    }

    return (
        <section className="mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CalendarDays size={20} className="text-text-primary" />
                    <h2 className="text-lg font-bold text-text-primary">
                        Jadwal Prodi Informatika
                    </h2>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => setViewMode('mingguan')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
                            ${viewMode === 'mingguan'
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'bg-card text-text-secondary border-border hover:bg-surface'
                            }`}
                    >
                        Tampilan Mingguan
                    </button>
                    <button
                        onClick={() => setViewMode('jurusan')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
                            ${viewMode === 'jurusan'
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'bg-card text-text-secondary border-border hover:bg-surface'
                            }`}
                    >
                        Tampilan Jurusan
                    </button>
                </div>
            </div>

            {/* Grid Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-muted w-28">
                                    Waktu
                                </th>
                                {HARI_LIST.map((h, idx) => (
                                    <th
                                        key={h.key}
                                        className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-text-muted"
                                    >
                                        {h.label} ({getDateLabel(idx)})
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {TIME_SLOTS.map((slot) => (
                                <tr key={slot.label} className="border-b border-border last:border-b-0">
                                    <td className="px-4 py-3 text-xs font-semibold text-primary-500 whitespace-nowrap align-top">
                                        {slot.label}
                                    </td>
                                    {HARI_LIST.map((h) => {
                                        const items = getJadwalForSlot(h.key, slot.mulai, slot.selesai);
                                        return (
                                            <td key={h.key} className="px-2 py-2 align-top">
                                                {items.length > 0 ? (
                                                    items.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className={`
                                                                rounded-lg border px-3 py-2 mb-1 last:mb-0
                                                                ${TIPE_STYLES[item.tipe] || TIPE_STYLES.resmi}
                                                            `}
                                                        >
                                                            <p className="font-semibold text-xs leading-tight">
                                                                {item.kode} ({item.nama})
                                                            </p>
                                                            <p className="text-[11px] mt-0.5 opacity-70">
                                                                {item.ruangan} • {item.dosen}
                                                            </p>
                                                            {TIPE_LABELS[item.tipe] && (
                                                                <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-current/10">
                                                                    {TIPE_LABELS[item.tipe]}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="h-12 rounded-lg bg-success/5 border border-success/20" />
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer link */}
                <div className="text-center py-3 border-t border-border">
                    <button className="text-xs font-semibold text-primary-500 hover:text-primary-600
                                       inline-flex items-center gap-1 transition-colors">
                        <span>Buka Antarmuka Penjadwalan</span>
                        <ExternalLink size={12} />
                    </button>
                </div>
            </div>
        </section>
    );
}
