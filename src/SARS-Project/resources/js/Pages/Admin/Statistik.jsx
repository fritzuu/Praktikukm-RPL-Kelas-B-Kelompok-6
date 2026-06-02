import { motion } from 'framer-motion';
import {
    ClipboardList,
    CheckCircle,
    XCircle,
    TrendingUp,
    Clock,
    Timer,
} from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';

// ── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
});

// ── Color maps ───────────────────────────────────────────────────────────────
const COLOR_CLASS = {
    success: {
        bg: 'bg-success/10',
        text: 'text-success',
        bar: 'bg-success',
    },
    warning: {
        bg: 'bg-warning/10',
        text: 'text-warning',
        bar: 'bg-warning',
    },
    danger: {
        bg: 'bg-danger/10',
        text: 'text-danger',
        bar: 'bg-danger',
    },
    muted: {
        bg: 'bg-surface',
        text: 'text-text-muted',
        bar: 'bg-text-muted',
    },
    primary: {
        bg: 'bg-primary-500/10',
        text: 'text-primary-500',
        bar: 'bg-primary-500',
    },
};

// ── Overview Card ─────────────────────────────────────────────────────────────
function OverviewCard({ icon: Icon, label, value, colorKey = 'primary', delay = 0 }) {
    const colors = COLOR_CLASS[colorKey] ?? COLOR_CLASS.primary;
    return (
        <motion.div
            {...fadeUp(delay)}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-3"
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg}`}>
                <Icon size={20} className={colors.text} />
            </div>
            <div>
                <p className="text-2xl font-bold text-text-primary leading-none">{value}</p>
                <p className="text-xs text-text-muted mt-1">{label}</p>
            </div>
        </motion.div>
    );
}

// ── Weekly Bar Chart ──────────────────────────────────────────────────────────
function WeeklyTrendChart({ data }) {
    const maxTotal = Math.max(...data.map((w) => w.total), 1);

    return (
        <div className="flex flex-col gap-4">
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-success inline-block" />
                    Disetujui
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-danger inline-block" />
                    Ditolak
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-text-muted/30 inline-block" />
                    Lainnya
                </span>
            </div>

            {/* Bars */}
            <div className="flex items-end gap-2 h-40">
                {data.map((week, i) => {
                    const heightPct = (week.total / maxTotal) * 100;
                    const approvedPct = week.total > 0 ? (week.approved / week.total) * 100 : 0;
                    const rejectedPct = week.total > 0 ? (week.rejected / week.total) * 100 : 0;
                    const otherPct = Math.max(0, 100 - approvedPct - rejectedPct);

                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                            {/* Count label */}
                            <span className="text-[10px] text-text-muted">{week.total > 0 ? week.total : ''}</span>

                            {/* Bar column */}
                            <div
                                className="w-full rounded-t-md overflow-hidden flex flex-col-reverse bg-border/30"
                                style={{ height: `${Math.max(heightPct, week.total > 0 ? 4 : 0)}%`, minHeight: week.total > 0 ? '4px' : '0' }}
                            >
                                {/* approved (bottom = green) */}
                                <div
                                    className="bg-success transition-all duration-500"
                                    style={{ height: `${approvedPct}%` }}
                                />
                                {/* rejected (middle = red) */}
                                <div
                                    className="bg-danger transition-all duration-500"
                                    style={{ height: `${rejectedPct}%` }}
                                />
                                {/* other/pending (top = muted) */}
                                <div
                                    className="bg-text-muted/30 transition-all duration-500"
                                    style={{ height: `${otherPct}%` }}
                                />
                            </div>

                            {/* X-axis label */}
                            <span className="text-[9px] text-text-muted text-center leading-tight">
                                {week.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Donut / Conic-gradient Chart ─────────────────────────────────────────────
function TypeDonutChart({ typeDistribution }) {
    const temp = typeDistribution.temporary ?? 0;
    const perm = typeDistribution.permanent ?? 0;
    const total = temp + perm;

    const tempPct = total > 0 ? Math.round((temp / total) * 100) : 0;
    const permPct = total > 0 ? 100 - tempPct : 0;

    // conic-gradient stops
    const gradient =
        total === 0
            ? 'conic-gradient(#94a3b8 0% 100%)'
            : `conic-gradient(
                #f59e0b 0% ${tempPct}%,
                #3b82f6 ${tempPct}% 100%
              )`;

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Donut */}
            <div className="relative w-40 h-40 flex items-center justify-center">
                <div
                    className="w-full h-full rounded-full"
                    style={{ background: gradient }}
                />
                {/* Hole */}
                <div className="absolute w-24 h-24 rounded-full bg-card flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-text-primary">{total}</span>
                    <span className="text-[10px] text-text-muted">Total</span>
                </div>
            </div>

            {/* Legend */}
            <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
                        <span className="text-sm text-text-secondary">Sementara</span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-semibold text-text-primary">{temp}</span>
                        <span className="text-xs text-text-muted ml-1">({tempPct}%)</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
                        <span className="text-sm text-text-secondary">Permanen</span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-semibold text-text-primary">{perm}</span>
                        <span className="text-xs text-text-muted ml-1">({permPct}%)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Horizontal Status Bar Chart ───────────────────────────────────────────────
function StatusBarChart({ statusDistribution }) {
    const maxCount = Math.max(...statusDistribution.map((s) => s.count), 1);

    return (
        <div className="space-y-3">
            {statusDistribution.map((item, i) => {
                const colors = COLOR_CLASS[item.color] ?? COLOR_CLASS.muted;
                const widthPct = Math.max((item.count / maxCount) * 100, item.count > 0 ? 2 : 0);

                return (
                    <div key={i} className="flex items-center gap-3">
                        {/* Label */}
                        <span className="text-xs text-text-secondary w-28 shrink-0 truncate">
                            {item.label}
                        </span>
                        {/* Bar track */}
                        <div className="flex-1 h-2.5 bg-border/40 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                                style={{ width: `${widthPct}%` }}
                            />
                        </div>
                        {/* Count */}
                        <span className={`text-xs font-semibold w-6 text-right ${colors.text}`}>
                            {item.count}
                        </span>
                    </div>
                );
            })}

            {statusDistribution.length === 0 && (
                <p className="text-sm text-text-muted text-center py-4">Belum ada data.</p>
            )}
        </div>
    );
}

// ── Ranked Mini List (rooms / courses) ───────────────────────────────────────
function RankedList({ title, items, renderLabel, renderSub }) {
    const maxCount = Math.max(...items.map((i) => i.count), 1);

    return (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-text-primary mb-4">{title}</h3>

            {items.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-3">Belum ada data.</p>
            ) : (
                <div className="space-y-3">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            {/* Rank badge */}
                            <span className="w-5 h-5 rounded-full bg-primary-500/10 text-primary-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {i + 1}
                            </span>
                            {/* Labels */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-text-primary truncate">
                                    {renderLabel(item)}
                                </p>
                                {renderSub && (
                                    <p className="text-[10px] text-text-muted">{renderSub(item)}</p>
                                )}
                            </div>
                            {/* Mini bar + count */}
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-border/40 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary-500 rounded-full"
                                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs font-semibold text-text-primary w-5 text-right">
                                    {item.count}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Statistik({
    overview = {},
    statusDistribution = [],
    typeDistribution = { temporary: 0, permanent: 0 },
    weeklyTrend = [],
    topRooms = [],
    topCourses = [],
}) {
    const {
        totalRequests = 0,
        totalApproved = 0,
        totalRejected = 0,
        approvalRate = 0,
        pendingCount = 0,
        avgProcessingDays = 0,
        activeSemester = '-',
    } = overview;

    // Ensure weeklyTrend always has 8 entries for a full chart
    const chartData = weeklyTrend.length > 0
        ? weeklyTrend
        : Array.from({ length: 8 }, (_, i) => ({ label: `W${i + 1}`, total: 0, approved: 0, rejected: 0 }));

    return (
        <div className="space-y-6">
            {/* ── Page Header ─────────────────────────────────────────── */}
            <motion.div {...fadeUp(0)}>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                    Statistik Sistem
                </h1>
                <p className="text-text-secondary mt-1 text-sm">
                    Gambaran menyeluruh aktivitas pengajuan perubahan jadwal
                    {activeSemester !== '-' && (
                        <span className="ml-1 font-medium text-primary-500">· {activeSemester}</span>
                    )}
                </p>
            </motion.div>

            {/* ── Row 1: Overview Cards ───────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <OverviewCard
                    icon={ClipboardList}
                    label="Total Pengajuan"
                    value={totalRequests}
                    colorKey="primary"
                    delay={0.05}
                />
                <OverviewCard
                    icon={CheckCircle}
                    label="Disetujui"
                    value={totalApproved}
                    colorKey="success"
                    delay={0.1}
                />
                <OverviewCard
                    icon={XCircle}
                    label="Ditolak"
                    value={totalRejected}
                    colorKey="danger"
                    delay={0.15}
                />
                <OverviewCard
                    icon={TrendingUp}
                    label="Approval Rate"
                    value={`${approvalRate}%`}
                    colorKey="primary"
                    delay={0.2}
                />
                <OverviewCard
                    icon={Clock}
                    label="Pending"
                    value={pendingCount}
                    colorKey="warning"
                    delay={0.25}
                />
                <OverviewCard
                    icon={Timer}
                    label="Avg Proses"
                    value={`${avgProcessingDays} hari`}
                    colorKey="muted"
                    delay={0.3}
                />
            </div>

            {/* ── Row 2: Weekly Trend + Type Distribution ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Weekly Trend */}
                <motion.div
                    {...fadeUp(0.35)}
                    className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 shadow-sm"
                >
                    <h2 className="text-base font-semibold text-text-primary mb-1">Tren Mingguan</h2>
                    <p className="text-xs text-text-muted mb-5">Jumlah pengajuan per minggu (8 minggu terakhir)</p>
                    <WeeklyTrendChart data={chartData} />
                </motion.div>

                {/* Type Distribution */}
                <motion.div
                    {...fadeUp(0.4)}
                    className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm"
                >
                    <h2 className="text-base font-semibold text-text-primary mb-1">Distribusi Tipe</h2>
                    <p className="text-xs text-text-muted mb-5">Perbandingan tipe pengajuan</p>
                    <TypeDonutChart typeDistribution={typeDistribution} />
                </motion.div>
            </div>

            {/* ── Row 3: Status Distribution + Top Rooms / Courses ────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <motion.div
                    {...fadeUp(0.45)}
                    className="bg-card border border-border rounded-2xl p-6 shadow-sm"
                >
                    <h2 className="text-base font-semibold text-text-primary mb-1">Distribusi Status</h2>
                    <p className="text-xs text-text-muted mb-5">Sebaran pengajuan berdasarkan status saat ini</p>
                    <StatusBarChart statusDistribution={statusDistribution} />
                </motion.div>

                {/* Top Rooms + Top Courses stacked */}
                <div className="flex flex-col gap-4">
                    <motion.div {...fadeUp(0.5)}>
                        <RankedList
                            title="Ruangan Tersibuk"
                            items={topRooms}
                            renderLabel={(item) => item.room}
                            renderSub={null}
                        />
                    </motion.div>

                    <motion.div {...fadeUp(0.55)}>
                        <RankedList
                            title="Mata Kuliah Tersibuk"
                            items={topCourses}
                            renderLabel={(item) => item.course}
                            renderSub={(item) => item.code}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// Inertia persistent layout
Statistik.layout = (page) => <AdminLayout>{page}</AdminLayout>;
