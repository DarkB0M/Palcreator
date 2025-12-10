"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaTiktok, FaYoutube } from "react-icons/fa";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import LoadingModal from "@/components/ui/LoadingModal";
import { ArrowRight, Check } from "lucide-react";

export default function CreateViewsConfigure() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        tiktok: "",
        youtube: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const isLoggedIn = () => {
        return auth.currentUser !== null;
    };

    if (!isLoggedIn()) {
        router.push('/login');
        return null;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Filtrar apenas os usernames preenchidos
            const usernames: Record<string, string> = {};
            if (formData.tiktok.trim()) usernames.tiktok = formData.tiktok.trim();
            if (formData.youtube.trim()) usernames.youtube = formData.youtube.trim();

            if (Object.keys(usernames).length === 0) {
                alert("Por favor, preencha pelo menos um username.");
                setIsLoading(false);
                return;
            }

            const response = await fetch("/api/saveUsernames", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: auth.currentUser?.uid,
                    usernames: usernames,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirecionar para a página Links após sucesso
                setTimeout(() => {
                    router.push('/links');
                }, 1000);
            } else {
                setIsLoading(false);
                console.error("Error:", data);
                alert("Erro ao salvar usernames. Tente novamente.");
            }
        } catch (error) {
            console.error("Error:", error);
            setIsLoading(false);
            alert("Erro ao salvar usernames. Tente novamente.");
        }
    };

    const platforms = [
        {
            name: "TikTok",
            icon: <FaTiktok size={32} />,
            color: "#D4FF4D",
            field: "tiktok",
            placeholder: "seu_usuario_tiktok",
        },
        {
            name: "YouTube",
            icon: <FaYoutube size={32} />,
            color: "#FF6B7A", 
            field: "youtube",
            placeholder: "seu_canal_youtube",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    };

    return (
        <div className="flex h-screen w-screen bg-[#0F0F0F] font-sans antialiased overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

            <motion.div
                className="flex-1 flex flex-col items-center justify-center p-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div
                    className="w-full max-w-2xl"
                    variants={itemVariants}
                >
                    <motion.div
                        className="text-center mb-8"
                        variants={itemVariants}
                    >
                        <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>
                            Configure suas Redes Sociais
                        </h1>
                        <p className="text-[#888888] text-lg" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                            Adicione seus usernames para acompanhar suas estatísticas
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6 mb-8">
                            {platforms.map((platform, index) => (
                                <motion.div
                                    key={platform.field}
                                    className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6"
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ borderColor: platform.color, scale: 1.01 }}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{ backgroundColor: `${platform.color}20` }}
                                        >
                                            <div style={{ color: platform.color }}>
                                                {platform.icon}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>
                                                {platform.name}
                                            </h3>
                                            <p className="text-[#888888] text-sm">Adicione seu @username</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]">@</span>
                                        <input
                                            type="text"
                                            name={platform.field}
                                            value={formData[platform.field as keyof typeof formData]}
                                            onChange={handleInputChange}
                                            placeholder={platform.placeholder}
                                            className="w-full pl-8 pr-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#888888] focus:outline-none focus:border-[#5B9FFF] transition-colors"
                                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.button
                            type="submit"
                            className="w-full py-4 px-6 bg-gradient-to-r from-[#4DD4F7] to-[#8B6FFF] text-white font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg"
                            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
                            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(77, 212, 247, 0.3)" }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    Salvar Configuração
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <motion.p
                        className="text-center text-[#888888] text-sm mt-6"
                        variants={itemVariants}
                    >
                        Você pode adicionar quantas plataformas quiser. Pode deixar em branco as que não usar.
                    </motion.p>
                </motion.div>
            </motion.div>

            {isLoading && <LoadingModal />}
        </div>
    );
}

