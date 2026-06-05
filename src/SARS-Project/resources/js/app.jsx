import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { route } from 'ziggy-js';
import '../css/app.css';
import './echo';

createInertiaApp({
    title: (title) => `${title} — SARS`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        // Inisialisasi Ziggy route() dengan config dari Inertia shared props
        // Ini memastikan route() bekerja di semua komponen React
        window.route = (name, params, absolute) =>
            route(name, params, absolute, props.initialPage.props.ziggy);

        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#1e3a8a',
    },
});

