export type EventData = {
    id: number;
    title: string;
    time: string;
    color: "red" | "blue" | "sky" | "lime";
    height: string;
};

interface EventCardProps {
    event: EventData;
    onClick?: (event: EventData) => void;
}

const EventCard = ({ event, onClick }: EventCardProps) => {
    // Cores do design system: coral, cyan, lime, yellow
    const colorStyles: Record<string, { bg: string; text: string; shadow: string }> = {
        red: {
            bg: "bg-[#FF6B7A]",
            text: "text-white",
            shadow: "shadow-[0_4px_12px_rgba(255,107,122,0.3)]"
        },
        blue: {
            bg: "bg-[#4DD4F7]",
            text: "text-white",
            shadow: "shadow-[0_4px_12px_rgba(77,212,247,0.3)]"
        },
        sky: {
            bg: "bg-[#5B9FFF]",
            text: "text-white",
            shadow: "shadow-[0_4px_12px_rgba(91,159,255,0.3)]"
        },
        lime: {
            bg: "bg-[#D4FF4D]",
            text: "text-[#1A1A1A]",
            shadow: "shadow-[0_4px_12px_rgba(212,255,77,0.3)]"
        },
    };

    const style = colorStyles[event.color] || colorStyles.blue;

    // Calcular altura mínima baseada no tamanho do texto
    const titleLength = event.title.length;
    const minHeight = titleLength > 60 ? "min-h-[120px]" : titleLength > 40 ? "min-h-[100px]" : "min-h-[80px]";

    return (
        <div
            onClick={() => onClick?.(event)}
            className={`w-full rounded-lg p-3 relative overflow-hidden group cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${style.bg} ${style.text} ${style.shadow} ${minHeight} flex flex-col justify-between`}
            style={{ fontFamily: 'Inter, system-ui, sans-serif', borderRadius: '12px' }}
        >
            <h3 className="font-semibold text-sm mb-1 leading-tight flex-1" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>
                {event.title}
            </h3>
            <p className="text-xs opacity-90 font-medium mt-auto" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>
                {event.time}
            </p>
        </div>
    );
};

export default EventCard;
