"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { 
    Settings as SettingsIcon,
    CreditCard,
    Calendar,
    User,
    LogOut,
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    Crown,
    Sparkles,
    Loader2
} from "lucide-react";
import { usePremium } from "@/hooks/usePremium";
import { cancelSubscription, redirectToCheckout } from "@/lib/premium";
import LoadingModal from "@/components/ui/LoadingModal";
import { signOut } from "firebase/auth";

const SettingsPage = () => {
    const router = useRouter();
    const { isPremium, status, currentPeriodEnd, loading: premiumLoading } = usePremium();
    const [isCanceling, setIsCanceling] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [cancelSuccess, setCancelSuccess] = useState(false);
    const [regenerateSuccess, setRegenerateSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPreparingCheckout, setIsPreparingCheckout] = useState(false);

    useEffect(() => {
        if (!auth.currentUser) {
            router.push('/login');
        }
    }, [router]);

    const handleCancelSubscription = async () => {
        if (!confirm('Tem certeza que deseja cancelar sua assinatura? Ela permanecerá ativa até o final do período atual.')) {
            return;
        }

        setIsCanceling(true);
        setError(null);
        setCancelSuccess(false);

        try {
            const success = await cancelSubscription();
            if (success) {
                setCancelSuccess(true);
                // Atualizar status após um momento
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setError('Erro ao cancelar assinatura. Tente novamente.');
            }
        } catch (err) {
            console.error('Error canceling subscription:', err);
            setError('Erro ao cancelar assinatura. Tente novamente.');
        } finally {
            setIsCanceling(false);
        }
    };

    const handleRegenerateCalendar = async () => {
        if (!confirm('Tem certeza que deseja refazer o calendário? Isso irá gerar um novo calendário baseado nas suas preferências atuais.')) {
            return;
        }

        if (!auth.currentUser?.uid) {
            setError('Usuário não autenticado');
            return;
        }

        setIsRegenerating(true);
        setError(null);
        setRegenerateSuccess(false);

        try {
            const response = await fetch('/api/makeCalendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: auth.currentUser.uid }),
            });

            const data = await response.json();

            if (response.ok) {
                setRegenerateSuccess(true);
                // Redirecionar para dashboard após sucesso
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            } else {
                setError(data.error || 'Erro ao refazer calendário. Tente novamente.');
            }
        } catch (err) {
            console.error('Error regenerating calendar:', err);
            setError('Erro ao refazer calendário. Tente novamente.');
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const formatDate = (timestamp: number | null) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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

    if (premiumLoading) {
        return (
            <div className="flex h-screen w-screen bg-[#0F0F0F] items-center justify-center">
                <div className="text-white text-xl" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    Carregando...
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
                    <div className="flex items-center gap-3">
                        <div
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: 'rgba(91, 159, 255, 0.1)' }}
                        >
                            <SettingsIcon size={28} style={{ color: '#5B9FFF' }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white" style={{ fontWeight: 700 }}>
                                Configurações
                            </h1>
                            <p className="text-[#888888] mt-1">Gerencie sua conta e preferências</p>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Subscription Section */}
                        <motion.div
                            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6"
                            variants={itemVariants}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: 'rgba(212, 255, 77, 0.1)' }}
                                >
                                    <Crown size={24} style={{ color: '#D4FF4D' }} />
                                </div>
                                <h2 className="text-xl font-bold text-white" style={{ fontWeight: 700 }}>
                                    Assinatura Premium
                                </h2>
                            </div>

                            {isPremium ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-[#2A2A2A] rounded-lg">
                                        <CheckCircle size={20} style={{ color: '#D4FF4D' }} />
                                        <div className="flex-1">
                                            <p className="text-white font-semibold">Status: Ativo</p>
                                            <p className="text-[#888888] text-sm">
                                                Válido até {formatDate(currentPeriodEnd)}
                                            </p>
                                        </div>
                                        <div
                                            className="px-3 py-1 rounded-full text-xs font-semibold"
                                            style={{ 
                                                backgroundColor: 'rgba(212, 255, 77, 0.1)',
                                                color: '#D4FF4D'
                                            }}
                                        >
                                            Premium
                                        </div>
                                    </div>

                                    {cancelSuccess ? (
                                        <motion.div
                                            className="p-4 bg-[#2A2A2A] border border-[#D4FF4D] rounded-lg"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <CheckCircle size={20} style={{ color: '#D4FF4D' }} />
                                                <p className="text-white">
                                                    Assinatura cancelada com sucesso. Você continuará tendo acesso até {formatDate(currentPeriodEnd)}.
                                                </p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="p-4 bg-[#2A2A2A] rounded-lg border border-[#4A4A4A]">
                                            <div className="flex items-start gap-3 mb-4">
                                                <AlertTriangle size={20} style={{ color: '#FF6B7A' }} />
                                                <div className="flex-1">
                                                    <p className="text-white font-semibold mb-1">Cancelar Assinatura</p>
                                                    <p className="text-[#888888] text-sm">
                                                        Sua assinatura será cancelada no final do período atual. Você continuará tendo acesso até então.
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleCancelSubscription}
                                                disabled={isCanceling}
                                                className="px-6 py-3 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{
                                                    background: "#2A2A2A",
                                                    border: "1px solid #FF6B7A",
                                                    color: "#FF6B7A"
                                                }}
                                            >
                                                {isCanceling ? (
                                                    <span className="flex items-center gap-2">
                                                        <RefreshCw size={16} className="animate-spin" />
                                                        Cancelando...
                                                    </span>
                                                ) : (
                                                    'Cancelar Assinatura'
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-[#2A2A2A] rounded-lg">
                                        <p className="text-[#888888] mb-4">
                                            Você não possui uma assinatura Premium ativa.
                                        </p>
                                        <button
                                            onClick={async () => {
                                                setIsPreparingCheckout(true);
                                                await redirectToCheckout();
                                            }}
                                            disabled={isPreparingCheckout}
                                            className="px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                                background: "linear-gradient(90deg, #4DD4F7, #8B6FFF)",
                                                borderRadius: "8px"
                                            }}
                                        >
                                            {isPreparingCheckout ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" />
                                                    Preparando...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={20} />
                                                    Assinar Premium
                                                </>
                                            )}
                                        </button>
                                        
                                        <LoadingModal
                                            isOpen={isPreparingCheckout}
                                            message="Estamos preparando o link seguro para você"
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Calendar Section */}
                        <motion.div
                            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6"
                            variants={itemVariants}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: 'rgba(77, 212, 247, 0.1)' }}
                                >
                                    <Calendar size={24} style={{ color: '#4DD4F7' }} />
                                </div>
                                <h2 className="text-xl font-bold text-white" style={{ fontWeight: 700 }}>
                                    Calendário
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-[#2A2A2A] rounded-lg">
                                    <p className="text-white font-semibold mb-2">Refazer Calendário</p>
                                    <p className="text-[#888888] text-sm mb-4">
                                        Gere um novo calendário baseado nas suas preferências atuais. Isso irá substituir o calendário existente.
                                    </p>

                                    {regenerateSuccess ? (
                                        <motion.div
                                            className="p-4 bg-[#2A2A2A] border border-[#4DD4F7] rounded-lg mb-4"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <CheckCircle size={20} style={{ color: '#4DD4F7' }} />
                                                <p className="text-white">
                                                    Calendário regenerado com sucesso! Redirecionando...
                                                </p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <button
                                            onClick={handleRegenerateCalendar}
                                            disabled={isRegenerating}
                                            className="px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                                background: "linear-gradient(90deg, #4DD4F7, #8B6FFF)",
                                                borderRadius: "8px"
                                            }}
                                        >
                                            {isRegenerating ? (
                                                <>
                                                    <RefreshCw size={16} className="animate-spin" />
                                                    Regenerando...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw size={16} />
                                                    Refazer Calendário
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Account Section */}
                        <motion.div
                            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6"
                            variants={itemVariants}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: 'rgba(91, 159, 255, 0.1)' }}
                                >
                                    <User size={24} style={{ color: '#5B9FFF' }} />
                                </div>
                                <h2 className="text-xl font-bold text-white" style={{ fontWeight: 700 }}>
                                    Conta
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-[#2A2A2A] rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white font-semibold">Email</p>
                                            <p className="text-[#888888] text-sm">{auth.currentUser?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-[#2A2A2A] rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white font-semibold">Nome</p>
                                            <p className="text-[#888888] text-sm">
                                                {auth.currentUser?.displayName || 'Não definido'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full px-6 py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                                    style={{
                                        background: "#2A2A2A",
                                        border: "1px solid #FF6B7A",
                                        color: "#FF6B7A"
                                    }}
                                >
                                    <LogOut size={20} />
                                    Sair da Conta
                                </button>
                            </div>
                        </motion.div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                className="p-4 bg-[#2A2A2A] border border-[#FF6B7A] rounded-lg"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="flex items-center gap-3">
                                    <AlertTriangle size={20} style={{ color: '#FF6B7A' }} />
                                    <p className="text-white">{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
            
            {/* Modal de Preparação de Checkout */}
            <LoadingModal
                isOpen={isPreparingCheckout}
                message="Estamos preparando o link seguro para você"
            />
        </div>
    );
};

export default SettingsPage;

