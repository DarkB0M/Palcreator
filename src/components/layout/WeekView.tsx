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
    
    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0F0F0F]">
            {/* Header da semana */}
            <div className="grid grid-cols-7 border-b border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3">
                {weekDays.map((day, i) => {
                    const col = data[i];
                    const dayParts = col?.day?.split(" ") || ["", ""];
                    return (
                        <div key={i} className="text-center">
                            <div className="text-xs text-[#888888] mb-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                {day}
                            </div>
                            <div className="text-base font-semibold text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>
                                {dayParts[1] || ""}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Grid de eventos */}
            <div className="flex-1 grid grid-cols-7 overflow-y-auto px-4 py-4">
                {data.map((col, i) => (
                    <div key={i} className="flex flex-col border-r border-[#2A2A2A] last:border-r-0 px-2">
                        <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
                            {col.events && col.events.length > 0 ? (
                                col.events.map((event) => (
                                    <EventCard key={event.id} event={event} onClick={onEventClick} />
                                ))
                            ) : (
                                <div className="text-center text-[#4A4A4A] text-xs py-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    Sem eventos
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeekView;
