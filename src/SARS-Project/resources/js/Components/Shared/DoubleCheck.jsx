/**
 * DoubleCheck — WhatsApp-style double-checkmark icon.
 * Two overlapping check strokes, sized like a Lucide icon.
 *
 * Props:
 *   size  {number}  Width/height in px. Default: 14
 *   className {string}
 */
export default function DoubleCheck({ size = 14, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            {/* Back check (slightly left) */}
            <polyline
                points="1,8 5,12 11,4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Front check (shifted right) */}
            <polyline
                points="5,8 9,12 15,4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
