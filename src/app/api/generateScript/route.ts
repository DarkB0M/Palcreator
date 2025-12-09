import { NextResponse } from "next/server";
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export async function POST(request: Request) {
  try {
    const { uid,chatId,phrase } = await request.json();
    console.log("/api/generateScript: received body", { uid, chatId, phrase });
    let messagesArray: any[] = [];

    // Tenta obter o chat via chamada interna ao backend configurado (NEXT_PUBLIC_API_URL)
    // Caso a variável não esteja definida (ex.: dev), busca diretamente no Firebase.
    if (process.env.NEXT_PUBLIC_API_URL) {
      const messages = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/getChat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid, chatId })
      });
      const responseMessages = await messages.json();
      console.log("/api/generateScript: fetched chat from backend", { status: messages.status, responseMessages });
      messagesArray = responseMessages?.chat?.messages ?? responseMessages?.messages ?? [];
    } else {
      console.log('/api/generateScript: NEXT_PUBLIC_API_URL not set, reading chat directly from Firebase');
      const userRef = ref(database, `users/${uid}/chats/${chatId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const chat = snapshot.val();
        console.log('/api/generateScript: loaded chat from firebase', { messagesCount: chat?.messages?.length });
        messagesArray = chat?.messages ?? [];
      } else {
        console.warn('/api/generateScript: chat not found in firebase', { uid, chatId });
        messagesArray = [];
      }
    }
    const systemPrompt = `
    You are a helpful assistant that generates a script for a video based on a phrase.
    The script should be in the following format:
    - Title: The title of the video
    - Introduction: The introduction of the video
    - Development: The development of the video
    - Conclusion: The conclusion of the video
    `;
    const openrouterPayload = {
      model: "kwaipilot/kat-coder-pro:free",
      messages: [
        ...messagesArray,
        { role: "user", content: phrase }
      ]
    };
    console.log("/api/generateScript: calling OpenRouter", { openrouterPayload });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(openrouterPayload),
    });
    const data = await response.json();
    console.log("/api/generateScript: OpenRouter response", { status: response.status, data });
    const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? JSON.stringify(data);
    console.log("/api/generateScript: returning content", { contentSnippet: String(content).slice(0, 200) });
    return NextResponse.json({ success: true, data: content }, { status: 200 });
  } catch (error) {
    console.error('/api/generateScript error', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
