"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MiniCalendar from "@/components/layout/MiniCalendar";
import Filters from "@/components/layout/Filters";
import WeekView from "@/components/layout/WeekView";
import Button from "@/components/ui/Btn";
import { Rocket } from "lucide-react";

import type { WeekColumn } from "@/components/layout/WeekView";
import type { EventData } from "@/components/layout/EventCard";
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import EventModal from "@/components/ui/EventModal";
import LoadingModal from "@/components/ui/LoadingModal";

const DashboardPage = () => {
    const router = useRouter();
    const [calendarData, setCalendarData] = useState<WeekColumn[]>([]);
    const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRegeneratingCalendar, setIsRegeneratingCalendar] = useState(false);
    const [calendarExpires, setCalendarExpires] = useState<string | null>(null);

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
                    localStorage.setItem('user', data)
                    if (data.isNewUser) {
                        router.push('/configurate');
                    }
                })
        }
        else {
            router.push('/login');
        }
    }

    const checkAndRegenerateCalendar = async () => {
        if (!auth.currentUser?.uid) return;

        try {
            setIsLoadingCalendar(true);
            // Buscar dados do calendário incluindo data de expiração
            const response = await fetch("/api/getCalendar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: auth.currentUser.uid
                })
            });

            const data = await response.json();

            if (response.ok) {
                setCalendarExpires(data.calendarExpires || null);

                // Verificar se o calendário expirou hoje
                if (data.calendarExpires) {
                    const expiresDate = new Date(data.calendarExpires);
                    const today = new Date();
                    
                    // Comparar apenas a data (sem horas)
                    expiresDate.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);

                    if (expiresDate.getTime() === today.getTime()) {
                        // Calendário expirou hoje, regenerar
                        console.log('Calendar expired today, regenerating...');
                        await regenerateCalendar();
                        return;
                    }
                }

                // Se não expirou, carregar calendário normalmente
                if (data.calendar && Array.isArray(data.calendar)) {
                    const processedData = processCalendarData(data.calendar);
                    setAllCalendarData(processedData);
                } else {
                    setAllCalendarData([]);
                }
            } else {
                setAllCalendarData([]);
            }
        } catch (error) {
            console.error("Error checking calendar:", error);
            setAllCalendarData([]);
        } finally {
            setIsLoadingCalendar(false);
        }
    };

    const regenerateCalendar = async () => {
        if (!auth.currentUser?.uid) return;

        setIsRegeneratingCalendar(true);

        try {
            const response = await fetch("/api/excludeCalendar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: auth.currentUser.uid
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Aguardar um pouco para garantir que o calendário foi salvo
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Buscar o novo calendário
                await fetchCalendar();
            } else {
                console.error("Error regenerating calendar:", data.error);
                alert("Erro ao regenerar calendário. Tente novamente.");
            }
        } catch (error) {
            console.error("Error regenerating calendar:", error);
            alert("Erro ao regenerar calendário. Tente novamente.");
        } finally {
            setIsRegeneratingCalendar(false);
        }
    };

    const fetchCalendar = async () => {
        if (!auth.currentUser?.uid) return;

        try {
            setIsLoadingCalendar(true);
            const response = await fetch("/api/getCalendar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: auth.currentUser.uid
                })
            });

            const data = await response.json();

            if (response.ok && data.calendar && Array.isArray(data.calendar)) {
                const processedData = processCalendarData(data.calendar);
                setAllCalendarData(processedData);
                setCalendarExpires(data.calendarExpires || null);
            } else {
                setAllCalendarData([]);
            }
        } catch (error) {
            console.error("Error fetching calendar:", error);
            setAllCalendarData([]);
        } finally {
            setIsLoadingCalendar(false);
        }
    }

    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekStart, setWeekStart] = useState<Date>(() => {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day; // Domingo da semana atual
        return new Date(today.setDate(diff));
    });
    const [allCalendarData, setAllCalendarData] = useState<WeekColumn[]>([]);

    // Processar dados do banco: aceitar formato ISO diretamente
    const processCalendarData = (rawData: any[]): WeekColumn[] => {
        if (!Array.isArray(rawData)) return [];
        return rawData;
    };

    // Obter dados da semana atual (7 dias a partir de weekStart)
    const getCurrentWeekData = (): WeekColumn[] => {
        const weekData: WeekColumn[] = [];
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);

            // Formato da data para comparação: YYYY-MM-DD
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            // Nome do dia para exibição
            const dayName = weekDays[date.getDay()];
            const dayNumber = date.getDate();
            const displayDay = `${dayName} ${dayNumber}`;

            // Buscar eventos para esta data
            const matchingData = allCalendarData.find(item => item.day === dateStr);

            weekData.push({
                day: displayDay,
                events: matchingData?.events || []
            });
        }

        return weekData;
    };

    const handleNextWeek = () => {
        const nextWeek = new Date(weekStart);
        nextWeek.setDate(weekStart.getDate() + 7);
        setWeekStart(nextWeek);
        setCurrentDate(nextWeek);
    };

    const handlePrevWeek = () => {
        const prevWeek = new Date(weekStart);
        prevWeek.setDate(weekStart.getDate() - 7);
        setWeekStart(prevWeek);
        setCurrentDate(prevWeek);
    };

    const handleNextMonth = () => {
        const nextMonth = new Date(currentDate);
        nextMonth.setMonth(currentDate.getMonth() + 1);
        setCurrentDate(nextMonth);
        // Ajustar weekStart para o primeiro domingo do próximo mês
        const firstDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
        const day = firstDay.getDay();
        const diff = firstDay.getDate() - day;
        setWeekStart(new Date(firstDay.setDate(diff)));
    };

    const handlePrevMonth = () => {
        const prevMonth = new Date(currentDate);
        prevMonth.setMonth(currentDate.getMonth() - 1);
        setCurrentDate(prevMonth);
        // Ajustar weekStart para o primeiro domingo do mês anterior
        const firstDay = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
        const day = firstDay.getDay();
        const diff = firstDay.getDate() - day;
        setWeekStart(new Date(firstDay.setDate(diff)));
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
        // Ajustar weekStart para o domingo da semana atual
        const day = today.getDay();
        const diff = today.getDate() - day;
        setWeekStart(new Date(today.setDate(diff)));
    };

    const handleViewChange = (view: 'day' | 'week' | 'month') => {
        setViewMode(view);
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setCurrentDate(date);
        // Ajustar weekStart para o domingo da semana selecionada
        const day = date.getDay();
        const diff = date.getDate() - day;
        setWeekStart(new Date(date.setDate(diff)));
    };

    const handleEventClick = (event: EventData) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
    };

    const handleGenerateScript = (event: EventData) => {
        console.log("Gerar roteiro para:", event);
        // Navegar para a página makeScript com o título preenchido
        router.push(`/makeScript?prefill=${encodeURIComponent(event.title)}`);
    };

    // Atualizar dados da semana quando weekStart ou allCalendarData mudarem
    useEffect(() => {
        const weekData = getCurrentWeekData();
        setCalendarData(weekData);
    }, [weekStart, allCalendarData]);

    useEffect(() => {
        useFirstLogin();
        checkAndRegenerateCalendar();
    }, []);

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
                ease: [0.4, 0, 0.2, 1],
            },
        },
    };

    const sidebarVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
            },
        },
    };

    return (
        <motion.div
            className="flex h-screen bg-[#0F0F0F] text-white overflow-hidden"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            <motion.div variants={sidebarVariants}>
                <Sidebar />
            </motion.div>
            <div className="flex-1 flex flex-col">
                <motion.div variants={itemVariants}>
                    <Header
                        currentDate={currentDate}
                        onNext={viewMode === 'week' ? handleNextWeek : handleNextMonth}
                        onPrev={viewMode === 'week' ? handlePrevWeek : handlePrevMonth}
                        onToday={handleToday}
                        viewMode={viewMode}
                        onViewChange={handleViewChange}
                    />
                </motion.div>
                <div className="flex flex-1 overflow-hidden">
                    <motion.div
                        className="w-80 p-6 flex flex-col gap-6 border-r border-[#2A2A2A] overflow-y-auto bg-[#1A1A1A]"
                        variants={itemVariants}
                    >
                       
                        <motion.div variants={itemVariants}>
                            <MiniCalendar
                                currentDate={currentDate}
                                onPrev={handlePrevMonth}
                                onNext={handleNextMonth}
                                selectedDate={selectedDate}
                                onDateSelect={handleDateSelect}
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            
                        </motion.div>
                    </motion.div>
                    <motion.div className="flex-1" variants={itemVariants}>
                        <AnimatePresence mode="wait">
                            {isLoadingCalendar ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center justify-center h-full bg-[#0F0F0F]"
                                >
                                    <motion.div
                                        className="text-[#888888]"
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        Carregando calendário...
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="calendar"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="h-full"
                                >
                                    <WeekView data={calendarData} onEventClick={handleEventClick} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            {/* Modal de Evento */}
            <EventModal
                isOpen={isModalOpen}
                event={selectedEvent}
                onClose={handleCloseModal}
                onGenerateScript={handleGenerateScript}
            />

            {/* Modal de Regeneração de Calendário */}
            <LoadingModal
                isOpen={isRegeneratingCalendar}
                message="Estamos fazendo um novo calendário para você"
            />
        </motion.div>
    );
};

export default DashboardPage;
