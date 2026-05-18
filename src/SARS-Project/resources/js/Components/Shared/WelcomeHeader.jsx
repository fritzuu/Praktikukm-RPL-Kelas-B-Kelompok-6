import { motion } from 'framer-motion';

export default function WelcomeHeader({ user = {}, subtitle, children }) {
    // Greeting berdasarkan waktu
    const hour = new Date().getHours();
    let greeting = 'Selamat pagi';
    if (hour >= 12 && hour < 15) greeting = 'Selamat siang';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat sore';
    else if (hour >= 18) greeting = 'Selamat malam';

    // Konfigurasi transisi spring yang mulus
    const springTransition = { type: 'spring', stiffness: 350, damping: 32 };

    return (
        <motion.section
            layout
            transition={springTransition}
            className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
            {/* Left Column: Greeting & Subtitle (Animate width/height changes) */}
            <motion.div
                layout
                transition={springTransition}
            >
                {/* layout="position" mencegah teks mengalami distorsi scale */}
                <motion.h1
                    layout="position"
                    transition={springTransition}
                    className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight"
                >
                    {greeting}, {user?.name || 'User'}.
                </motion.h1>
                {subtitle && (
                    <motion.p
                        layout="position"
                        transition={springTransition}
                        className="text-text-secondary mt-1 text-sm"
                    >
                        {subtitle}
                    </motion.p>
                )}
            </motion.div>

            {/* Role-specific cards slot */}
            {children && (
                <motion.div
                    layout="position"
                    transition={springTransition}
                    className="mt-4 md:mt-0 shrink-0"
                >
                    {children}
                </motion.div>
            )}
        </motion.section>
    );
}
