"use client";

import React from "react";

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export default function LoadingModal({ isOpen, message = "Criando seu calendário..." }: LoadingModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay com backdrop blur */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
        {/* Gradiente animado de fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/20 via-[#a78bfa]/20 to-[#22d3ee]/20 animate-pulse" />
        
        {/* Modal Card */}
        <div className="relative z-10 bg-[#18181b] border-2 border-[#3f3f46] rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 animate-scale-in">
          {/* Gradiente animado na borda */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3b82f6] via-[#a78bfa] to-[#22d3ee] rounded-2xl opacity-75 blur-sm animate-pulse" />
          
          <div className="relative bg-[#18181b] rounded-xl p-6">
            {/* Spinner com gradiente */}
            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20">
                {/* Círculo externo rotacionando */}
                <div 
                  className="absolute inset-0 border-4 border-transparent border-t-[#3b82f6] border-r-[#a78bfa] rounded-full animate-spin" 
                  style={{ animationDuration: '1s' }} 
                />
                {/* Círculo médio rotacionando (sentido contrário) */}
                <div 
                  className="absolute inset-2 border-4 border-transparent border-b-[#22d3ee] border-l-[#3b82f6] rounded-full animate-spin" 
                  style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} 
                />
                {/* Círculo interno pulsando */}
                <div className="absolute inset-4 border-4 border-transparent border-t-[#a78bfa] rounded-full animate-pulse" />
                {/* Centro com gradiente */}
                <div className="absolute inset-6 bg-gradient-to-br from-[#3b82f6] to-[#a78bfa] rounded-full opacity-20 animate-pulse" />
              </div>
            </div>

            {/* Texto com animação */}
            <div className="text-center space-y-3">
              <h3 className="text-xl font-semibold text-gray-100">
                {message}
              </h3>
              <p className="text-sm text-gray-400 animate-pulse">
                Isso pode levar alguns segundos...
              </p>
            </div>

            {/* Pontos animados */}
            <div className="flex justify-center gap-2 mt-6">
              <div 
                className="w-2 h-2 bg-[#3b82f6] rounded-full animate-bounce" 
                style={{ animationDelay: '0s' }} 
              />
              <div 
                className="w-2 h-2 bg-[#a78bfa] rounded-full animate-bounce" 
                style={{ animationDelay: '0.2s' }} 
              />
              <div 
                className="w-2 h-2 bg-[#22d3ee] rounded-full animate-bounce" 
                style={{ animationDelay: '0.4s' }} 
              />
            </div>

            {/* Barra de progresso animada */}
            <div className="mt-6 w-full bg-[#3f3f46] rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#3b82f6] via-[#a78bfa] to-[#22d3ee] rounded-full progress-bar" />
            </div>
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
        @keyframes progress {
          0% {
            transform: translateX(-100%);
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            transform: translateX(100%);
            width: 100%;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        .progress-bar {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

