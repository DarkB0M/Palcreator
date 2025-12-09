import React from "react";

type ButtonProps = {
    children: React.ReactNode;
    variant?: "primary" | "ghost" | "outline" | "gradient" | "dark";
    className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Btn: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    className = "",
    ...props
}) => {
    const baseStyle =
        "px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2";

    const variants: Record<string, string> = {
        primary: "bg-white text-black hover:bg-gray-200",
        ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/10",
        outline: "border border-gray-700 text-gray-300 hover:bg-gray-800",
        gradient: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:opacity-90",
        dark: "bg-[#1C1C21] text-gray-300 hover:bg-[#2a2a31] border border-gray-800",
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Btn;
