"use client";

import React, { useState, useRef, useEffect } from "react";
import { Copy, ThumbsUp, ThumbsDown, Send, Bot, Sparkles, History, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Sidebar from "@/components/layout/Sidebar"; // Assumindo que este é um Client Component
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth"; // Importar o tipo User do firebase/auth
import { useSearchParams } from 'next/navigation';

// Definindo as interfaces com o timestamp de forma mais flexível para evitar problemas de tipagem com APIs
interface Message {
    id: string;
    role: "assistant" | "user";
    content: string;
    timestamp: string | Date; // Pode ser Date (no estado) ou string (na API)
}

interface ChatHistory {
    id: string;
    title: string;
    timestamp: string | Date; // Pode ser Date (no estado) ou string (na API)
    messages: Message[];
}

// Helper para formatar o timestamp de forma segura
const formatTimestamp = (timestamp: string | Date): string => {
    try {
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        return date.toLocaleDateString('pt-BR');
    } catch (e) {
        console.error("Erro ao formatar data:", e);
        return "Data inválida";
    }
}

export default function MakeScriptPage() {
    const initialMessage: Message = {
        id: "1",
        role: "assistant",
        content: "Olá! Sou seu copiloto criativo. Sobre o que você quer criar hoje? Posso ajudar com roteiros para YouTube, legendas para Instagram, ideias de TikTok e muito mais.",
        timestamp: new Date()
    };

    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [user, setUser] = useState<User | null>(auth.currentUser); // Novo estado para o usuário
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Função para rolar para o final das mensagens
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Efeito para rolar e focar no input quando as mensagens mudam
    useEffect(() => {
        scrollToBottom();
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }, [messages, isLoading]);

    // Buscar histórico de chats
    const fetchChatHistory = async (uid: string) => {
        console.log("Fetching chat history for UID:", uid);
        setChatHistory([]); // Limpar o histórico ao iniciar o carregamento

        try {
            setIsLoadingHistory(true);
            const response = await fetch("/api/getChats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid })
            });

            const data = await response.json();

            if (response.ok && data.chats) {
                // Mapeia para a interface ChatHistory, garantindo que timestamp seja Date se possível
                const formattedChats: ChatHistory[] = data.chats
                    .map((chat: any) => ({
                        id: chat.id,
                        title: chat.title || "Nova Conversa",
                        timestamp: chat.timestamp ? new Date(chat.timestamp) : new Date(),
                        messages: chat.messages ? chat.messages.map((msg: any) => ({
                            ...msg,
                            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
                        })) : []
                    }))
                    // Ordena por data (mais recente primeiro)
                    .sort((a: ChatHistory, b: ChatHistory) => {
                        const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
                        const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
                        return dateB.getTime() - dateA.getTime();
                    });

                setChatHistory(formattedChats);
            } else {
                setChatHistory([]); // Garante que o estado seja limpo em caso de erro da API
            }
        } catch (error) {
            console.error("Error fetching chat history:", error);
            setChatHistory([]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // Efeito para buscar o histórico de chats APÓS o estado de autenticação ser carregado
    useEffect(() => {
        // Usa onAuthStateChanged para garantir que auth.currentUser foi carregado corretamente
        const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
            setUser(firebaseUser); // Atualiza o estado do usuário
            setIsLoadingHistory(true); // Sempre começa como carregando ao mudar o estado de auth

            if (firebaseUser) {
                console.log("Usuário logado. Buscando histórico...");
                // Chama a função de busca apenas se houver um usuário (firebaseUser não é null)
                fetchChatHistory(firebaseUser.uid);
            } else {
                console.log("Nenhum usuário logado. Não buscar histórico.");
                // Limpa o histórico se o usuário deslogar
                setChatHistory([]);
                setIsLoadingHistory(false);
            }
        });

        // Limpa o ouvinte ao desmontar o componente
        return () => unsubscribe();
    }, []); // A dependência vazia garante que o ouvinte seja configurado apenas uma vez

    // Salvar o chat atualizado no banco de dados
    const saveChat = async (chatId: string, updatedMessages: Message[], title: string) => {
        // Usa o estado 'user' para garantir que temos o UID
        const uid = user?.uid;
        if (!uid || !chatId) return;

        try {
            console.log("saveChat: payload", { uid, chatId, title, messagesCount: updatedMessages.length });
            const resp = await fetch("/api/saveChat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid,
                    chatId,
                    messages: updatedMessages,
                    title
                })
            });
            console.log("saveChat: response status", resp.status);
        } catch (error) {
            console.error("Error saving chat:", error);
        }
    };

    // Função principal de envio
    const handleSend = async () => {
        // Usa o estado 'user' para verificação de login
        const uid = user?.uid;
        // Adiciona a verificação do UID aqui também, para impedir o envio antes do login
        if (!inputValue.trim() || isLoading || !uid) return;

        const userContent = inputValue;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: userContent,
            timestamp: new Date().toISOString()
        };

        let currentTitle = "";
        let newMessages: Message[] = [];

        // Se for o primeiro envio de um chat novo, vamos usar a mensagem do usuário como primeira mensagem
        // (assim o título da conversa será a primeira mensagem)
        if (!currentChatId && messages.length === 1 && messages[0].id === initialMessage.id) {
            newMessages = [userMessage];
        } else {
            // Caso contrário, continua a sequência normal
            newMessages = [...messages, userMessage];
        }

        setMessages(newMessages);
        setInputValue("");
        setIsLoading(true);

        let chatId: string | null = currentChatId;

        // 1. Criar novo chat se não existir
        if (!chatId) {
            currentTitle = userContent.substring(0, 30) + (userContent.length > 30 ? "..." : "");
            try {
                const newChat: ChatHistory = {
                    id: "", // Temporário
                    title: currentTitle,
                    timestamp: new Date().toISOString(),
                    messages: newMessages // Inclui as duas primeiras mensagens
                };

                const response = await fetch("/api/newChat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid, chat: newChat })
                });

                const data = await response.json();
                console.log("handleSend: /api/newChat returned", { status: response.status, data });
                if (response.ok && data.chatId) {
                    chatId = data.chatId;
                    setCurrentChatId(chatId);

                    if (chatId) {
                        const updatedChat: ChatHistory = { ...newChat, id: chatId };
                        // Adiciona o novo chat no topo do histórico
                        setChatHistory(prev => [updatedChat, ...prev.filter(c => c.id !== chatId)]);
                    }
                }
            } catch (error) {
                console.error("Error creating chat:", error);
            }
        } else {
            // Se o chat já existe, usa o título existente
            const existingChat = chatHistory.find(c => c.id === chatId);
            currentTitle = existingChat ? existingChat.title : userContent.substring(0, 30) + (userContent.length > 30 ? "..." : "");

            // Atualiza o histórico local com a mensagem do usuário (para otimismo na UI)
            setChatHistory(prev => prev.map(chat =>
                chat.id === chatId
                    ? { ...chat, messages: newMessages }
                    : chat
            ));
        }

        // 2. Chamar a API que gera o roteiro e exibir com animação de digitação
        try {
            const response = await fetch("/api/generateScript", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid, chatId, phrase: userContent })
            });

            const data = await response.json();

            const assistantContent: string = response.ok && data && (data.success || data.data)
                ? data.data ?? String(data)
                : "Desculpe, não consegui gerar o roteiro no momento.";

            // Adiciona uma mensagem do assistente vazia para iniciar a animação
            const assistantId = (Date.now() + 1).toString();
            const assistantPlaceholder: Message = {
                id: assistantId,
                role: "assistant",
                content: "",
                timestamp: new Date().toISOString()
            };

            const initialWithAssistant = [...newMessages, assistantPlaceholder];
            setMessages(initialWithAssistant);

            // Função que simula digitação caractere a caractere
            const typeWriter = async (fullText: string, speed = 270) => {
                for (let i = 0; i < fullText.length; i++) {
                    const next = fullText.slice(0, i + 1);
                    setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: next } : m));
                    await new Promise(res => setTimeout(res, speed));
                }
            };

            // Executa a digitação e depois salva o chat e atualiza histórico
            await typeWriter(assistantContent, 14);

            const finalAssistantMessage: Message = {
                id: assistantId,
                role: "assistant",
                content: assistantContent,
                timestamp: new Date().toISOString()
            };

            const updatedMessagesWithAssistant = [...newMessages, finalAssistantMessage];

            // 3. Salvar o chat atualizado com a resposta do assistente
            if (chatId) {
                await saveChat(chatId, updatedMessagesWithAssistant, currentTitle);

                // Atualizar histórico local com a resposta do assistente e a nova ordem (se necessário)
                setChatHistory(prev => {
                    const updatedChat: ChatHistory = {
                        id: chatId!,
                        title: currentTitle,
                        timestamp: new Date(),
                        messages: updatedMessagesWithAssistant
                    };
                    const filteredPrev = prev.filter(c => c.id !== chatId);
                    return [updatedChat, ...filteredPrev]; // Coloca o chat no topo
                });
            }

        } catch (error) {
            console.error("Error generating script:", error);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Desculpe, ocorreu um erro ao gerar o roteiro.",
                timestamp: new Date().toISOString()
            };

            const updatedMessagesWithAssistant = [...newMessages, assistantMessage];
            setMessages(updatedMessagesWithAssistant);

        } finally {
            setIsLoading(false);
        }
    };

    // Carregar chat a partir do query param ?chatId=... quando o usuário estiver autenticado
    const searchParams = useSearchParams();
    const loadChatById = async (chatId: string) => {
        const uid = user?.uid;
        if (!uid) return;

        try {
            console.log("loadChatById: fetching chat", { uid, chatId });
            const response = await fetch("/api/getChat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid, chatId })
            });
            const data = await response.json();
            console.log("loadChatById: response", { status: response.status, data });
            if (response.ok && data.chat) {
                const loadedChat = data.chat;
                const formattedMessages: Message[] = loadedChat.messages.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
                setMessages(formattedMessages);
                setCurrentChatId(chatId);
                // Se houver um parâmetro de prefill na URL, preenche o input para edição
                try {
                    const prefill = searchParams?.get?.('prefill');
                    if (prefill) {
                        console.log('loadChatById: prefill found', { prefill });
                        // Só preencher se o chat não tiver mensagens ou querermos permitir edição inicial
                        if (!formattedMessages || formattedMessages.length === 0) {
                            setInputValue(prefill);
                        }
                    }
                } catch (e) {
                    console.warn('loadChatById: error parsing prefill', e);
                }
            }
        } catch (error) {
            console.error('loadChatById error', error);
        }
    };

    useEffect(() => {
        const chatId = searchParams?.get?.('chatId');
        if (chatId && user) {
            loadChatById(chatId);
        }
    }, [searchParams, user]);

    // Efeito separado para preencher o input quando não há chatId
    useEffect(() => {
        const chatId = searchParams?.get?.('chatId');
        const prefill = searchParams?.get?.('prefill');

        // Apenas preencher se não houver chatId e houver prefill
        if (!chatId && prefill && user) {
            console.log('Prefilling input with:', prefill);
            setInputValue(prefill);
            // Focar no input para melhor UX
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [searchParams, user]);

    // Iniciar um novo chat
    const handleNewChat = async () => {
        // Usa o estado 'user' para verificação de login
        const uid = user?.uid;
        if (!uid) return;

        try {
            const newChat: ChatHistory = {
                id: "",
                title: "Nova Conversa",
                timestamp: new Date().toISOString(),
                messages: [initialMessage]
            };

            const response = await fetch("/api/newChat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid, chat: newChat })
            });

            const data = await response.json();
            if (response.ok && data.chatId) {
                setCurrentChatId(data.chatId);
                newChat.id = data.chatId;
                setChatHistory(prev => [newChat, ...prev]);
                setMessages([initialMessage]);
            }
        } catch (error) {
            console.error("Error creating new chat:", error);
            // Fallback: apenas resetar localmente
            setMessages([initialMessage]);
            setCurrentChatId(null);
        }
    };

    // Carregar um chat do histórico
    const handleLoadChat = async (chat: ChatHistory) => {
        // Usa o estado 'user' para verificação de login
        const uid = user?.uid;
        if (!uid) return;

        try {
            const response = await fetch("/api/getChat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid, chatId: chat.id })
            });

            const data = await response.json();
            if (response.ok && data.chat) {
                const loadedChat = data.chat;
                // Mapeia mensagens, garantindo que o timestamp seja um objeto Date para consistência de UI
                const formattedMessages: Message[] = loadedChat.messages.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
                setMessages(formattedMessages);
                setCurrentChatId(chat.id);
            } else {
                // Fallback: usar dados locais (já formatados para Date no fetchChatHistory)
                setMessages(chat.messages.map(msg => ({
                    ...msg,
                    timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
                })));
                setCurrentChatId(chat.id);
            }
        } catch (error) {
            console.error("Error loading chat:", error);
            // Fallback: usar dados locais
            setMessages(chat.messages.map(msg => ({
                ...msg,
                timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
            })));
            setCurrentChatId(chat.id);
        }
    };

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content);
        // Você pode adicionar um toast aqui
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* O estilo global CSS para ReactMarkdown foi mantido, mas com as tags ajustadas para JSX */}
            <style jsx global>{`
                .markdown-content h1, .markdown-content h2, .markdown-content h3 {
                    color: white;
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                }
                .markdown-content h1 {
                    font-size: 1.25rem;
                    font-weight: 700;
                }
                .markdown-content h2 {
                    font-size: 1.125rem;
                    font-weight: 600;
                }
                .markdown-content h3 {
                    font-size: 1rem;
                    font-weight: 600;
                }
                .markdown-content strong {
                    font-weight: 600;
                    color: white;
                }
                .markdown-content em {
                    font-style: italic;
                }
                .markdown-content code {
                    background-color: #1A1A1A;
                    padding: 0.125rem 0.375rem;
                    border-radius: 0.25rem;
                    font-size: 0.875rem;
                    font-family: monospace;
                }
                .markdown-content pre {
                    background-color: #1A1A1A;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    margin: 0.5rem 0;
                    overflow-x: auto;
                }
                .markdown-content pre code {
                    background-color: transparent;
                    padding: 0;
                }
                .markdown-content ul {
                    list-style-type: disc;
                    margin-left: 1.5rem;
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                .markdown-content li {
                    margin-bottom: 0.25rem;
                }
                .markdown-content a {
                    color: #5B9FFF;
                    text-decoration: underline;
                }
                .markdown-content a:hover {
                    color: #4DD4F7;
                }
                .markdown-content p {
                    margin-bottom: 0.5rem; /* Adicionado para p do markdown */
                }
            `}</style>
            <div className="flex h-screen bg-[#0F0F0F] text-white overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

                {/* Sidebar */}
                {/* Nota: Se o Sidebar precisar de estado global ou de usuário, considere passá-los como props. */}
                <Sidebar />

                <div className="flex flex-1 flex-col">
                    {/* Header */}
                    <div className="flex items-center px-6 py-4 border-b border-[#2A2A2A] bg-[#1A1A1A]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#8B6FFF] to-[#4DD4F7] rounded-lg flex items-center justify-center">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>
                                Gerador de Roteiros
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar de Histórico */}
                        <div className="w-80 border-r border-[#2A2A2A] bg-[#1A1A1A] flex flex-col">
                            <div className="p-4 border-b border-[#2A2A2A]">
                                <button
                                    onClick={handleNewChat}
                                    className="w-full py-2 px-4 bg-gradient-to-r from-[#4DD4F7] to-[#8B6FFF] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                    style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
                                    disabled={isLoading}
                                >
                                    <Plus size={18} />
                                    Nova Conversa
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="flex items-center gap-2 mb-4 text-[#888888] text-sm">
                                    <History size={16} />
                                    <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>Histórico</span>
                                </div>
                                {isLoadingHistory ? (
                                    <p className="text-[#4A4A4A] text-sm text-center py-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                        Carregando...
                                    </p>
                                ) : user === null ? (
                                    <p className="text-[#4A4A4A] text-sm text-center py-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                        Faça login para ver o histórico.
                                    </p>
                                ) : chatHistory.length === 0 ? (
                                    <p className="text-[#4A4A4A] text-sm text-center py-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                        Nenhuma conversa anterior
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {chatHistory.map((chat) => (
                                            <button
                                                key={chat.id}
                                                onClick={() => handleLoadChat(chat)}
                                                className={`w-full text-left p-3 rounded-lg transition-colors ${currentChatId === chat.id
                                                        ? "bg-[#2A2A2A] border border-[#5B9FFF]"
                                                        : "bg-[#2A2A2A] hover:bg-[#3A3A3A]"
                                                    }`}
                                                disabled={isLoading}
                                            >
                                                <p className="text-sm text-white font-medium mb-1 truncate" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>
                                                    {chat.title}
                                                </p>
                                                <p className="text-xs text-[#888888]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                                    {formatTimestamp(chat.timestamp)}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {message.role === "assistant" && (
                                            <div className="w-8 h-8 bg-gradient-to-r from-[#8B6FFF] to-[#4DD4F7] rounded-lg flex items-center justify-center shrink-0">
                                                <Bot size={16} className="text-white" />
                                            </div>
                                        )}

                                        <div className={`max-w-[80%] ${message.role === "user" ? "order-2" : ""}`}>
                                            <div className={`rounded-lg p-4 ${message.role === "assistant"
                                                    ? "bg-[#2A2A2A] text-white"
                                                    : "bg-gradient-to-r from-[#4DD4F7] to-[#8B6FFF] text-white"
                                                }`}>
                                                {message.role === "assistant" ? (
                                                    <div
                                                        className="text-sm leading-relaxed markdown-content"
                                                        style={{ fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.6 }}
                                                    >
                                                        <ReactMarkdown
                                                            components={{
                                                                // Removendo as definições de classes que já estão no CSS global para simplicidade, 
                                                                // mas mantendo a customização de componentes.
                                                                h1: ({ node, ...props }) => <h1 {...props} />,
                                                                h2: ({ node, ...props }) => <h2 {...props} />,
                                                                h3: ({ node, ...props }) => <h3 {...props} />,
                                                                strong: ({ node, ...props }) => <strong {...props} />,
                                                                em: ({ node, ...props }) => <em {...props} />,
                                                                code: ({ node, className, ...props }: any) => {
                                                                    const isInline = !className;
                                                                    return isInline ? (
                                                                        <code {...props} />
                                                                    ) : (
                                                                        <code className="block" {...props} />
                                                                    );
                                                                },
                                                                pre: ({ node, ...props }) => <pre {...props} />,
                                                                ul: ({ node, ...props }) => <ul {...props} />,
                                                                ol: ({ node, ...props }) => <ol className="list-decimal ml-6 my-2" {...props} />, // Adicionado ol
                                                                li: ({ node, ...props }) => <li {...props} />,
                                                                a: ({ node, ...props }) => <a {...props} />,
                                                                p: ({ node, ...props }) => <p {...props} />
                                                            }}
                                                        >
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.6 }}>
                                                        {message.content}
                                                    </p>
                                                )}
                                            </div>

                                            {message.role === "assistant" && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleCopy(message.content)}
                                                        className="p-1.5 text-[#888888] hover:text-white transition-colors"
                                                        aria-label="Copiar"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                    {/* Botões de feedback - Placeholder */}
                                                    <button
                                                        className="p-1.5 text-[#888888] hover:text-white transition-colors"
                                                        aria-label="Gostei"
                                                    >
                                                        <ThumbsUp size={14} />
                                                    </button>
                                                    <button
                                                        className="p-1.5 text-[#888888] hover:text-white transition-colors"
                                                        aria-label="Não gostei"
                                                    >
                                                        <ThumbsDown size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {message.role === "user" && (
                                            <div className="w-8 h-8 bg-[#2A2A2A] rounded-full flex items-center justify-center shrink-0 order-1">
                                                {/* Poderia usar a primeira letra do nome do usuário autenticado */}
                                                <span className="text-xs font-semibold text-white">U</span>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Loading state para a resposta do assistente */}
                                {isLoading && (
                                    <div className="flex gap-4 justify-start">
                                        <div className="w-8 h-8 bg-gradient-to-r from-[#8B6FFF] to-[#4DD4F7] rounded-lg flex items-center justify-center shrink-0">
                                            <Bot size={16} className="text-white" />
                                        </div>
                                        <div className="bg-[#2A2A2A] rounded-lg p-4">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-[#888888] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                                <div className="w-2 h-2 bg-[#888888] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                <div className="w-2 h-2 bg-[#888888] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="border-t border-[#2A2A2A] bg-[#1A1A1A] px-6 py-4">
                                <div className="max-w-4xl mx-auto">
                                    <div className="relative flex items-center gap-3">
                                        <div className="absolute left-4 text-[#888888]">
                                            <Bot size={18} />
                                        </div>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Descreva o vídeo ou post que você quer criar..."
                                            className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-12 py-3 text-white placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#5B9FFF] focus:border-[#5B9FFF] transition-all"
                                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                                            disabled={isLoading}
                                        />
                                        <button
                                            onClick={handleSend}
                                            disabled={!inputValue.trim() || isLoading}
                                            className="p-3 bg-gradient-to-r from-[#4DD4F7] to-[#8B6FFF] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                            aria-label="Enviar"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}