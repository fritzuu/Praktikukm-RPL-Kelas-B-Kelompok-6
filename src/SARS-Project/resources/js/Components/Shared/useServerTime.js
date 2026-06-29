import { useState, useEffect, useMemo } from 'react';
import { usePage } from '@inertiajs/react';

export default function useServerTime() {
    const { serverTime } = usePage().props;
    
    // Fallback to client system clock if serverTime is not passed
    const initialServerTime = useMemo(() => {
        return serverTime ? Number(serverTime) : Date.now();
    }, [serverTime]);

    // Offset between server time and high-resolution performance timer
    const offset = useMemo(() => {
        return initialServerTime - performance.now();
    }, [initialServerTime]);

    const [currentTime, setCurrentTime] = useState(() => new Date(performance.now() + offset));

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date(performance.now() + offset));
        }, 1000);

        return () => clearInterval(timer);
    }, [offset]);

    return currentTime;
}

export function getJakartaTimeParts(date) {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Jakarta',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        const parts = formatter.formatToParts(date);
        const hour = parts.find(p => p.type === 'hour').value;
        const minute = parts.find(p => p.type === 'minute').value;
        const second = parts.find(p => p.type === 'second').value;
        return { hour, minute, second };
    } catch (e) {
        return {
            hour: String(date.getHours()).padStart(2, '0'),
            minute: String(date.getMinutes()).padStart(2, '0'),
            second: String(date.getSeconds()).padStart(2, '0')
        };
    }
}


export function formatJakartaDate(date) {
    try {
        return date.toLocaleDateString('id-ID', {
            timeZone: 'Asia/Jakarta',
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (e) {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}
