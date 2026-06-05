# Realtime Database Sync Setup

## Setup Complete ✓

Database realtime sync dengan Laravel Reverb sudah aktif.

## Cara Kerja

1. **Backend**: Setiap model yang ditambah trait `BroadcastsChanges` akan otomatis broadcast event saat:
   - `created` - Record baru dibuat
   - `updated` - Record di-update
   - `deleted` - Record dihapus

2. **Frontend**: Laravel Echo listen ke channel `database-sync` dan dispatch browser event

3. **React Components**: Gunakan hook `useDatabaseSync` untuk auto-reload data

## Models dengan Realtime Sync

- ✓ Schedule
- ✓ Course
- ✓ Room
- ✓ ChangeRequest
- ✓ Notification
- ✓ Approval
- ✓ Activity

## Penggunaan di React Component

### Auto Reload Semua Tables
```jsx
import { useDatabaseSync } from '@/hooks/useDatabaseSync';

export default function Dashboard({ schedules }) {
    // Auto reload saat ada perubahan di semua table
    useDatabaseSync();
    
    return <div>...</div>;
}
```

### Monitor Specific Tables
```jsx
import { useDatabaseSync } from '@/hooks/useDatabaseSync';

export default function SchedulePage({ schedules }) {
    // Hanya reload saat ada perubahan di schedules atau rooms
    useDatabaseSync(['schedules', 'rooms']);
    
    return <div>...</div>;
}
```

### Custom Callback
```jsx
import { useDatabaseSync } from '@/hooks/useDatabaseSync';
import { useState } from 'react';

export default function NotificationPanel({ notifications }) {
    const [count, setCount] = useState(notifications.length);
    
    useDatabaseSync('notifications', (table, action, data) => {
        if (action === 'created') {
            setCount(prev => prev + 1);
            // Show toast notification
            toast.success('New notification!');
        }
    }, false); // false = don't auto reload, handle manually
    
    return <div>Notifications: {count}</div>;
}
```

### Single Table Monitor
```jsx
import { useTableSync } from '@/hooks/useDatabaseSync';

export default function RoomList({ rooms }) {
    // Shorthand untuk monitor 1 table
    useTableSync('rooms');
    
    return <div>...</div>;
}
```

## Menjalankan Reverb Server

Terminal 1 - Laravel App:
```bash
php artisan serve
```

Terminal 2 - Reverb WebSocket Server:
```bash
php artisan reverb:start
```

Terminal 3 - Queue Worker (untuk broadcast):
```bash
php artisan queue:work
```

Terminal 4 - Frontend Dev:
```bash
npm run dev
```

## Testing

Console browser akan log setiap database sync event:
```
Database sync: created on schedules {id: 1, ...}
Database sync: updated on change_requests {id: 5, ...}
Database sync: deleted on notifications {id: 3}
```

## Environment Variables

Sudah dikonfigurasi di `.env`:
```env
BROADCAST_CONNECTION=reverb
QUEUE_CONNECTION=database

REVERB_APP_ID=265696
REVERB_APP_KEY=eqpujd70rb2pj5s6qqgh
REVERB_APP_SECRET=6prhnblhzparxmgfecyz
REVERB_HOST="localhost"
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

## Troubleshooting

### Event tidak terkirim
1. Pastikan Reverb server running: `php artisan reverb:start`
2. Pastikan queue worker running: `php artisan queue:work`
3. Check console browser ada error koneksi WebSocket

### Frontend tidak reload
1. Check browser console ada log "Database sync event"
2. Pastikan import `'./echo'` ada di `app.jsx`
3. Check VITE env variables di `.env` sudah benar

### Broadcast queue stuck
```bash
# Clear failed jobs
php artisan queue:flush

# Restart queue worker
php artisan queue:restart
```

## Menambah Model Baru

Edit model dan tambah trait:
```php
use App\Traits\BroadcastsChanges;

class YourModel extends Model
{
    use HasFactory, BroadcastsChanges;
    // ...
}
```

Done! Model otomatis broadcast changes.

## Production Setup

Update `.env` production:
```env
REVERB_HOST=your-domain.com
REVERB_PORT=443
REVERB_SCHEME=https

VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

Deploy Reverb dengan supervisor atau PM2.
