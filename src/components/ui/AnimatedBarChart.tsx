"use client";

import { motion } from "framer-motion";

interface AnimatedBarChartProps {
    data: { label: string; value: number; color: string }[];
    maxValue?: number;
}

export default function AnimatedBarChart({ data, maxValue }: AnimatedBarChartProps) {
    const max = maxValue || Math.max(...data.map(d => d.value), 0);

    return (
        <div className="flex items-end justify-between gap-4 h-64">
            {data.map((item, index) => {
                const height = max > 0 ? (item.value / max) * 100 : 0;
                return (
                    <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full h-64 flex items-end">
                            <motion.div
                                className="w-full rounded-t-lg relative overflow-hidden"
                                style={{ backgroundColor: item.color }}
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{
                                    duration: 1,
                                    delay: index * 0.1,
                                }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.1 + 0.5 }}
                                />
                            </motion.div>
                        </div>
                        <motion.div
                            className="text-white text-sm font-semibold"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.8 }}
                        >
                            {item.value.toLocaleString()}
                        </motion.div>
                        <motion.div
                            className="text-[#888888] text-xs"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 + 1 }}
                        >
                            {item.label}
                        </motion.div>
                    </div>
                );
            })}
        </div>
    );
}

