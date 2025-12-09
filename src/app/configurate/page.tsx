"use client";

import React, { useState } from "react";
import Image from "next/image";
import AsideNewUser from "@/components/layout/AsideNewUser";
import TitkokSvg from "@/public/tiktok.svg";
import { FaInstagram,FaTiktok,FaTwitter, FaYoutube, } from "react-icons/fa";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import LoadingModal from "@/components/ui/LoadingModal";

export default function CreateProject() {
    // --- ESTADO ÚNICO (JSON) ---

    const router = useRouter();

    const isLoggedIn = () => {
            return auth.currentUser !== null;
        }
        if (!isLoggedIn()) {
            router.push('/login');
        }
    const [formData, setFormData] = useState({
        projectName: "",
        contentNiche: "",
        targetAudience: "",
        platforms: [] as string[],
        numberOfTimesCanPublish: ""
    });
    
    const [isLoading, setIsLoading] = useState(false); 

    // --- HANDLERS ---

    // Inputs de Texto
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Switch (Toggle)
    const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    // Checkboxes (Array de Plataformas)
    const handlePlatformChange = (value: string) => {
        setFormData((prev) => {
            const current = prev.platforms;
            if (current.includes(value)) {
                return { ...prev, platforms: current.filter((p) => p !== value) };
            }
            return { ...prev, platforms: [...current, value] };
        });
    };

    // Envio
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await fetch("/api/newUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: auth?.currentUser?.uid,
                    preferences: formData,
                }),
            });
            
            const data = await response.json();
            console.log("Success:", data);
            
            // Redirecionar para o dashboard após sucesso
            if (response.ok) {
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1000); // Pequeno delay para mostrar mensagem de sucesso
            } else {
                setIsLoading(false);
                console.error("Error:", data);
            }
        } catch (error) {
            console.error("Error:", error);
            setIsLoading(false);
        }
    };

    return (
        // Container Principal
        <div className="flex h-screen w-screen bg-[#0F0F0F] font-sans antialiased overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Importando Material Icons e Google Fonts */}
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            
            <style jsx global>{`
        /* Estilos do Card com Gradiente - Design System */
        .gradient-icon-card {
          border-radius: 1.5rem;
          padding: 2px;
          background-image: linear-gradient(90deg, #4DD4F7, #8B6FFF);
          position: relative;
          overflow: hidden;
        }
        .gradient-icon-card-inner {
          background-color: #1A1A1A;
          width: 100%;
          height: 100%;
          border-radius: calc(1.5rem - 2px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gradient-icon-card .material-icons {
          font-size: 4rem;
          background: -webkit-linear-gradient(90deg, #4DD4F7, #8B6FFF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        /* Checkbox Customizado - Design System */
        .platform-checkbox:checked + label {
          border-color: #5B9FFF;
          box-shadow: 0 0 0 2px rgba(91, 159, 255, 0.2);
          background-color: #2A2A2A;
        }
        .platform-checkbox:checked + label:hover {
          border-color: #4DD4F7;
        }
      `}</style>

            {/* --- COLUNA ESQUERDA: FORMULÁRIO --- */}
          <main className="flex-1 overflow-y-auto p-8 md:p-16">
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>
                        Criar uma programação
                    </h1>
                </header>

                <div className="grow flex items-start justify-start">
                    <div className="w-full max-w-2xl space-y-10">
                        <div className="space-y-3">
                            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>
                                Configure seu canal e sua programação
                            </h2>
                            <p className="text-lg text-[#888888] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.6 }}>
                                O copiloto criativo que você sempre quis. Vamos criar um sistema automatizado de produção criativa.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Nome do Projeto */}
                            <div>
                                <label className="block text-base font-medium text-white mb-2" htmlFor="projectName" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>
                                    Nome do Projeto
                                </label>
                                <input
                                    className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg focus:ring-2 focus:ring-[#5B9FFF] focus:border-[#5B9FFF] text-white placeholder-[#888888] px-4 py-3 transition-all duration-200"
                                    style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '12px 16px', borderRadius: '8px' }}
                                    id="projectName"
                                    name="projectName"
                                    value={formData.projectName}
                                    onChange={handleInputChange}
                                    placeholder="Ex: Meu Canal de Tecnologia"
                                    type="text"
                                />
                            </div>

                            {/* Grid: Nicho e Público */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-base font-medium text-white mb-2" htmlFor="contentNiche" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>
                                        Nicho de Conteúdo
                                    </label>
                                    <input
                                        className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg focus:ring-2 focus:ring-[#5B9FFF] focus:border-[#5B9FFF] text-white placeholder-[#888888] px-4 py-3 transition-all duration-200"
                                        style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '12px 16px', borderRadius: '8px' }}
                                        id="contentNiche"
                                        name="contentNiche"
                                        value={formData.contentNiche}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Tecnologia Sustentável"
                                        type="text"
                                    />
                                </div>
                                <div>
                                    <label className="block text-base font-medium text-white mb-2" htmlFor="targetAudience" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>
                                        Público-Alvo
                                    </label>
                                    <input
                                        className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg focus:ring-2 focus:ring-[#5B9FFF] focus:border-[#5B9FFF] text-white placeholder-[#888888] px-4 py-3 transition-all duration-200"
                                        style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '12px 16px', borderRadius: '8px' }}
                                        id="targetAudience"
                                        name="targetAudience"
                                        value={formData.targetAudience}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Jovens adultos eco-conscientes"
                                        type="text"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-base font-medium text-white mb-2" htmlFor="numberOfTimesCanPublish" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>
                                        Número de vezes que pode publicar por semana
                                    </label>
                                    <input
                                        className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg focus:ring-2 focus:ring-[#5B9FFF] focus:border-[#5B9FFF] text-white placeholder-[#888888] px-4 py-3 transition-all duration-200"
                                        style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '12px 16px', borderRadius: '8px' }}
                                        id="numberOfTimesCanPublish"
                                        name="numberOfTimesCanPublish"
                                        value={formData.numberOfTimesCanPublish}
                                        onChange={handleInputChange}
                                        placeholder="Ex: 3"
                                        type="number"
                                    />
                                </div>
                            </div>

                            {/* Plataformas */}
                            <div>
                                <label className="block text-base font-medium text-white mb-4" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>
                                    Plataformas de Publicação
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <PlatformOption
                                        id="twitter"
                                        value="twitter"
                                        checked={formData.platforms.includes("twitter")}
                                        onChange={() => handlePlatformChange("twitter")}
                                    >
                                        <FaTwitter size={35} color="white" /> 
                                    </PlatformOption>

                                    <PlatformOption
                                        id="youtube"
                                        value="youtube"
                                        checked={formData.platforms.includes("youtube")}
                                        onChange={() => handlePlatformChange("youtube")}
                                    >
                                       <FaYoutube size={35} color="white" />
                                    </PlatformOption>

                                    <PlatformOption
                                        id="instagram"
                                        value="instagram"
                                        checked={formData.platforms.includes("instagram")}
                                        onChange={() => handlePlatformChange("instagram")}
                                    >
                                       <FaInstagram size={35} color="white" /> 
                                    </PlatformOption>

                                    <PlatformOption
                                        id="tiktok"
                                        value="tiktok"
                                        checked={formData.platforms.includes("tiktok")}
                                        onChange={() => handlePlatformChange("tiktok")}
                                    >
                                        <FaTiktok size={35} color="white" />
                                    </PlatformOption>
                                </div>
                            </div>

                            {/* Detecção de Bloqueio Criativo */}
                           

                            {/* Botão Submit */}
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-end gap-6">
                                <button
                                    className="w-full sm:w-auto bg-gradient-to-r from-[#4DD4F7] to-[#8B6FFF] text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0F0F0F] focus:ring-[#5B9FFF] transition-all duration-200 shadow-lg hover:shadow-xl"
                                    style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, padding: '12px 24px', borderRadius: '8px' }}
                                    type="submit"
                                >
                                    Criar Programação
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <AsideNewUser />
            
            {/* Modal de Loading */}
            <LoadingModal isOpen={isLoading} message="Criando seu calendário personalizado..." />
        </div>
    );
}

// Sub-componente auxiliar (mantido para organização)
function PlatformOption({ id, value, checked, onChange, children }: any) {
    return (
        <div className="relative">
            <input
                className="absolute h-6 w-6 opacity-0 platform-checkbox focus:ring-2 focus:ring-[#5B9FFF] focus:ring-offset-2 focus:ring-offset-[#0F0F0F]"
                id={id}
                type="checkbox"
                value={value}
                checked={checked}
                onChange={onChange}
            />
            <label
                className="flex items-center justify-center p-4 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg cursor-pointer transition-all duration-200 hover:border-[#5B9FFF] hover:bg-[#2A2A2A]/80"
                style={{ borderRadius: '8px' }}
                htmlFor={id}
            >
                {children}
            </label>
        </div>
    );
}