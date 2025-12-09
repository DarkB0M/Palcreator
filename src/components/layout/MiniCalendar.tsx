import { ChevronLeft, ChevronRight } from "lucide-react";

type MiniCalendarProps = {
    currentDate: Date;
    onPrev: () => void;
    onNext: () => void;
    selectedDate?: Date;
    onDateSelect?: (date: Date) => void;
};

const MiniCalendar: React.FC<MiniCalendarProps> = ({ currentDate, onPrev, onNext, selectedDate, onDateSelect }) => {
    const formattedDate = currentDate.toLocaleString("pt-BR", {
        month: "long",
        year: "numeric",
    });

    const today = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    // Gerar array de dias do mês
    const days: (number | null)[] = [];
    // Dias do mês anterior
    for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(null);
    }
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const isToday = (day: number | null) => {
        if (day === null) return false;
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day: number | null) => {
        if (day === null || !selectedDate) return false;
        return (
            day === selectedDate.getDate() &&
            currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getFullYear() === selectedDate.getFullYear()
        );
    };

    const handleDateClick = (day: number | null) => {
        if (day === null) return;
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        onDateSelect?.(newDate);
    };

    return (
        <div className="bg-[#1A1A1A] p-5 rounded-xl border border-[#2A2A2A] w-full" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div className="flex justify-between items-center mb-4">
                <span className="text-white font-semibold capitalize" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>
                    {formattedDate}
                </span>
                <div className="flex gap-1">
                    <button
                        onClick={onPrev}
                        className="p-1.5 text-[#888888] hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors"
                        aria-label="Mês anterior"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        onClick={onNext}
                        className="p-1.5 text-[#888888] hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors"
                        aria-label="Próximo mês"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-xs text-[#888888] mb-2 text-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {weekDays.map((d) => (
                    <span key={d} className="font-medium">{d}</span>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1 text-sm">
                {days.map((day, i) => {
                    if (day === null) {
                        return <div key={i} className="h-8" />;
                    }
                    
                    const todayClass = isToday(day) ? 'ring-2 ring-[#5B9FFF]' : '';
                    const selectedClass = isSelected(day) ? 'bg-gradient-to-r from-[#4DD4F7] to-[#8B6FFF] text-white font-semibold' : 'text-white hover:bg-[#2A2A2A]';
                    
                    return (
                        <button
                            key={i}
                            onClick={() => handleDateClick(day)}
                            className={`
                                h-8 w-8 flex items-center justify-center rounded-lg cursor-pointer transition-all
                                ${selectedClass}
                                ${todayClass}
                            `}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: isSelected(day) ? 600 : 500 }}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MiniCalendar;
