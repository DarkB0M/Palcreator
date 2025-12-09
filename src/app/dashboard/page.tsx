"use client";
import React, { useEffect } from "react";
import { useState } from "react";
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

const DashboardPage = () => {
    const router = useRouter();
    const [calendarData, setCalendarData] = useState<WeekColumn[]>([]);
    const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
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
                console.log("Calendar data loaded:", processedData);
            } else {
                console.log("No calendar data found, using default");
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

    // Processar dados do banco: converter formato de data e garantir estrutura correta
    const processCalendarData = (rawData: any[]): WeekColumn[] => {
        if (!Array.isArray(rawData)) return [];
        
        return rawData.map((item, index) => {
            let dayStr = item.day || "";
            let events = item.events || [];
            let originalDateStr = "";
            
            // Se day está no formato ISO (2025-11-24), manter a data original e converter para formato legível
            if (dayStr.includes("-")) {
                originalDateStr = dayStr;
                const date = new Date(dayStr);
                const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                const dayName = weekDays[date.getDay()];
                const dayNumber = date.getDate();
                dayStr = `${dayName} ${dayNumber}`;
            } else {
                // Se já está no formato legível, tentar extrair a data
                originalDateStr = dayStr;
            }
            
            return {
                day: dayStr,
                events: events,
                originalDate: originalDateStr, // Manter data original para busca
                index: index // Manter índice original
            } as WeekColumn & { originalDate?: string; index?: number };
        });
    };

    // Obter dados da semana atual (7 dias a partir de weekStart)
    const getCurrentWeekData = (): WeekColumn[] => {
        const weekData: WeekColumn[] = [];
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            
            const dayName = weekDays[date.getDay()];
            const dayNumber = date.getDate();
            const dayStr = `${dayName} ${dayNumber}`;
            
            // Buscar dados correspondentes a esta data
            const dateStr = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            
            // Buscar nos dados processados
            const matchingData = allCalendarData.find(item => {
                const itemWithExtras = item as WeekColumn & { originalDate?: string };
                const itemDay = item.day;
                const originalDate = itemWithExtras.originalDate;
                
                // Se tem data original no formato ISO, comparar
                if (originalDate && originalDate.includes("-")) {
                    return originalDate === dateStr;
                }
                
                // Se o item tem formato "Dom 24", verificar se corresponde
                if (itemDay === dayStr) {
                    return true;
                }
                
                // Se ainda tem formato ISO, verificar
                if (itemDay.includes("-") && itemDay.startsWith(dateStr)) {
                    return true;
                }
                
                return false;
            });
            
            weekData.push({
                day: dayStr,
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
        // Cria um novo chat automaticamente com a primeira mensagem sendo o título do evento
        (async () => {
            try {
                const uid = auth.currentUser?.uid;
                if (!uid) {
                    console.warn('handleGenerateScript: usuário não autenticado');
                    router.push('/login');
                    return;
                }

                // Criar o chat sem enviar a mensagem — iremos apenas preencher o input na tela de makeScript
                const newChat = {
                    id: '',
                    title: event.title,
                    timestamp: new Date().toISOString(),
                    messages: []
                };

                const response = await fetch('/api/newChat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid, chat: newChat })
                });

                const data = await response.json();
                console.log('handleGenerateScript: newChat response', { status: response.status, data });
                if (response.ok && data.chatId) {
                    // Navega para a tela de criação com o chat recém-criado e preenche o input para edição
                    const prefill = encodeURIComponent(event.title);
                    router.push(`/makeScript?chatId=${data.chatId}&prefill=${prefill}`);
                } else {
                    console.error('handleGenerateScript: falha ao criar chat', data);
                }
            } catch (error) {
                console.error('handleGenerateScript error', error);
            }
        })();
    };
    
    // Atualizar dados da semana quando weekStart ou allCalendarData mudarem
    useEffect(() => {
        if (allCalendarData.length > 0 || weekStart) {
            const weekData = getCurrentWeekData();
            setCalendarData(weekData);
        }
    }, [weekStart, allCalendarData]);

    useEffect(() => {
        useFirstLogin();
        fetchCalendar();
    }, []);

    return (
        <div className="flex h-screen bg-[#0F0F0F] text-white overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header
                    currentDate={currentDate}
                    onNext={viewMode === 'week' ? handleNextWeek : handleNextMonth}
                    onPrev={viewMode === 'week' ? handlePrevWeek : handlePrevMonth}
                    onToday={handleToday}
                    viewMode={viewMode}
                    onViewChange={handleViewChange}
                />
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-80 p-6 flex flex-col gap-6 border-r border-[#2A2A2A] overflow-y-auto bg-[#1A1A1A]">
                        <button className="w-full py-3 px-4 bg-gradient-to-r from-[#4DD4F7] to-[#8B6FFF] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>
                            <Rocket size={18} /> Agendar Publicação
                        </button>
                        <MiniCalendar
                            currentDate={currentDate}
                            onPrev={handlePrevMonth}
                            onNext={handleNextMonth}
                            selectedDate={selectedDate}
                            onDateSelect={handleDateSelect}
                        />
                        <Filters />
                    </div>
                    <div className="flex-1">
                        {isLoadingCalendar ? (
                            <div className="flex items-center justify-center h-full bg-[#0F0F0F]">
                                <div className="text-[#888888]">Carregando calendário...</div>
                            </div>
                        ) : (
                            <WeekView data={calendarData} onEventClick={handleEventClick} />
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Evento */}
            <EventModal
                isOpen={isModalOpen}
                event={selectedEvent}
                onClose={handleCloseModal}
                onGenerateScript={handleGenerateScript}
            />
        </div>
    );
};

export default DashboardPage;
