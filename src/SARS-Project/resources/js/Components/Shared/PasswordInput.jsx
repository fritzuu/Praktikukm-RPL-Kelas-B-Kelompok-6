import { useId, useMemo, useState } from 'react';

export default function PasswordInput({
    value,
    onChange,
    placeholder = '••••••••',
    disabled = false,
    autoFocus = false,
    autoComplete = 'current-password',
    error,
    className = '',
    inputClassName = '',
    iconClassName = '',
    name,
    id,
    ...rest
}) {
    const reactId = useId();
    const inputId = id || name || `password-${reactId}`;

    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);


    // Ensure toggle remains mounted; only switch input type.
    const type = useMemo(() => (showPassword ? 'text' : 'password'), [showPassword]);


    return (
        <div className={`relative ${className}`.trim()}>
            <input
                id={inputId}
                name={name}
                type={type}
                autoComplete={autoComplete}

                placeholder={placeholder}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}

                value={value}
                onChange={onChange}
                disabled={disabled}
                autoFocus={autoFocus}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${inputId}-error` : undefined}
                className={`w-full pr-12 px-4 py-3 bg-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:bg-white transition-all duration-200 ${
                    error ? 'ring-2 ring-red-400 bg-red-50' : ''
                } ${inputClassName}`.trim()}
                {...rest}
            />

            <button
                type="button"
                tabIndex={0}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onMouseDown={(e) => {
                    // Prevent the button from stealing focus from the input.
                    // This avoids blur/toggle timing issues.
                    e.preventDefault();
                }}
                onClick={() => {
                    setShowPassword(v => !v);
                }}

                disabled={disabled}

                className={`absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-[#1e3a8a] transition-all duration-200 ease-out ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${iconClassName} ${
                    isFocused
                        ? 'opacity-100 scale-100 pointer-events-auto'
                        : 'opacity-0 scale-95 pointer-events-none'

                }`.trim()}
            >
                {showPassword ? (

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M3 3l18 18" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a18.3 18.3 0 0 1-2.6 3.7" />
                        <path d="M6.61 6.61C4.02 8.35 2 12 2 12s3.5 7 10 7c1.3 0 2.5-.3 3.6-.8" />
                        <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
                    </svg>
                )}
            </button>


            {error && (
                <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}

