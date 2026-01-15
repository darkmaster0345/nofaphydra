import { SVGProps } from 'react';
import { cn } from '@/lib/utils';

interface FursanLogoProps extends SVGProps<SVGSVGElement> {
    size?: number;
    variant?: 'star' | 'crescent';
    className?: string;
    withGlow?: boolean;
}

/**
 * FursanLogo - Islamic Knightly Protocol Logo
 * Gold 8-point Islamic Star (Khatim) design with emerald outer glow
 * representing the Fursan (Knights)
 */
export function FursanLogo({
    size = 48,
    variant = 'star',
    className = '',
    withGlow = true,
    ...props
}: FursanLogoProps) {
    const glowClass = withGlow ? 'fursan-logo-glow' : '';

    if (variant === 'crescent') {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn(glowClass, className)}
                {...props}
            >
                {/* Crescent Moon */}
                <path
                    d="M70 50c0-22.1-15.9-40-35.5-40C50.1 10 62 28.5 62 50s-11.9 40-27.5 40C54.1 90 70 72.1 70 50z"
                    fill="#FFD700"
                />
                {/* Sword */}
                <path
                    d="M75 15L78 50l-3 30-2-30V15h2zM73 12l4-4 4 4H73zM75 82l-3 8h6l-3-8z"
                    fill="#FDF5E6"
                    stroke="#FFD700"
                    strokeWidth="1"
                />
            </svg>
        );
    }

    // Default: Gold 8-point Islamic Star (Khatim) with layered design
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn(glowClass, className)}
            {...props}
        >
            {/* Outer glow filter definition */}
            <defs>
                <filter id="emeraldGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#FFC107" />
                    <stop offset="100%" stopColor="#FFD700" />
                </linearGradient>
            </defs>

            {/* Emerald outer glow ring */}
            <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="#50C878"
                strokeWidth="1"
                opacity="0.4"
                filter="url(#emeraldGlow)"
            />

            {/* Outer 8-point star - first layer */}
            <polygon
                points="50,8 56,38 86,38 62,54 70,84 50,68 30,84 38,54 14,38 44,38"
                fill="url(#goldGradient)"
                strokeLinejoin="round"
            />

            {/* Inner rotated square for Khatim effect */}
            <polygon
                points="50,22 78,50 50,78 22,50"
                fill="#FFD700"
                strokeLinejoin="round"
            />

            {/* Central circle with cream fill */}
            <circle
                cx="50"
                cy="50"
                r="14"
                fill="#0A0A0A"
                stroke="#FFD700"
                strokeWidth="2"
            />

            {/* Inner 5-point star detail */}
            <polygon
                points="50,40 53,47 60,48 55,53 56,60 50,56 44,60 45,53 40,48 47,47"
                fill="#FFD700"
            />
        </svg>
    );
}

export default FursanLogo;
