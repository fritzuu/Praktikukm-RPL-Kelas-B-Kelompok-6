export default function WelcomeHeader({ user = {}, subtitle, children }) {
    // Greeting berdasarkan waktu
    const hour = new Date().getHours();
    let greeting = 'Selamat pagi';
    if (hour >= 12 && hour < 15) greeting = 'Selamat siang';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat sore';
    else if (hour >= 18) greeting = 'Selamat malam';

    return (
        <section className="mb-6 flex flex-col md:flex-row md:items-stretch md:justify-between gap-4 min-h-[4.5rem]">
            {/* Left Column: Greeting & Subtitle */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                    <span className="block text-lg md:text-xl font-medium text-text-secondary mb-1">
                        {greeting},
                    </span>
                    <span className="block">
                        {user?.name || 'User'}.
                    </span>
                </h1>
                {subtitle && (
                    <p className="text-text-secondary mt-1 text-sm">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Role-specific cards slot */}
            {children && (
                <div className="mt-4 md:mt-0 shrink-0">
                    {children}
                </div>
            )}
        </section>
    );
}
