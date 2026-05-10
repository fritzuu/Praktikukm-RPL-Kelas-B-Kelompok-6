import { SlidersHorizontal } from 'lucide-react';
import { MOCK_AKTIVITAS } from '../../data/mockData';

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

export default function RecentActivity({ activities = MOCK_AKTIVITAS }) {
    return (
        <section>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">
                    Aktivitas Terbaru
                </h2>
                <button className="p-2 rounded-lg text-text-muted hover:bg-surface hover:text-text-secondary transition-colors">
                    <SlidersHorizontal size={16} />
                </button>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                                    Anggota Fakultas
                                </th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                                    Aksi
                                </th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                                    Status
                                </th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                                    Waktu
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600
                                                            flex items-center justify-center text-xs font-bold shrink-0">
                                                {item.avatarInitial}
                                            </div>
                                            <span className="font-medium text-text-primary text-sm">
                                                {item.nama}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-text-secondary text-sm">
                                        {item.aksi}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                                                STATUS_STYLES[item.status] || STATUS_STYLES.tertunda
                                            }`}
                                        >
                                            {STATUS_LABELS[item.status] || item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-text-muted text-sm whitespace-nowrap">
                                        {item.waktu}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
