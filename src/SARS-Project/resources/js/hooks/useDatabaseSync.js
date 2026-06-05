import { useEffect } from 'react';
import { router } from '@inertiajs/react';

/**
 * Hook untuk listen database sync events dan auto reload data
 * 
 * @param {string|string[]} tables - Nama table atau array tables yang di-monitor
 * @param {Function} callback - Optional callback saat event terjadi
 * @param {boolean} autoReload - Auto reload Inertia page (default: true)
 */
export function useDatabaseSync(tables = [], callback = null, autoReload = true) {
    useEffect(() => {
        const tablesToWatch = Array.isArray(tables) ? tables : [tables];

        const handleSync = (event) => {
            const { table, action, data } = event.detail;

            // Check if table in watch list
            if (tablesToWatch.length === 0 || tablesToWatch.includes(table)) {
                console.log(`Database sync: ${action} on ${table}`, data);

                // Execute callback if provided
                if (callback) {
                    callback(table, action, data);
                }

                // Auto reload page to get fresh data
                if (autoReload) {
                    router.reload({ only: ['schedules', 'courses', 'rooms', 'notifications', 'changeRequests'] });
                }
            }
        };

        window.addEventListener('database-sync', handleSync);

        return () => {
            window.removeEventListener('database-sync', handleSync);
        };
    }, [tables, callback, autoReload]);
}

/**
 * Hook untuk listen specific table sync
 */
export function useTableSync(tableName, callback = null, autoReload = true) {
    return useDatabaseSync(tableName, callback, autoReload);
}

export default useDatabaseSync;
