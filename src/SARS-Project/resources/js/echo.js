import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});

// Listen to database sync events
window.Echo.channel('database-sync')
    .listen('.database.sync', (event) => {
        console.log('Database sync event:', event);
        
        // Dispatch custom browser event for components to listen
        window.dispatchEvent(new CustomEvent('database-sync', {
            detail: event
        }));
    });

export default window.Echo;
