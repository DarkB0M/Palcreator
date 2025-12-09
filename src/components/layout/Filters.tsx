import { Plus } from "lucide-react";
import { auth } from "@/lib/firebase";

const Filters = () => {
    const categories = [
        { label: "Projeto", color: "#4DD4F7" },
        { label: "Tempo pessoal", color: "#FF6B7A" },
        { label: "Trabalho freelance", color: "#D4FF4D" },
        { label: "Reuniões", color: "#5B9FFF" },
    ];

    const userEmail = auth.currentUser?.email || "";

    return (
        <div className="bg-[#1A1A1A] p-5 rounded-xl border border-[#2A2A2A] w-full flex-1 flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div className="flex justify-between items-center mb-6">
                <span className="text-xs text-[#888888]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {userEmail}
                </span>
            </div>

            <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-white mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>
                    Categorias
                </h3>
                {categories.map((cat, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: cat.color }}
                        ></div>
                        <span className="text-[#888888] text-sm font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>
                            {cat.label}
                        </span>
                    </div>
                ))}
            </div>

            <button className="w-full flex items-center justify-start gap-2 py-3 px-4 text-[#888888] border border-dashed border-[#3A3A3A] rounded-lg hover:border-[#5B9FFF] hover:text-white transition-colors text-sm font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>
                <Plus size={16} /> Adicionar conta
            </button>
        </div>
    );
};

export default Filters;
