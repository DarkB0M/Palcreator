import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase'; // Assumindo que 'database' é a instância do Firebase Realtime Database
import { get, ref, update } from 'firebase/database'; // Funções corretas para buscar dados no Realtime Database

/**
 * Endpoint para gerar um calendário baseado nas preferências do usuário.
 * A busca de dados é feita no Firebase Realtime Database.
 */
export async function POST(request: NextRequest) {
    try {
        const { uid } = await request.json();

        if (!uid) {
            console.error('Erro 400: UID não fornecido na requisição.');
            return NextResponse.json({ error: 'UID is required' }, { status: 400 });
        }

        // 1. Busca no Realtime Database (RTDB)
        // Certifique-se de que o dado do usuário existe exatamente neste caminho no seu RTDB.
        const userRef = ref(database, `users/${uid}`);
        const userDoc = await get(userRef);

        // **PONTO CRÍTICO DE DEBUG: VERIFIQUE O CONSOLE DO SEU SERVIDOR**
        // Se retornar 'false', o caminho do dado está errado ou as regras de segurança estão bloqueando.
        console.log(`Verificação RTDB para UID ${uid}: userDoc.exists() = ${userDoc.exists()}`);

        if (!userDoc.exists()) {
            console.warn(`Erro 404: Usuário não encontrado no caminho 'users/${uid}' do Realtime Database.`);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Extração e formatação das preferências
        const userPreferences = userDoc.val();
        // Garantindo que a string de preferências seja formatada corretamente
        const preferencesString = JSON.stringify(userPreferences);

        const systemPrompt = `
        Você é um gerador de calendário altamente estruturado.
        SIGA AS PREFERENCIAS ABAIXO PARA CRIAR UM CALENDÁRIO DETALHADO PARA UM USUÁRIO.
        Preferências do usuário: ${preferencesString}
        
        Sua tarefa é criar um calendário de pelo menos **duas semanas completas**, usando SOMENTE o formato informado no schema (WeekColumn → EventData[]).
        SIGA o DIA De HOJE:${new Date().toLocaleDateString()}
        Tipos:
        - EventData: { id: number; title: string; time: string; color: "red" | "blue" | "sky" | "lime"; height: string }
        - WeekColumn: { day: string; events: EventData[] }
        
        Regras obrigatórias:
        - O resultado deve seguir EXATAMENTE o schema.
        - 7 dias por semana.
        - 1 a 3 eventos por dia.
        - Alturas válidas: "h-24", "h-32", "h-36", "h-40", "h-48".
        - Sempre gerar ao menos 2 semanas.
        - No final incluir: "expires": "YYYY-MM-DD"
        
        Nunca gere texto fora do JSON final.
        `;
        console.log('System Prompt para LLM:', systemPrompt);

        // 3. Chamada à LLM (OpenRouter)
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Calendar Generator SaaS"
            },
            body: JSON.stringify({
                model: "kwaipilot/kat-coder-pro:free",
                messages: [
                    { role: "system", content: systemPrompt },
                ],
                tools: [
                    {
                        type: "function",
                        function: {
                            name: "generate_calendar",
                            description: "Gera calendário no formato WeekColumn[] + expires",
                            parameters: {
                                type: "object",
                                properties: {
                                    weeks: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                day: { type: "string" },
                                                events: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: { type: "number" },
                                                            title: { type: "string" },
                                                            time: { type: "string" },
                                                            color: {
                                                                type: "string",
                                                                enum: ["red", "blue", "sky", "lime"]
                                                            },
                                                            height: { type: "string" }
                                                        },
                                                        required: ["id", "title", "time", "color", "height"]
                                                    }
                                                }
                                            },
                                            required: ["day", "events"]
                                        }
                                    },
                                    expires: { type: "string" }
                                },
                                required: ["weeks", "expires"]
                            }
                        }
                    }
                ]
            })
        });

        const data = await response.json();
        // Adicionando encadeamento opcional para evitar erros de acesso a propriedades aninhadas
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

        // 4. Verificação da resposta do LLM
        if (!toolCall || toolCall.function.name !== 'generate_calendar') {
            // Loga a resposta completa do LLM para depuração
            console.error('LLM Error: Resposta sem chamada de função esperada.', data);
            return NextResponse.json({ error: 'Failed to generate calendar via LLM. Check server logs.' }, { status: 500 });
        }

        const calendario = JSON.parse(toolCall.function.arguments);
        console.log('Calendário gerado pela LLM:', calendario);
        const weeks = calendario.weeks;
        const dataToSave = {
            calendar: weeks,
            calendarExpires: calendario.expires
        };
        await update(userRef, dataToSave);
        return NextResponse.json({ message: 'Calendar generated and saved successfully' }, { status: 200 });
    }

    catch (error) {
        // Registra o erro detalhado no console do servidor para fins de depuração.
        console.error('Internal Server Error ao processar requisição:', error);
        return NextResponse.json({ error: 'Internal server error. Check server logs.' }, { status: 500 });
    }
}