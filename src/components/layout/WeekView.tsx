"use client";

import { motion, AnimatePresence } from "framer-motion";
import EventCard, { EventData } from "./EventCard";

export type WeekColumn = {
    day: string;
    events: EventData[];
};

interface WeekViewProps {
    data: WeekColumn[];
    onEventClick?: (event: EventData) => void;
}

const WeekView = ({ data, onEventClick }: WeekViewProps) => {
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Garantir que sempre temos 7 dias de dados
    const safeData = data && data.length === 7 ? data : weekDays.map(day => ({ day, events: [] }));

    const columnVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.4,
            },
        }),
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0F0F0F]">
            {/* Header da semana */}
            <motion.div
                className="grid grid-cols-7 border-b border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {weekDays.map((day, i) => {
                    const col = safeData[i];
                    const dayParts = col?.day?.split(" ") || ["", ""];
                    return (
                        <motion.div
                            key={i}
                            className="text-center"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                        >
                            <div className="text-xs text-[#888888] mb-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                {day}
                            </div>
                            <div className="text-base font-semibold text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>
                                {dayParts[1] || ""}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Grid de eventos */}
            <div className="flex-1 grid grid-cols-7 overflow-y-auto px-4 py-4">
                <AnimatePresence mode="popLayout">
                    {safeData.map((col, i) => (
                        <motion.div
                            key={`${col.day}-${i}`}
                            className="flex flex-col border-r border-[#2A2A2A] last:border-r-0 px-2"
                            variants={columnVariants}
                            initial="hidden"
                            animate="visible"
                            custom={i}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
                                {col.events && col.events.length > 0 ? (
                                    col.events.map((event, eventIndex) => (
                                        <motion.div
                                            key={event.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                                delay: eventIndex * 0.1,
                                                duration: 0.3,
                                            }}
                                        >
                                            <EventCard event={event} onClick={onEventClick} />
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div
                                        className="text-center text-[#4A4A4A] text-xs py-4"
                                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        Sem eventos
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default WeekView;
