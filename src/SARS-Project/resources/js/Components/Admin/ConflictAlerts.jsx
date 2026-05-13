import { AlertTriangle } from 'lucide-react';
import { MOCK_KONFLIK } from '../../data/mockData';

const TIPE_BADGES = {
    bentrok_ruangan: { label: 'Ruangan Bentrok', style: 'bg-danger/10 text-danger' },
    bentrok_jadwal: { label: 'Jadwal Bentrok', style: 'bg-warning/10 text-warning' },
    umum: { label: 'Umum', style: 'bg-info/10 text-info' },
};

export default function ConflictAlerts({ conflicts = MOCK_KONFLIK }) {
    if (!conflicts.length) return null;

    return (
        <section className="mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={20} className="text-danger" />
                    <h2 className="text-lg font-bold text-text-primary">
                        Konflik Jadwal Mendesak
                    </h2>
                </div>
                <button className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors">
                    Selesaikan Semua
                </button>
            </div>

            {/* Conflict Cards */}
            <div className="space-y-3">
                {conflicts.map((conflict) => {
                    const badge = TIPE_BADGES[conflict.tipe] || TIPE_BADGES.umum;
                    return (
                        <div
                            key={conflict.id}
                            className="bg-card border border-border rounded-xl px-5 py-4
                                       border-l-4 border-l-danger"
                        >
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <h3 className="font-semibold text-text-primary text-sm">
                                    {conflict.judul}
                                </h3>
                                <span
                                    className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md shrink-0 ${badge.style}`}
                                >
                                    {badge.label}
                                </span>
                            </div>
                            <p className="text-text-secondary text-sm mb-3">
                                {conflict.deskripsi}
                            </p>
                            <div className="flex gap-2">
                                {conflict.aksi.map((aksi, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => console.log(`Aksi: ${aksi.label} untuk konflik ${conflict.id}`)}
                                        className={`
                                            text-xs font-medium px-3 py-1.5 rounded-lg transition-colors
                                            ${aksi.variant === 'primary'
                                                ? 'bg-primary-500 text-white hover:bg-primary-600'
                                                : 'bg-surface text-text-secondary border border-border hover:bg-border/50'
                                            }
                                        `}
                                    >
                                        {aksi.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
