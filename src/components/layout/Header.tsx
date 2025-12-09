"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type HeaderProps = {
    currentDate: Date;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    viewMode?: 'day' | 'week' | 'month';
    onViewChange?: (view: 'day' | 'week' | 'month') => void;
};

const Header: React.FC<HeaderProps> = ({ currentDate, onPrev, onNext, onToday, viewMode = 'week', onViewChange }) => {
    const formattedDate = currentDate.toLocaleString("pt-BR", {
        month: "long",
        year: "numeric",
    });

    const [selectedView, setSelectedView] = useState<'day' | 'week' | 'month'>(viewMode);

    const handleViewChange = (view: 'day' | 'week' | 'month') => {
        setSelectedView(view);
        onViewChange?.(view);
    };

    return (
        <div className="h-20 flex items-center justify-between px-8 border-b border-[#2A2A2A] bg-[#1A1A1A]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-[#4DD4F7] to-[#8B6FFF] rounded-lg flex items-center justify-center text-white shadow-lg">
                    <CalendarDays size={20} />
                </div>
                <div>
                    <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>
                        Pal Creator
                    </h1>
                    <p className="text-[#888888] text-xs" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Calendário de Conteúdo
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-[#2A2A2A] p-1 rounded-lg border border-[#3A3A3A]">
                    <motion.button
                        onClick={onPrev}
                        className="p-2 hover:bg-[#3A3A3A] rounded-lg text-[#888888] hover:text-white transition-colors"
                        aria-label="Mês anterior"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ChevronLeft size={16} />
                    </motion.button>
                    <motion.button
                        onClick={onNext}
                        className="p-2 hover:bg-[#3A3A3A] rounded-lg text-[#888888] hover:text-white transition-colors"
                        aria-label="Próximo mês"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ChevronRight size={16} />
                    </motion.button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.span
                        key={formattedDate}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="text-white font-semibold text-lg min-w-[200px] text-center capitalize"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
                    >
                        {formattedDate}
                    </motion.span>
                </AnimatePresence>

                <motion.button
                    onClick={onToday}
                    className="px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors text-sm font-medium"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Hoje
                </motion.button>
            </div>

            <div />
        </div>
    );
};

export default Header;
