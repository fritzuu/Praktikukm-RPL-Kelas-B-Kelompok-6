import { useForm, usePage } from '@inertiajs/react';
import unsImage from '../../../img/uns.png';
import PasswordInput from '../../Components/Shared/PasswordInput';

const ROLES = [
    { key: 'mahasiswa', label: 'STUDENT',  placeholder: 'mahasiswa@student.university.ac.id' },
    { key: 'dosen',     label: 'LECTURER', placeholder: 'dosen@university.ac.id' },
    { key: 'aslab',     label: 'ASLAB',    placeholder: 'aslab@university.ac.id' },
    { key: 'admin',     label: 'ADMIN',    placeholder: 'admin@university.ac.id' },
];

export default function Login() {
    const { errors: pageErrors } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        email:    '',
        password: '',
        remember: false,
        role:     'mahasiswa',
    });

    function handleRoleChange(key) {
        setData('role', key);
    }

    function handleSubmit(e) {
        e.preventDefault();
        post(route('login.submit'));
    }

    const activePlaceholder = ROLES.find(r => r.key === data.role)?.placeholder ?? '';

    return (
        <div className="min-h-screen bg-[#f0f2f8] flex items-center justify-center px-4 font-[Inter,sans-serif]">
            <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-10">

                {/* ── Left Column: Branding ── */}
                <div className="flex-1 hidden lg:flex flex-col justify-center gap-6 pr-8">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1e3a8a] rounded-xl flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0121 13c0 5.523-4.477 10-9 10S3 18.523 3 13a12.083 12.083 0 012.84-7.578L12 14z" />
                            </svg>
                        </div>
                        <span className="text-[#1e3a8a] font-bold text-xl tracking-tight">SARS</span>
                    </div>

                    {/* Headline */}
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                            Manage your academic<br />ecosystem with precision.
                        </h1>
                        <p className="mt-4 text-gray-500 text-base leading-relaxed max-w-sm">
                            Platform terintegrasi untuk mahasiswa, dosen, asisten lab, dan administrator dalam mengelola jadwal perkuliahan.
                        </p>
                    </div>

                    {/* Hero Image */}
                    <div className="rounded-2xl overflow-hidden shadow-xl w-full max-w-md aspect-[4/3] flex items-center justify-center bg-white">
                        <img 
                            src={unsImage} 
                            alt="Universitas Sebelas Maret" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* ── Right Column: Form Card ── */}
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 lg:p-10">

                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-6 lg:hidden">
                        <div className="w-8 h-8 bg-[#1e3a8a] rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                            </svg>
                        </div>
                        <span className="text-[#1e3a8a] font-bold text-lg">SARS</span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                    <p className="text-sm text-gray-400 mt-1 mb-6">Akses portal Anda sesuai peran</p>

                    {/* ── Role Tabs ── */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {ROLES.map(role => (
                            <button
                                key={role.key}
                                type="button"
                                onClick={() => handleRoleChange(role.key)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-full border tracking-wider transition-all duration-200 cursor-pointer ${
                                    data.role === role.key
                                        ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-sm'
                                        : 'bg-white text-gray-500 border-gray-300 hover:border-[#1e3a8a] hover:text-[#1e3a8a]'
                                }`}
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>

                    {/* ── General error flash ── */}
                    {(errors.role || pageErrors?.role) && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                            <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            <p className="text-xs text-red-600 font-medium">{errors.role || pageErrors?.role}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder={activePlaceholder}
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className={`w-full px-4 py-3 bg-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:bg-white transition-all duration-200 ${
                                    errors.email ? 'ring-2 ring-red-400 bg-red-50' : ''
                                }`}
                            />
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Password
                                </label>
                                <a href="#" className="text-xs font-semibold text-[#1e3a8a] hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                            <PasswordInput
                                id="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                autoFocus={false}
                                error={errors.password}
                            />


                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={e => setData('remember', e.target.checked)}
                                className="w-4 h-4 accent-[#1e3a8a] cursor-pointer"
                            />
                            <label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer select-none">
                                Ingat saya
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] active:scale-[.98] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {processing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-400 mt-8">
                        © {new Date().getFullYear()} SARS. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
