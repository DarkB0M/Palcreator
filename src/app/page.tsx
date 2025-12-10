"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    Sparkles, 
    Calendar, 
    Zap, 
    Bot, 
    BarChart3, 
    Rocket,
    ArrowRight,
    CheckCircle,
    Target,
    Clock,
    TrendingUp,
    Users,
    ChevronDown
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import logo from "@/public/logo.png";
const LandingPage = () => {
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);
    const y = useTransform(scrollY, [0, 300], [0, -50]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
        });

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            unsubscribe();
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleGetStarted = () => {
        if (isAuthenticated) {
            router.push("/home");
        } else {
            router.push("/login");
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    const features = [
        {
            title: "Motor de IA",
            description: "Aprende seu estilo e cria conteúdo único para você",
            icon: Bot,
            color: "#4DD4F7",
            gradient: "linear-gradient(135deg, #4DD4F7 0%, #8B6FFF 100%)",
        },
        {
            title: "Calendários Prontos",
            description: "Templates de conteúdo otimizados para suas plataformas",
            icon: Calendar,
            color: "#8B6FFF",
            gradient: "linear-gradient(135deg, #8B6FFF 0%, #4DD4F7 100%)",
        },
        {
            title: "Geração Automática",
            description: "Posts, títulos e roteiros gerados por IA em segundos",
            icon: Sparkles,
            color: "#D4FF4D",
            gradient: "linear-gradient(135deg, #D4FF4D 0%, #FFE14D 100%)",
        },
        {
            title: "Detecção Inteligente",
            description: "Identifica bloqueios criativos e sugere temas em tempo real",
            icon: Zap,
            color: "#FF6B7A",
            gradient: "linear-gradient(135deg, #FF6B7A 0%, #FFE14D 100%)",
        },
        {
            title: "Estatísticas Completas",
            description: "Acompanhe métricas de todas as suas plataformas em um só lugar",
            icon: BarChart3,
            color: "#4DD4F7",
            gradient: "linear-gradient(135deg, #4DD4F7 0%, #8B6FFF 100%)",
        },
        {
            title: "Postagem Automática",
            description: "Publique em múltiplas plataformas com apenas um clique",
            icon: Rocket,
            color: "#D4FF4D",
            gradient: "linear-gradient(135deg, #D4FF4D 0%, #FF6B7A 100%)",
        },
    ];

    const benefits = [
        "Criação de conteúdo ilimitada",
        "Calendários personalizados por IA",
        "Análise de performance em tempo real",
        "Sugestões de temas baseadas em tendências",
        "Organização automática de blocos de gravação"
    ];

  return (
        <div className="min-h-screen bg-[#0F0F0F] text-white overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            
            {/* Navigation */}
            <motion.nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isScrolled ? "bg-[#1A1A1A]/95 backdrop-blur-md border-b border-[#2A2A2A]" : "bg-transparent"
                }`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #4DD4F7 0%, #8B6FFF 100%)" }}
                        >
                            <Image 
                                src={logo}
                                alt="Pal Creator"
                                width={40}
                                height={40}
                            />
                        </div>
                        <span className="text-xl font-bold" style={{ fontWeight: 700 }}>
                            Pal Creator
                        </span>
                    </motion.div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="px-4 py-2 text-[#888888] hover:text-white transition-colors"
                        >
                            Entrar
                        </Link>
                        <motion.button
                            onClick={handleGetStarted}
                            className="px-6 py-3 rounded-lg text-white font-semibold"
                            style={{
                                background: "linear-gradient(90deg, #4DD4F7, #8B6FFF)",
                                borderRadius: "8px",
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Começar Agora
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <motion.section
                className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
                        style={{ background: "linear-gradient(135deg, #4DD4F7 0%, #8B6FFF 100%)" }}
                        animate={{
                            x: [0, 50, 0],
                            y: [0, 50, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
        />
                    <motion.div
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
                        style={{ background: "linear-gradient(135deg, #FF6B7A 0%, #FFE14D 100%)" }}
                        animate={{
                            x: [0, -50, 0],
                            y: [0, -50, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto text-center">
                    <motion.div variants={itemVariants}>
                        <motion.h1
                            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
                            style={{ fontWeight: 800 }}
                        >
                            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #4DD4F7, #8B6FFF)" }}>
                                Crie mais.
                            </span>
                            <br />
                            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #FF6B7A, #FFE14D)" }}>
                                Trabalhe menos.
                            </span>
                            <br />
                            <span className="text-white">Cresça sempre.</span>
                        </motion.h1>
                    </motion.div>

                    <motion.p
                        className="text-xl md:text-2xl text-[#888888] mb-8 max-w-3xl mx-auto"
                        variants={itemVariants}
                        style={{ lineHeight: 1.6 }}
                    >
                        O copiloto criativo que você sempre quis. Plataforma inteligente que cria conteúdo completo através de IA, entendendo seu nicho, objetivos e rotina.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
                        variants={itemVariants}
                    >
                        <motion.button
                            onClick={handleGetStarted}
                            className="px-8 py-4 rounded-lg text-white font-semibold text-lg flex items-center gap-2"
                            style={{
                                background: "linear-gradient(90deg, #4DD4F7, #8B6FFF)",
                                borderRadius: "8px",
                            }}
                            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(77, 212, 247, 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Começar Gratuitamente
                            <ArrowRight size={20} />
                        </motion.button>
                        <motion.button
                            className="px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-2"
                            style={{
                                background: "#2A2A2A",
                                border: "1px solid #4A4A4A",
                                color: "#FFFFFF",
                                borderRadius: "8px",
                            }}
                            whileHover={{ scale: 1.05, borderColor: "#5B9FFF" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            Saiba Mais
                        </motion.button>
                    </motion.div>

                    <motion.div
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <ChevronDown size={32} className="text-[#888888]" />
                    </motion.div>
                </div>
            </motion.section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontWeight: 700 }}>
                            Recursos Poderosos
                        </h2>
                        <p className="text-xl text-[#888888] max-w-2xl mx-auto">
                            Tudo que você precisa para criar conteúdo de forma inteligente e eficiente
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 hover:border-transparent transition-all group"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: `0 20px 40px ${feature.color}20`,
                                }}
                                style={{
                                    background: "linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)",
                                }}
                            >
                                <div
                                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                                    style={{ background: feature.gradient }}
                                >
                                    <feature.icon size={28} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2" style={{ fontWeight: 700 }}>
                                    {feature.title}
                                </h3>
                                <p className="text-[#888888]" style={{ lineHeight: 1.6 }}>
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 px-6 bg-[#1A1A1A]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontWeight: 700 }}>
                                Transforme sua criatividade em
                                <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #4DD4F7, #8B6FFF)" }}>
                                    {" "}resultados
                                </span>
                            </h2>
                            <p className="text-xl text-[#888888] mb-8" style={{ lineHeight: 1.6 }}>
                                Maximize sua produtividade com automação inteligente e sugestões de conteúdo em tempo real.
                            </p>
                            <div className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={benefit}
                                        className="flex items-center gap-3"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                    >
                                        <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ background: "linear-gradient(90deg, #4DD4F7, #8B6FFF)" }}
                                        >
                                            <CheckCircle size={16} className="text-white" />
                                        </div>
                                        <span className="text-lg text-white">{benefit}</span>
                                    </motion.div>
                                ))}
        </div>
                        </motion.div>

                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="bg-[#2A2A2A] rounded-2xl p-8 border border-[#4A4A4A]">
                                <div className="space-y-6">
                                    {[
                                        { icon: Target, title: "Foco no seu nicho", color: "#4DD4F7" },
                                        { icon: Clock, title: "Economize tempo", color: "#D4FF4D" },
                                        { icon: TrendingUp, title: "Aumente engajamento", color: "#FF6B7A" },
                                        { icon: Users, title: "Cresça sua audiência", color: "#8B6FFF" },
                                    ].map((item, index) => (
                                        <motion.div
                                            key={item.title}
                                            className="flex items-center gap-4"
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: index * 0.1 }}
                                        >
                                            <div
                                                className="w-12 h-12 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: `${item.color}20` }}
                                            >
                                                <item.icon size={24} style={{ color: item.color }} />
                                            </div>
                                            <span className="text-lg font-semibold">{item.title}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
        </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontWeight: 700 }}>
                            Pronto para começar?
                        </h2>
                        <p className="text-xl text-[#888888] mb-8" style={{ lineHeight: 1.6 }}>
                            Junte-se a criadores que já estão transformando seu processo criativo com IA.
                        </p>
                        <motion.button
                            onClick={handleGetStarted}
                            className="px-8 py-4 rounded-lg text-white font-semibold text-lg flex items-center gap-2 mx-auto"
                            style={{
                                background: "linear-gradient(90deg, #4DD4F7, #8B6FFF)",
                                borderRadius: "8px",
                            }}
                            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(77, 212, 247, 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Começar Agora
                            <ArrowRight size={20} />
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[#2A2A2A]">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #4DD4F7 0%, #8B6FFF 100%)" }}
                        >
                           <Image src={logo} alt="Pal Creator" width={32} height={32} />
                        </div>
                        <span className="text-lg font-bold" style={{ fontWeight: 700 }}>
                            Pal Creator
                        </span>
                    </div>
                    <p className="text-[#888888]">
                        © 2024 Pal Creator. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
    </div>
  );
};

export default LandingPage;
