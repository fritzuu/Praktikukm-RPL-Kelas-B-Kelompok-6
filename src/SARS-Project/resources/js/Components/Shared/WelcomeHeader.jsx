export default function WelcomeHeader({ user = {}, subtitle, children }) {
    // Greeting berdasarkan waktu
    const hour = new Date().getHours();
    let greeting = 'Selamat pagi';
    if (hour >= 12 && hour < 15) greeting = 'Selamat siang';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat sore';
    else if (hour >= 18) greeting = 'Selamat malam';

    return (
        <section className="mb-6">
            {/* Greeting */}
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                {greeting}, {user?.name || 'User'}.
            </h1>
            {subtitle && (
                <p className="text-text-secondary mt-1 text-sm">
                    {subtitle}
                </p>
            )}

            {/* Role-specific cards slot */}
            {children && (
                <div className="mt-5">
                    {children}
                </div>
            )}
        </section>
    );
}
