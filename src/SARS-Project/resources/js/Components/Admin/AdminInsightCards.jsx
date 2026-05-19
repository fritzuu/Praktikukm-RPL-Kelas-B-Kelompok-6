import { ClipboardList, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

/**
 * AdminInsightCards
 *
 * Menampilkan 4 stat card ringkasan untuk Admin Dashboard:
 *   - Pending Requests   : total pengajuan yang belum mendapat keputusan
 *   - Conflict Detected  : konflik jadwal/ruangan yang sedang aktif
 *   - Accepted This Week : pengajuan disetujui dalam 7 hari terakhir
 *   - Declined This Week : pengajuan ditolak dalam 7 hari terakhir
 *
 * Props:
 *   insights: {
 *     pendingRequests:   number,
 *     conflictDetected:  number,
 *     acceptedThisWeek:  number,
 *     declinedThisWeek:  number,
 *   }
 *
 * Backend partner: ganti nilai MOCK_INSIGHTS di mockData.js
 * dengan data real dari Inertia page props (key: `insights`).
 */
export default function AdminInsightCards({
    insights = {
        pendingRequests: 0,
        conflictDetected: 0,
        acceptedThisWeek: 0,
        declinedThisWeek: 0,
    },
}) {
    const cards = [
        {
            id: 'pending-requests',
            label: 'Pending Requests',
            sublabel: 'Menunggu keputusan',
            value: insights.pendingRequests,
            icon: ClipboardList,
            iconBg: 'bg-warning/10 text-warning',
            badge: insights.pendingRequests > 0
                ? { label: 'Butuh Tindakan', cls: 'bg-warning/10 text-warning' }
                : null,
        },
        {
            id: 'conflict-detected',
            label: 'Conflict Detected',
            sublabel: 'Konflik aktif',
            value: insights.conflictDetected,
            icon: AlertTriangle,
            iconBg: 'bg-danger/10 text-danger',
            badge: insights.conflictDetected > 0
                ? { label: 'Perlu Resolusi', cls: 'bg-danger/10 text-danger' }
                : { label: 'Aman', cls: 'bg-success/10 text-success' },
        },
        {
            id: 'accepted-this-week',
            label: 'Accepted This Week',
            sublabel: '7 hari terakhir',
            value: insights.acceptedThisWeek,
            icon: CheckCircle,
            iconBg: 'bg-success/10 text-success',
            badge: null,
        },
        {
            id: 'declined-this-week',
            label: 'Declined This Week',
            sublabel: '7 hari terakhir',
            value: insights.declinedThisWeek,
            icon: XCircle,
            iconBg: 'bg-danger/10 text-danger',
            badge: null,
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 mb-6">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.id}
                        className="relative bg-card border border-border rounded-xl px-4 py-4
                                   hover:shadow-md hover:border-primary-500/20 transition-all duration-200
                                   group cursor-default"
                    >
                        {/* Icon + optional badge row */}
                        <div className="flex items-center justify-between gap-3 mb-3">
                            <div
                                className={`
                                    w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                    transition-transform duration-200 group-hover:scale-110
                                    ${card.iconBg}
                                `}
                            >
                                <Icon size={20} />
                            </div>

                            {card.badge && (
                                <span
                                    className={`
                                        text-[9px] font-bold uppercase tracking-wider
                                        px-2.5 py-1 rounded-lg leading-tight text-center min-w-0
                                        ${card.badge.cls}
                                    `}
                                >
                                    {card.badge.label}
                                </span>
                            )}
                        </div>

                        {/* Metric value */}
                        <p className="text-2xl font-bold text-text-primary tracking-tight">
                            {card.value}
                        </p>

                        {/* Label + sublabel */}
                        <p className="text-xs text-text-muted mt-1 leading-tight">
                            {card.label}
                        </p>
                        {card.sublabel && (
                            <p className="text-[10px] text-text-muted/70 mt-0.5">
                                {card.sublabel}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
