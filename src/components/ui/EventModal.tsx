"use client";

import React from "react";
import { X, Video } from "lucide-react";
import type { EventData } from "@/components/layout/EventCard";

interface EventModalProps {
  isOpen: boolean;
  event: EventData | null;
  onClose: () => void;
  onGenerateScript: (event: EventData) => void;
}

export default function EventModal({ isOpen, event, onClose, onGenerateScript }: EventModalProps) {
  if (!isOpen || !event) return null;

  const colorStyles: Record<string, { bg: string; text: string; border: string }> = {
    red: {
      bg: "bg-[#FF6B7A]",
      text: "text-white",
      border: "border-[#FF6B7A]"
    },
    blue: {
      bg: "bg-[#4DD4F7]",
      text: "text-white",
      border: "border-[#4DD4F7]"
    },
    sky: {
      bg: "bg-[#5B9FFF]",
      text: "text-white",
      border: "border-[#5B9FFF]"
    },
    lime: {
      bg: "bg-[#D4FF4D]",
      text: "text-[#1A1A1A]",
      border: "border-[#D4FF4D]"
    },
  };

  const style = colorStyles[event.color] || colorStyles.blue;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        {/* Modal Card */}
        <div 
          className="relative z-10 bg-[#1A1A1A] border-2 border-[#2A2A2A] rounded-xl p-6 shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-300 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#888888] hover:text-white transition-colors"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>

          {/* Header com cor do evento */}
          <div className={`${style.bg} ${style.text} rounded-lg p-4 mb-6`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-xs font-medium opacity-90" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>
                {event.time}
              </div>
            </div>
            <h2 className="text-xl font-bold leading-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>
              {event.title}
            </h2>
          </div>

          {/* Conteúdo */}
          <div className="space-y-4">
            <div className="text-[#888888] text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              <p>Clique no botão abaixo para gerar um roteiro completo para este conteúdo.</p>
            </div>

            {/* Botão Gerar Roteiro */}
            <button
              onClick={() => {
                onGenerateScript(event);
                onClose();
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#4DD4F7] to-[#8B6FFF] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
            >
              <Video size={18} />
              Gerar Roteiro de Vídeo
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

