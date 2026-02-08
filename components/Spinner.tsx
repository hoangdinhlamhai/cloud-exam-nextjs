"use client";

import React from "react";

interface SpinnerProps {
    visible?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ visible = true, size = "md", className = "" }) => {
    if (!visible) return null;

    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-8 h-8 border-3",
        lg: "w-12 h-12 border-4",
    };

    return (
        <div
            className={`${sizeClasses[size]} border-cyan-400 border-t-transparent rounded-full animate-spin ${className}`}
        />
    );
};

export default Spinner;
