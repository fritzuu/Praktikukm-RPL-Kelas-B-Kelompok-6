import React from 'react';
import { Clock } from 'lucide-react';
import useServerTime, { getJakartaTimeParts, formatJakartaDate } from './useServerTime';

export default function LiveClockCard({ className = "" }) {
    const now = useServerTime();
    const { hour, minute, second } = getJakartaTimeParts(now);
    const timeString = `${hour}:${minute}:${second}`;
    const dateString = formatJakartaDate(now);

    return (
        <div className={`bg-card border border-border rounded-xl px-5 py-3 text-right hidden sm:flex flex-col justify-center items-end shadow-sm ${className}`}>
            <div className="flex items-center gap-2 justify-end mb-0.5">
                <Clock size={14} className="text-primary-500" />
                <span className="text-2xl font-bold text-text-primary tracking-tight font-mono">
                    {timeString}
                </span>
            </div>
            <p className="text-xs text-text-muted">{dateString}</p>
        </div>
    );
}
