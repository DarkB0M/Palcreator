"use client";

import { motion } from "framer-motion";

interface AnimatedLineChartProps {
    data: { date: string; value: number }[];
    color: string;
    label: string;
}

export default function AnimatedLineChart({ data, color, label }: AnimatedLineChartProps) {
    if (!data || data.length === 0) {
        return <div className="w-full h-64 flex items-center justify-center text-[#888888]">Sem dados</div>;
    }

    const maxValue = Math.max(...data.map(d => d.value), 0);
    const minValue = Math.min(...data.map(d => d.value), 0);
    const range = maxValue - minValue || 1;

    // Criar pontos para o SVG path
    const points = data.map((item, index) => {
        const x = data.length > 1 ? (index / (data.length - 1)) * 100 : 50;
        const y = 100 - ((item.value - minValue) / range) * 100;
        return `${x},${y}`;
    });

    const pathD = data.length > 1 ? `M ${points.join(" L ")}` : `M ${points[0]}`;

    return (
        <div className="w-full h-64 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Área preenchida */}
                <motion.path
                    d={`${pathD} L 100,100 L 0,100 Z`}
                    fill={`url(#gradient-${label})`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                />
                {/* Linha */}
                <motion.path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth="0.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                />
                {/* Pontos */}
                {data.map((item, index) => {
                    const x = (index / (data.length - 1)) * 100;
                    const y = 100 - ((item.value - minValue) / range) * 100;
                    return (
                        <motion.circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="1.5"
                            fill={color}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.1 + 1, duration: 0.3 }}
                        />
                    );
                })}
            </svg>
        </div>
    );
}

