import { useState, useRef, useCallback } from 'react';
import { GEMINI_MODEL, geminiUrl, SYSTEM_PROMPT } from '../constants/gemini';

// ─── Gemini API format notes ──────────────────────────────────────────────────
// • Tidak ada field "system" di top-level — system prompt masuk sebagai
//   "systemInstruction": { parts: [{ text: "..." }] }
// • History memakai { role: "user"|"model", parts: [{ text }] }  (bukan "assistant")
// • Streaming: endpoint streamGenerateContent, response berupa newline-delimited JSON
// ─────────────────────────────────────────────────────────────────────────────

let _id = 0;
const uid = () => ++_id;

export function useChat(apiKey) {
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isBusy, setIsBusy] = useState(false);
  const [booking, setBooking] = useState(null);
  const historyRef = useRef([]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const formatText = (t) =>
    t
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');

  const parseSuggestions = (text) => {
    const idx = text.lastIndexOf('SUGGESTIONS:');
    if (idx === -1) return { displayText: text.trim(), chips: [] };
    const displayText = text.slice(0, idx).trim();
    const jsonPart = text.slice(idx + 12).trim();
    const end = jsonPart.indexOf(']');
    try {
      const arr = JSON.parse(end !== -1 ? jsonPart.slice(0, end + 1) : jsonPart);
      if (Array.isArray(arr)) return { displayText, chips: arr };
    } catch {}
    return { displayText, chips: [] };
  };

  // ── Message state helpers ──────────────────────────────────────────────────

  const addBotMessage = useCallback((html, isStreaming = false) => {
    const id = uid();
    setMessages((prev) => [...prev, { id, role: 'bot', html, isStreaming }]);
    return id;
  }, []);

  const updateBotMessage = useCallback((id, html, isStreaming = false) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, html, isStreaming } : m))
    );
  }, []);

  const removeBotMessage = useCallback((id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // ── Greeting ───────────────────────────────────────────────────────────────

  const greet = useCallback(() => {
    addBotMessage(
      formatText("Welcome to **The Olive Tree**! I'm here to help you with reservations, menu questions, or anything else about our restaurant. How can I help you today?")
    );
    setSuggestions(['🍽️ Book a table', '🥗 View menu highlights', '🕐 Opening hours', '📍 Where are you located?']);
  }, [addBotMessage]);

  // ── Fallback suggestion chips (non-streaming Gemini call) ──────────────────

  const fetchFallbackSuggestions = useCallback(async (lastReply) => {
    try {
      const url = geminiUrl(apiKey, false); // generateContent
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: 'You generate quick-reply chips for a restaurant chatbot. Output ONLY a JSON array of 2–4 short strings (max 38 chars each, with emoji). No explanation, no markdown.' }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: `The assistant just said: "${lastReply}"\nGenerate follow-up suggestion chips.` }],
            },
          ],
          generationConfig: { maxOutputTokens: 80, temperature: 0.8 },
        }),
      });
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '[]';
      const arr = JSON.parse(raw.replace(/```json|```/g, '').trim());
      if (Array.isArray(arr) && arr.length) setSuggestions(arr);
    } catch {}
  }, [apiKey]);

  // ── Main send ──────────────────────────────────────────────────────────────

  const send = useCallback(async (userText) => {
    if (isBusy || !userText.trim()) return;

    setSuggestions([]);
    setMessages((prev) => [...prev, { id: uid(), role: 'user', html: userText }]);

    // Tambahkan pesan user ke history Gemini
    historyRef.current.push({ role: 'user', parts: [{ text: userText }] });
    setIsBusy(true);

    // Typing indicator
    const typingId = uid();
    setMessages((prev) => [...prev, { id: typingId, role: 'typing' }]);

    try {
      // ── Streaming request ke Gemini ──────────────────────────────────────
      const url = geminiUrl(apiKey, true); // streamGenerateContent
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // System prompt masuk sebagai systemInstruction (bukan di contents)
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          // History lengkap (termasuk pesan user terbaru yang baru saja dipush)
          contents: historyRef.current,
          generationConfig: {
            maxOutputTokens: 600,
            temperature: 0.7,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.error?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      // Hapus typing, tampilkan streaming message
      setMessages((prev) => prev.filter((m) => m.id !== typingId));
      const streamId = uid();
      setMessages((prev) => [...prev, { id: streamId, role: 'bot', html: '', isStreaming: true }]);

      let fullText = '';
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // ── Gemini streaming: newline-delimited JSON chunks ──────────────────
      // Setiap chunk bisa berupa sebagian JSON; kita buffer lalu parse baris per baris.
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Gemini mengirim array JSON besar yang dibuka "[" dan tiap chunk dipisah koma.
        // Strategi: ekstrak semua objek JSON lengkap dari buffer dengan memeriksa tiap
        // substring yang diawali '{' dan valid JSON.
        let startIdx = 0;
        while (startIdx < buffer.length) {
          const objStart = buffer.indexOf('{', startIdx);
          if (objStart === -1) break;

          // Coba temukan objek JSON lengkap menggunakan depth counter
          let depth = 0;
          let inString = false;
          let escape = false;
          let objEnd = -1;

          for (let i = objStart; i < buffer.length; i++) {
            const ch = buffer[i];
            if (escape) { escape = false; continue; }
            if (ch === '\\' && inString) { escape = true; continue; }
            if (ch === '"') { inString = !inString; continue; }
            if (inString) continue;
            if (ch === '{') depth++;
            else if (ch === '}') {
              depth--;
              if (depth === 0) { objEnd = i; break; }
            }
          }

          if (objEnd === -1) break; // Belum lengkap, tunggu chunk berikutnya

          const jsonStr = buffer.slice(objStart, objEnd + 1);
          startIdx = objEnd + 1;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
            fullText += delta;

            // Sembunyikan marker saat streaming
            const visible = fullText.includes('SUGGESTIONS:')
              ? fullText.slice(0, fullText.lastIndexOf('SUGGESTIONS:')).trim()
              : fullText.includes('BOOKING_CONFIRMED:')
              ? fullText.slice(0, fullText.lastIndexOf('BOOKING_CONFIRMED:')).trim()
              : fullText;

            updateBotMessage(streamId, formatText(visible), true);
          } catch {
            // Chunk tidak valid JSON — skip
          }
        }

        // Buang bagian buffer yang sudah diproses
        if (startIdx > 0) {
          buffer = buffer.slice(startIdx);
        }
      }

      // ── Finalisasi streaming ─────────────────────────────────────────────
      updateBotMessage(streamId, '', false);

      // ── Booking trigger ──────────────────────────────────────────────────
      if (fullText.includes('BOOKING_CONFIRMED:')) {
        removeBotMessage(streamId);
        const raw = fullText.split('BOOKING_CONFIRMED:')[1].trim();
        try {
          const bookingData = JSON.parse(raw);
          historyRef.current.push({
            role: 'model',
            parts: [{ text: "I've confirmed your reservation — see you soon!" }],
          });
          setBooking(bookingData);
        } catch (e) {
          console.error('❌ Booking parse failed:', e, '\nRaw:', raw);
          addBotMessage(formatText("Your reservation has been noted! We'll be in touch to confirm. 🫒"));
        }
        return;
      }

      // ── Suggestions + finalize ───────────────────────────────────────────
      const { displayText, chips } = parseSuggestions(fullText);
      updateBotMessage(streamId, formatText(displayText), false);

      // Simpan respons model ke history Gemini (role: 'model', bukan 'assistant')
      historyRef.current.push({ role: 'model', parts: [{ text: displayText }] });

      if (chips.length > 0) {
        setSuggestions(chips);
      } else {
        fetchFallbackSuggestions(displayText);
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== typingId));
      const isAuthErr =
        err.message.includes('401') ||
        err.message.includes('403') ||
        err.message.includes('API_KEY');
      addBotMessage(
        isAuthErr
          ? '🔑 Looks like the Gemini API key is invalid. Please update it.'
          : `⚠️ Something went wrong: ${err.message}`
      );
      if (isAuthErr) return 'AUTH_ERROR';
    } finally {
      setIsBusy(false);
    }
  }, [isBusy, apiKey, addBotMessage, updateBotMessage, removeBotMessage, fetchFallbackSuggestions]);

  // ── Post-booking helpers ───────────────────────────────────────────────────

  const resetAfterBooking = useCallback(() => {
    setBooking(null);
    addBotMessage(
      formatText("Wonderful! We can't wait to welcome you to The Olive Tree. 🫒 Is there anything else I can help with — dietary needs, the menu, or directions?")
    );
    setSuggestions(['🥗 Dietary options', '🚗 Parking & directions', '🍷 Tell me about the wine list']);
  }, [addBotMessage]);

  const modifyBooking = useCallback(() => {
    setBooking(null);
    historyRef.current = [];
    addBotMessage(formatText("No problem at all! Let's start fresh. What would you like to change?"));
    setSuggestions(['Different date', 'Different time', 'More guests']);
  }, [addBotMessage]);

  return {
    messages,
    suggestions,
    setSuggestions,
    isBusy,
    booking,
    greet,
    send,
    resetAfterBooking,
    modifyBooking,
  };
}
