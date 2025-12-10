"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { 
    Calendar, 
    Link2, 
    FileText, 
    Sparkles, 
    TrendingUp, 
    Users, 
    Eye, 
    Heart,
    Video,
    ArrowRight,
    Plus,
    Zap,
    Target,
    Clock,
    BarChart3,
    Rocket,
    Settings,
    Bot,
    Loader2
} from "lucide-react";
import { FaTiktok, FaYoutube } from "react-icons/fa";
import Link from "next/link";
import EventCard, { EventData } from "@/components/layout/EventCard";
import { usePremium } from "@/hooks/usePremium";
import { redirectToCheckout } from "@/lib/premium";
import LoadingModal from "@/components/ui/LoadingModal";
import logo from "@/public/logo.png";
import Image from "next/image";
interface QuickStats {
    totalViews: number;
    totalFollowers: number;
    totalLikes: number;
    totalVideos: number;
}

const HomePage = () => {
    const router = useRouter();
    const [stats, setStats] = useState<QuickStats>({
        totalViews: 0,
        totalFollowers: 0,
        totalLikes: 0,
        totalVideos: 0
    });
    const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [platforms, setPlatforms] = useState<Array<{ name: string; icon: React.ReactNode; color: string; followers: number }>>([]);
    const { isPremium, loading: premiumLoading } = usePremium();
    const [isPreparingCheckout, setIsPreparingCheckout] = useState(false);

    const isLoggedIn = () => {
        return auth.currentUser !== null;
    }

    const useFirstLogin = () => {
        if (isLoggedIn()) {
            fetch("/api/firstLogin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: auth.currentUser?.uid,
                    userData: {
                        email: auth.currentUser?.email,
                        name: auth.currentUser?.displayName,
                    },
                })
            })
                .then(response => response.json())
                .then(data => {
                    console.log("First login data:", data);
                    localStorage.setItem('user', JSON.stringify(data));
                    if (data.isNewUser) {
                        router.push('/configurate');
                    } else {
                        fetchHomeData();
                    }
                })
                .catch(error => {
                    console.error("Error on first login:", error);
                    fetchHomeData();
                });
        } else {
            router.push('/login');
        }
    }

    useEffect(() => {
        useFirstLogin();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchHomeData = async () => {
        if (!auth.currentUser?.uid) return;

        setIsLoading(true);

        try {
            // Buscar estatísticas das plataformas
            const usernamesResponse = await fetch("/api/getUsernames", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: auth.currentUser.uid })
            });

                if (usernamesResponse.ok) {
                const { usernames } = await usernamesResponse.json();
                const platformsData: Array<{ name: string; icon: React.ReactNode; color: string; followers: number }> = [];
                let totalLikes = 0;
                let totalVideos = 0;
                let totalViews = 0;
                let totalFollowers = 0;

                if (usernames.tiktok) {
                    const tiktokStats = await fetch("/api/makeStats", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ uid: auth.currentUser.uid, platform: 'tiktok' })
                    });

                    if (tiktokStats.ok) {
                        const data = await tiktokStats.json();
                        if (data.success && data.data) {
                            platformsData.push({
                                name: "TikTok",
                                icon: <FaTiktok size={24} />,
                                color: "#FF6B7A",
                                followers: data.data.followers || 0
                            });
                            // Somar curtidas e vídeos do TikTok
                            totalLikes += data.data.likes || 0;
                            totalVideos += data.data.videos || 0;
                            totalViews += data.data.views || 0;
                            totalFollowers += data.data.followers || 0;
                        }
                    }
                }

                if (usernames.youtube) {
                    const youtubeStats = await fetch("/api/makeStats", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ uid: auth.currentUser.uid, platform: 'youtube' })
                    });

                    if (youtubeStats.ok) {
                        const data = await youtubeStats.json();
                        if (data.success && data.data) {
                            platformsData.push({
                                name: "YouTube",
                                icon: <FaYoutube size={24} />,
                                color: "#D4FF4D",
                                followers: data.data.followers || 0
                            });
                            // Somar curtidas e vídeos do YouTube
                            totalLikes += data.data.likes || 0;
                            totalVideos += data.data.videos || 0;
                            totalViews += data.data.views || 0;
                            totalFollowers += data.data.followers || 0;
                        }
                    }
                }

                setPlatforms(platformsData);

                // Definir totais somados
                setStats({
                    totalViews,
                    totalFollowers,
                    totalLikes,
                    totalVideos
                });
            }

            // Buscar eventos do calendário - apenas eventos do dia atual
            const calendarResponse = await fetch("/api/getCalendar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: auth.currentUser.uid })
            });
            

            if (calendarResponse.ok) {
                const calendarData = await calendarResponse.json();
                console.log("Calendar data received:", calendarData);
                
                // A API retorna calendar como array de WeekColumn
                // Cada WeekColumn tem: { day: "YYYY-MM-DD", events: EventData[] }
                if (calendarData.calendar && Array.isArray(calendarData.calendar)) {
                    // Obter data de hoje no formato YYYY-MM-DD
                    const today = new Date();
                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    
                    console.log("Today's date string:", todayStr);
                    
                    // Encontrar os eventos do dia de hoje
                    // Pode estar no formato "YYYY-MM-DD" ou "Dom 1" (dia da semana + número)
                    const todayColumn = calendarData.calendar.find((column: any) => {
                        if (!column.day) return false;
                        // Se for formato YYYY-MM-DD
                        if (column.day === todayStr) return true;
                        // Se for formato "Dom 1", verificar se corresponde ao dia de hoje
                        const dayParts = column.day.split(' ');
                        if (dayParts.length === 2) {
                            const dayNumber = parseInt(dayParts[1]);
                            return dayNumber === today.getDate();
                        }
                        return false;
                    });
                    
                    if (todayColumn && todayColumn.events && Array.isArray(todayColumn.events)) {
                        console.log("Today's events found:", todayColumn.events);
                        
                        // Converter eventos para o formato EventData
                        const todayEvents: EventData[] = todayColumn.events
                            .map((e: any): EventData => {
                                // Verificar se já está no formato EventData ou precisa converter
                                if (e.id && e.title && e.time && e.color) {
                                    // Já está no formato correto
                                    return {
                                        id: typeof e.id === 'number' ? e.id : parseInt(String(e.id)) || Math.floor(Math.random() * 10000),
                                        title: e.title,
                                        time: e.time,
                                        color: e.color as "red" | "blue" | "sky" | "lime",
                                        height: e.height || calculateEventHeight(e.time)
                                    };
                                } else {
                                    // Converter do formato do banco
                                    return {
                                        id: parseInt(e.id) || Math.floor(Math.random() * 10000),
                                        title: e.title || "Evento sem título",
                                        time: e.time || "00:00",
                                        color: getCategoryColor(e.category || "work"),
                                        height: calculateEventHeight(e.time || "00:00")
                                    };
                                }
                            })
                            .sort((a: EventData, b: EventData) => {
                                // Ordenar por horário
                                return a.time.localeCompare(b.time);
                            });
                        
                        console.log("Processed todayEvents:", todayEvents);
                        setUpcomingEvents(todayEvents);
                    } else {
                        console.log("No events found for today");
                        setUpcomingEvents([]);
                    }
                } else {
                    // Tentar formato alternativo: eventos diretos
                    if (calendarData.events && Array.isArray(calendarData.events)) {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        const todayEvents = calendarData.events
                            .filter((e: any) => {
                                if (!e.date) return false;
                                const eventDate = new Date(e.date);
                                eventDate.setHours(0, 0, 0, 0);
                                return eventDate.getTime() === today.getTime();
                            })
                            .sort((a: any, b: any) => {
                                const timeA = a.time || "00:00";
                                const timeB = b.time || "00:00";
                                return timeA.localeCompare(timeB);
                            })
                            .map((e: any): EventData => ({
                                id: parseInt(e.id) || Math.floor(Math.random() * 10000),
                                title: e.title || "Evento sem título",
                                time: e.time || "00:00",
                                color: getCategoryColor(e.category || "work"),
                                height: calculateEventHeight(e.time || "00:00")
                            }));
                        
                        console.log("Alternative format todayEvents:", todayEvents);
                        setUpcomingEvents(todayEvents);
                    } else {
                        console.log("No calendar data structure found");
                        setUpcomingEvents([]);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching home data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryColor = (category: string): "red" | "blue" | "sky" | "lime" => {
        const colors: { [key: string]: "red" | "blue" | "sky" | "lime" } = {
            project: "red",
            travel: "blue",
            work: "lime",
            lunch: "blue"
        };
        return colors[category] || "blue";
    };

    const calculateEventHeight = (time: string): string => {
        // Calcular altura baseada no horário (assumindo que eventos são de 1 hora)
        // Formato: HH:MM
        const [hours, minutes] = time.split(':').map(Number);
        // Altura mínima baseada em horas (cada hora = ~60px)
        const baseHeight = 60;
        return `${baseHeight}px`;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    const quickActions = [
        {
            title: "Calendário",
            description: "Gerencie seus eventos e conteúdo",
            icon: Calendar,
            color: "#4DD4F7",
            href: "/dashboard",
            gradient: "linear-gradient(135deg, #4DD4F7 0%, #8B6FFF 100%)"
        },
        {
            title: "Estatísticas",
            description: "Acompanhe suas métricas",
            icon: BarChart3,
            color: "#D4FF4D",
            href: "/links",
            gradient: "linear-gradient(135deg, #D4FF4D 0%, #FFE14D 100%)"
        },
        {
            title: "Criar Script",
            description: "Gere conteúdo com IA",
            icon: Sparkles,
            color: "#8B6FFF",
            href: "/makeScript",
            gradient: "linear-gradient(135deg, #8B6FFF 0%, #4DD4F7 100%)"
        },
        {
            title: "Configurações",
            description: "Ajuste suas preferências",
            icon: Settings,
            color: "#FF6B7A",
            href: "/settings",
            gradient: "linear-gradient(135deg, #FF6B7A 0%, #FFE14D 100%)"
        }
    ];

    const features = [
        {
            title: "Motor de IA",
            description: "Aprende seu estilo e cria conteúdo único",
            icon: Bot,
            color: "#4DD4F7"
        },
        {
            title: "Calendários Prontos",
            description: "Templates de conteúdo para suas plataformas",
            icon: Calendar,
            color: "#8B6FFF"
        },
        {
            title: "Estatísticas",
            description: "Acompanhe suas métricas em todas as suas plataformas",
            icon: Zap,
            color: "#D4FF4D"
        },
        {
            title: "Análise Inteligente",
            description: "Detecção de bloqueios criativos e sugestões de conteúdo",
            icon: BarChart3,
            color: "#FF6B7A"
        }
    ];

    if (isLoading || premiumLoading) {
        return (
            <div className="flex h-screen w-screen bg-[#0F0F0F] items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-white text-xl"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                    Carregando...
                </motion.div>
            </div>
        );
    }

    // Se não for premium, mostrar mensagem e opção para assinar
    if (isPremium) {
        return (
            <div className="flex h-screen w-screen bg-[#0F0F0F] font-sans antialiased" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
                
                <Sidebar />

                <div className="flex-1 flex items-center justify-center px-8">
                    <motion.div
                        className="max-w-2xl w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="text-center mb-8">
                            <motion.div
                                className="inline-block mb-6"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                            >
                                <div
                                    className="p-6 rounded-full"
                                    style={{ backgroundColor: "black"}}
                                >
                                    <Image src={logo} alt="Pal Creator Logo" width={64} height={64} />
                                </div>
                            </motion.div>
                            
                            <h1 className="text-4xl font-bold text-white mb-4" style={{ fontWeight: 800 }}>
                                Acesso Premium Necessário
                            </h1>
                            
                            <p className="text-[#888888] text-lg mb-8" style={{ lineHeight: 1.6 }}>
                                A página Home está disponível apenas para assinantes Premium.
                                Assine agora para ter acesso completo a todas as funcionalidades.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-[#2A2A2A] rounded-lg p-6 space-y-4">
                                <h3 className="text-xl font-bold text-white mb-4">O que você ganha com Premium:</h3>
                                
                                <div className="space-y-3">
                                    {[
                                        "Acesso completo à página Home",
                                        "Calendário de conteúdo ilimitado",
                                        "Geração de scripts com IA avançada",
                                        "Estatísticas detalhadas das redes sociais",
                                        "Suporte prioritário",
                                        "Novos recursos exclusivos"
                                    ].map((benefit, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-center gap-3"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                        >
                                            <div className="w-2 h-2 rounded-full bg-[#D4FF4D]" />
                                            <span className="text-white">{benefit}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                onClick={async () => {
                                    setIsPreparingCheckout(true);
                                    await redirectToCheckout();
                                }}
                                disabled={isPreparingCheckout}
                                className="w-full px-8 py-4 rounded-lg text-white font-semibold flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    background: "linear-gradient(90deg, #4DD4F7, #8B6FFF)",
                                    borderRadius: "8px"
                                }}
                                whileHover={{ scale: isPreparingCheckout ? 1 : 1.02 }}
                                whileTap={{ scale: isPreparingCheckout ? 1 : 0.98 }}
                            >
                                {isPreparingCheckout ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        Preparando...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={24} />
                                        Assinar Premium por R$ 29,90/mês
                                    </>
                                )}
                            </motion.button>
                            
                            <LoadingModal
                                isOpen={isPreparingCheckout}
                                message="Estamos preparando o link seguro para você"
                            />

                            <Link href="/dashboard">
                                <button
                                    className="w-full px-8 py-4 rounded-lg text-[#888888] font-semibold border border-[#4A4A4A] hover:border-[#888888] transition-colors"
                                    style={{ borderRadius: "8px" }}
                                >
                                    Voltar ao Dashboard
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen bg-[#0F0F0F] font-sans antialiased overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            
            <Sidebar />

            <motion.div
                className="flex-1 flex flex-col overflow-hidden"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Header */}
                <motion.div
                    className="px-8 py-6 border-b border-[#2A2A2A]"
                    variants={itemVariants}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white" style={{ fontWeight: 700 }}>
                                Bem-vindo de volta!
                            </h1>
                            <p className="text-[#888888] mt-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                {auth.currentUser?.displayName || auth.currentUser?.email || "Criador"}
                            </p>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link href="/makeScript">
                                <button
                                    className="px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2"
                                    style={{
                                        background: "linear-gradient(90deg, #4DD4F7, #8B6FFF)",
                                        borderRadius: "8px"
                                    }}
                                >
                                    <Sparkles size={20} />
                                    Criar Conteúdo
                                </button>
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Stats Cards */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-4 gap-4"
                            variants={itemVariants}
                        >
                            <motion.div
                                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6"
                                whileHover={{ scale: 1.02, borderColor: "#4DD4F7" }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[#888888] text-sm mb-1">Total de Seguidores</p>
                                        <p className="text-2xl font-bold text-white">{stats.totalFollowers.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(77, 212, 247, 0.1)" }}>
                                        <Users size={24} style={{ color: "#4DD4F7" }} />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6"
                                whileHover={{ scale: 1.02, borderColor: "#D4FF4D" }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[#888888] text-sm mb-1">Visualizações</p>
                                        <p className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(212, 255, 77, 0.1)" }}>
                                        <Eye size={24} style={{ color: "#D4FF4D" }} />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6"
                                whileHover={{ scale: 1.02, borderColor: "#FF6B7A" }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[#888888] text-sm mb-1">Curtidas</p>
                                        <p className="text-2xl font-bold text-white">{stats.totalLikes.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(255, 107, 122, 0.1)" }}>
                                        <Heart size={24} style={{ color: "#FF6B7A" }} />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6"
                                whileHover={{ scale: 1.02, borderColor: "#8B6FFF" }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[#888888] text-sm mb-1">Vídeos</p>
                                        <p className="text-2xl font-bold text-white">{stats.totalVideos.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(139, 111, 255, 0.1)" }}>
                                        <Video size={24} style={{ color: "#8B6FFF" }} />
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Platforms & Quick Actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Platforms */}
                            <motion.div
                                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6"
                                variants={itemVariants}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-white" style={{ fontWeight: 700 }}>
                                        Suas Plataformas
                                    </h2>
                                    <Link href="/links">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className="text-[#5B9FFF] cursor-pointer"
                                        >
                                            <ArrowRight size={20} />
                                        </motion.div>
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {platforms.length > 0 ? (
                                        platforms.map((platform, index) => (
                                            <motion.div
                                                key={platform.name}
                                                className="flex items-center justify-between p-4 bg-[#2A2A2A] rounded-lg"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="p-2 rounded-lg"
                                                        style={{ backgroundColor: `${platform.color}20` }}
                                                    >
                                                        <div style={{ color: platform.color }}>
                                                            {platform.icon}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-semibold">{platform.name}</p>
                                                        <p className="text-[#888888] text-sm">{platform.followers.toLocaleString()} seguidores</p>
                                                    </div>
                                                </div>
                                                <TrendingUp size={20} style={{ color: platform.color }} />
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-[#888888] mb-4">Nenhuma plataforma configurada</p>
                                            <Link href="/CreateViewsConfigure">
                                                <button
                                                    className="px-4 py-2 rounded-lg text-white text-sm"
                                                    style={{
                                                        background: "#2A2A2A",
                                                        border: "1px solid #4A4A4A"
                                                    }}
                                                >
                                                    Configurar Agora
                                                </button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Today's Events */}
                            <motion.div
                                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6"
                                variants={itemVariants}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-white" style={{ fontWeight: 700 }}>
                                        Eventos de Hoje
                                    </h2>
                                    <Link href="/dashboard">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className="text-[#5B9FFF] cursor-pointer"
                                        >
                                            <ArrowRight size={20} />
                                        </motion.div>
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {upcomingEvents.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {upcomingEvents.map((event, index) => (
                                                <motion.div
                                                    key={event.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    <EventCard
                                                        event={event}
                                                        onClick={(e) => {
                                                            // Opcional: abrir modal ou redirecionar
                                                            console.log("Event clicked:", e);
                                                        }}
                                                    />
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-[#888888] mb-4">Nenhum evento hoje</p>
                                            <Link href="/dashboard">
                                                <button
                                                    className="px-4 py-2 rounded-lg text-white text-sm"
                                                    style={{
                                                        background: "#2A2A2A",
                                                        border: "1px solid #4A4A4A"
                                                    }}
                                                >
                                                    Criar Evento
                                                </button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Quick Actions */}
                        <motion.div
                            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6"
                            variants={itemVariants}
                        >
                            <h2 className="text-xl font-bold text-white mb-6" style={{ fontWeight: 700 }}>
                                Ações Rápidas
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {quickActions.map((action, index) => {
                                    const Icon = action.icon;
                                    return (
                                        <Link key={action.title} href={action.href}>
                                            <motion.div
                                                className="p-6 bg-[#2A2A2A] rounded-lg cursor-pointer border border-[#3A3A3A]"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                whileHover={{ scale: 1.05, borderColor: action.color }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <div
                                                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                                                    style={{ background: action.gradient }}
                                                >
                                                    <Icon size={24} style={{ color: "#FFFFFF" }} />
                                                </div>
                                                <h3 className="text-white font-semibold mb-1">{action.title}</h3>
                                                <p className="text-[#888888] text-sm">{action.description}</p>
                                            </motion.div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Features */}
                        <motion.div
                            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6"
                            variants={itemVariants}
                        >
                            <h2 className="text-xl font-bold text-white mb-6" style={{ fontWeight: 700 }}>
                                Recursos Principais
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {features.map((feature, index) => {
                                    const Icon = feature.icon;
                                    return (
                                        <motion.div
                                            key={feature.title}
                                            className="p-6 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ scale: 1.02, borderColor: feature.color }}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                                                style={{ backgroundColor: `${feature.color}20` }}
                                            >
                                                <Icon size={20} style={{ color: feature.color }} />
                                            </div>
                                            <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                                            <p className="text-[#888888] text-sm">{feature.description}</p>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default HomePage;

