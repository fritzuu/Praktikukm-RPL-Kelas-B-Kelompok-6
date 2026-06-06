import { ClipboardCheck, Check, X, Clock } from 'lucide-react';

const JENIS_BADGES = {
    'Perubahan Jadwal': { style: 'bg-info/10 text-info' },
    'Izin Tidak Hadir': { style: 'bg-warning/10 text-warning' },
    'Penambahan Mata Kuliah': { style: 'bg-primary-500/10 text-primary-500' },
};

export default function ValidationQueue({ validations = [] }) {
    if (!validations.length) return null;

    return (
        <section className="mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ClipboardCheck size={20} className="text-text-primary" />
                    <h2 className="text-lg font-bold text-text-primary">
                        Antrian Validasi Mahasiswa
                    </h2>
                    <span className="text-xs font-bold bg-warning/10 text-warning px-2 py-0.5 rounded-full">
                        {validations.length} menunggu
                    </span>
                </div>
                <button className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors">
                    Lihat Semua
                </button>
            </div>

            {/* Validation Cards */}
            <div className="space-y-3">
                {validations.slice(0, 4).map((item) => {
                    const badge = JENIS_BADGES[item.jenis] || JENIS_BADGES['Perubahan Jadwal'];
                    return (
                        <div
                            key={item.id}
                            className="bg-card border border-border rounded-xl px-5 py-4
                                       hover:shadow-md transition-all duration-200 group"
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600
                                                flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                                    {item.avatarInitial}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-text-primary text-sm truncate">
                                            {item.nama}
                                        </h3>
                                        <span className="text-[10px] text-text-muted font-mono shrink-0">
                                            {item.nim}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${badge.style}`}>
                                            {item.jenis}
                                        </span>
                                        <span className="text-xs text-text-muted">
                                            • {item.mataKuliah}
                                        </span>
                                    </div>
                                    <p className="text-text-secondary text-sm leading-relaxed">
                                        {item.deskripsi}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-2 text-text-muted">
                                        <Clock size={12} />
                                        <span className="text-xs">{item.waktu}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => console.log(`Approved: ${item.id}`)}
                                        className="w-9 h-9 rounded-lg bg-success/10 text-success
                                                   hover:bg-success hover:text-white
                                                   flex items-center justify-center transition-all duration-150"
                                        title="Setujui"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => console.log(`Rejected: ${item.id}`)}
                                        className="w-9 h-9 rounded-lg bg-danger/10 text-danger
                                                   hover:bg-danger hover:text-white
                                                   flex items-center justify-center transition-all duration-150"
                                        title="Tolak"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
