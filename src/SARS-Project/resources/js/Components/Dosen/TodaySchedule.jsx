import { Clock, MapPin, Users, Radio } from 'lucide-react';
import { MOCK_JADWAL_HARI_INI } from '../../data/dosenMockData';

const STATUS_STYLES = {
    sedang_berlangsung: {
        badge: 'bg-success/10 text-success',
        label: 'Sedang Berlangsung',
        dot: 'bg-success animate-pulse',
        border: 'border-l-4 border-l-success',
    },
    belum_dimulai: {
        badge: 'bg-info/10 text-info',
        label: 'Belum Dimulai',
        dot: 'bg-info',
        border: 'border-l-4 border-l-info',
    },
    selesai: {
        badge: 'bg-text-muted/10 text-text-muted',
        label: 'Selesai',
        dot: 'bg-text-muted',
        border: 'border-l-4 border-l-border',
    },
};

export default function TodaySchedule({ schedules = MOCK_JADWAL_HARI_INI }) {
    const today = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('id-ID', options);

    return (
        <section className="mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Radio size={20} className="text-success" />
                        <h2 className="text-lg font-bold text-text-primary">
                            Jadwal Hari Ini
                        </h2>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5 ml-7">
                        {formattedDate}
                    </p>
                </div>
            </div>

            {/* Today Cards */}
            {schedules.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-6 text-center">
                    <p className="text-text-secondary font-medium">Tidak ada jadwal hari ini 🎉</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {schedules.map((item) => {
                        const st = STATUS_STYLES[item.status] || STATUS_STYLES.belum_dimulai;
                        return (
                            <div
                                key={item.id}
                                className={`bg-card border border-border rounded-xl px-5 py-4
                                           hover:shadow-md transition-all duration-200 ${st.border}`}
                            >
                                {/* Status badge */}
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${st.badge}`}>
                                        {st.label}
                                    </span>
                                </div>

                                {/* Course info */}
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-md">
                                        {item.kode}
                                    </span>
                                    {item.kelas !== '-' && (
                                        <span className="text-xs font-medium text-text-muted bg-surface px-2 py-0.5 rounded-md">
                                            Kelas {item.kelas}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-semibold text-text-primary text-sm mb-3">
                                    {item.nama}
                                </h3>

                                {/* Details */}
                                <div className="flex items-center gap-4 text-text-muted">
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <Clock size={13} />
                                        <span>{item.waktu}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <MapPin size={13} />
                                        <span>{item.ruangan}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <Users size={13} />
                                        <span>{item.mahasiswa} mhs</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
