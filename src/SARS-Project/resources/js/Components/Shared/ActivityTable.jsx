import { SlidersHorizontal } from 'lucide-react';

export default function ActivityTable({ title = 'Aktivitas Terbaru', items = [], columns = [], actions }) {
    return (
        <section>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">
                    {title}
                </h2>
                {actions || (
                    <button className="p-2 rounded-lg text-text-muted hover:bg-surface hover:text-text-secondary transition-colors">
                        <SlidersHorizontal size={16} />
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-muted"
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors"
                                >
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-3">
                                            {col.cell ? col.cell(item) : (
                                                <span className="text-text-secondary text-sm">
                                                    {item[col.key]}
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
