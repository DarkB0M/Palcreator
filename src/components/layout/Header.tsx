"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useState } from "react";

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
                    <button 
                        onClick={onPrev} 
                        className="p-2 hover:bg-[#3A3A3A] rounded-lg text-[#888888] hover:text-white transition-colors"
                        aria-label="Mês anterior"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button 
                        onClick={onNext} 
                        className="p-2 hover:bg-[#3A3A3A] rounded-lg text-[#888888] hover:text-white transition-colors"
                        aria-label="Próximo mês"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                <span className="text-white font-semibold text-lg min-w-[200px] text-center capitalize" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>
                    {formattedDate}
                </span>

                <button 
                    onClick={onToday} 
                    className="px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors text-sm font-medium"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}
                >
                    Hoje
                </button>
            </div>

            <div className="bg-[#2A2A2A] p-1 rounded-lg border border-[#3A3A3A] flex text-xs font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <button 
                    onClick={() => handleViewChange('day')}
                    className={`px-4 py-2 rounded-lg transition-all ${selectedView === 'day' ? 'bg-gradient-to-r from-[#4DD4F7] to-[#8B6FFF] text-white shadow-lg' : 'text-[#888888] hover:text-white'}`}
                    style={{ fontWeight: 500 }}
                >
                    Dia
                </button>
                <button 
                    onClick={() => handleViewChange('week')}
                    className={`px-4 py-2 rounded-lg transition-all ${selectedView === 'week' ? 'bg-gradient-to-r from-[#4DD4F7] to-[#8B6FFF] text-white shadow-lg' : 'text-[#888888] hover:text-white'}`}
                    style={{ fontWeight: 500 }}
                >
                    Semana
                </button>
                <button 
                    onClick={() => handleViewChange('month')}
                    className={`px-4 py-2 rounded-lg transition-all ${selectedView === 'month' ? 'bg-gradient-to-r from-[#4DD4F7] to-[#8B6FFF] text-white shadow-lg' : 'text-[#888888] hover:text-white'}`}
                    style={{ fontWeight: 500 }}
                >
                    Mês
                </button>
            </div>
        </div>
    );
};

export default Header;
