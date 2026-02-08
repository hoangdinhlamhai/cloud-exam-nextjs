"use client";

import React from "react";

// Icons for common use cases - replacing zmp-ui icons
// Using simple SVG icons or emoji-based icons

interface IconProps {
    name: string;
    className?: string;
    size?: number;
}

const iconMap: Record<string, string> = {
    // Navigation
    "arrow-left": "←",
    "chevron-left": "‹",
    "chevron-right": "›",
    "close": "✕",

    // Common
    "check": "✓",
    "check-circle": "✓",
    "check-circle-solid": "✓",
    "close-circle-solid": "✕",
    "warning": "⚠",
    "info-circle": "ℹ",

    // Content
    "note": "📝",
    "video-solid": "🎬",
    "star": "★",
    "star-solid": "★",
    "clock-1": "🕐",
    "clock-2-solid": "⏰",
    "calendar": "📅",
    "list-1": "📋",
    "poll": "📊",

    // User
    "user-circle": "👤",
    "notif-ring": "🔔",

    // Actions
    "play": "▶",
    "more-grid": "⋮",
    "chat": "💬",
    "memory": "📒",
};

const Icon: React.FC<IconProps> = ({ name, className = "", size = 16 }) => {
    const icon = iconMap[name] || "•";

    return (
        <span
            className={`inline-flex items-center justify-center ${className}`}
            style={{ fontSize: size }}
        >
            {icon}
        </span>
    );
};

export default Icon;
