import { useId } from "react";

export default function Logo({ className = "h-12" }) {
    const uid = useId().replace(/:/g, "");
    const gold = `gold-${uid}`;
    const goldText = `gold-text-${uid}`;

    return (
        <svg
            viewBox="0 0 182 48"
            role="img"
            aria-label="Avenzo"
            className={`${className} w-auto`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFE08A" />
                    <stop offset="50%" stopColor="#FFB800" />
                    <stop offset="100%" stopColor="#FF8A00" />
                </linearGradient>

                <linearGradient
                    id={goldText}
                    gradientUnits="userSpaceOnUse"
                    x1="138"
                    y1="8"
                    x2="178"
                    y2="40"
                >
                    <stop offset="0%" stopColor="#FFE08A" />
                    <stop offset="55%" stopColor="#FFB800" />
                    <stop offset="100%" stopColor="#FF8A00" />
                </linearGradient>
            </defs>

            {/* bag handle */}
            <path
                d="M17 22V16C17 10.5 20.4 7 24 7C27.6 7 31 10.5 31 16V22"
                fill="none"
                stroke={`url(#${gold})`}
                strokeWidth="3.5"
                strokeLinecap="round"
            />

            {/* bag body */}
            <rect x="5" y="15" width="38" height="30" rx="9" fill={`url(#${gold})`} />

            {/* letter A cut out of the bag */}
            <path
                d="M17 38.5L24 23.5L31 38.5"
                fill="none"
                stroke="#0a0a0a"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M20 34H28" stroke="#0a0a0a" strokeWidth="3.5" strokeLinecap="round" />

            {/* wordmark */}
            <text
                x="54"
                y="34"
                fontFamily="Sora, system-ui, sans-serif"
                fontWeight="800"
                fontSize="30"
                letterSpacing="-0.5"
            >
                <tspan fill="#ffffff">Aven</tspan>
                <tspan fill={`url(#${goldText})`}>zo</tspan>
            </text>
        </svg>
    );
}