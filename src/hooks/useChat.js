import { useState, useRef, useCallback } from 'react';
import { MODEL } from '../constants/restaurant';
import { sendChatRequest } from '../services/chatService';

let _id = 0;
const uid = () => ++_id;

export function useChat() {
  const [messages, setMessages]       = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isBusy, setIsBusy]           = useState(false);
  const [booking, setBooking]         = useState(null);
  const historyRef                    = useRef([]);

  //Helpers
  const formatText = (t) =>
    t
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');

  const parseSuggestions = (text) => {
    const idx = text.lastIndexOf('SUGGESTIONS:');
    if (idx === -1) return { displayText: text.trim(), chips: [] };
    const displayText = text.slice(0, idx).trim();
    const jsonPart    = text.slice(idx + 12).trim();
    const end         = jsonPart.indexOf(']');
    try {
      const arr = JSON.parse(end !== -1 ? jsonPart.slice(0, end + 1) : jsonPart);
      if (Array.isArray(arr)) return { displayText, chips: arr };
    } catch {}
    return { displayText, chips: [] };
  };

  // Date context — injected into every request so the AI knows today's date
  const getDateContext = () => {
    const now = new Date();
    const day  = now.toLocaleDateString('en-US', { weekday: 'long' });
    const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    return `[Context: Today is ${day}, ${date}]`;
  };

  //Message state helpers
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

  //Greeting
  const greet = useCallback(() => {
    addBotMessage(
      formatText(
        "Welcome to **Le Petit Bistrot**! I'm here to help you with reservations, menu questions, or anything else about our restaurant. Comment puis-je vous aider? 🥐"
      )
    );
    setSuggestions([
      '🍽️ Book a table',
      '🥗 View menu highlights',
      '🕐 Opening hours',
      '📍 Where are you located?',
    ]);
  }, [addBotMessage]);

  //Fallback suggestions
  const fetchFallbackSuggestions = useCallback(async (lastReply) => {
    try {
      const res = await sendChatRequest({
          model: MODEL,
          max_tokens: 80,
          stream: false,
          system: 'You generate quick-reply chips for a restaurant chatbot. Output ONLY a JSON array of 2–4 short strings (max 38 chars each, with emoji). No explanation, no markdown, no backticks.',
          messages: [
            {
              role:    'user',
              content: `The assistant just said: "${lastReply}"\nGenerate follow-up suggestion chips.`,
            },
          ],
        }
      );
      const data = await res.json();
      const raw  = data.content?.[0]?.text?.trim() || '[]';
      const arr  = JSON.parse(raw.replace(/```json|```/g, '').trim());
      if (Array.isArray(arr) && arr.length) setSuggestions(arr);
    } catch {}
  }, []);

  //Send message
  const send = useCallback(
    async (userText) => {
      if (isBusy || !userText.trim()) return;

      setSuggestions([]);
      setMessages((prev) => [...prev, { id: uid(), role: 'user', html: userText }]);
      historyRef.current.push({ role: 'user', content: userText });
      setIsBusy(true);

      const typingId = uid();
      setMessages((prev) => [...prev, { id: typingId, role: 'typing' }]);

      try {
        const messagesWithDate = [
          { role: 'user',      content: getDateContext() },
          { role: 'assistant', content: 'Understood, I have noted today\'s date.' },
          ...historyRef.current,
        ];

        const res = await sendChatRequest({
          model: MODEL,
          max_tokens: 600,
          stream: true,
          messages: messagesWithDate,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${res.status}`);
        }

        // ── Streaming SSE ────────────────────────────────────────────────────
        setMessages((prev) => prev.filter((m) => m.id !== typingId));
        const streamId = uid();
        setMessages((prev) => [
          ...prev,
          { id: streamId, role: 'bot', html: '', isStreaming: true },
        ]);

        let fullText = '';
        const reader  = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const lines = decoder
            .decode(value)
            .split('\n')
            .filter((l) => l.startsWith('data: '));

          for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const delta =
                parsed.type === 'content_block_delta' &&
                parsed.delta?.type === 'text_delta'
                  ? parsed.delta.text
                  : '';

              if (delta) {
                fullText += delta;
                const visible = fullText.includes('SUGGESTIONS:')
                  ? fullText.slice(0, fullText.lastIndexOf('SUGGESTIONS:')).trim()
                  : fullText.includes('BOOKING_CONFIRMED:')
                  ? fullText.slice(0, fullText.lastIndexOf('BOOKING_CONFIRMED:')).trim()
                  : fullText;
                updateBotMessage(streamId, formatText(visible), true);
              }
            } catch {}
          }
        }

        updateBotMessage(streamId, '', false);

        // ── Cek booking ──────────────────────────────────────────────────────
        if (fullText.includes('BOOKING_CONFIRMED:')) {
          removeBotMessage(streamId);
          const raw = fullText.split('BOOKING_CONFIRMED:')[1].trim();
          try {
            const bookingData = JSON.parse(raw);
            historyRef.current.push({
              role:    'assistant',
              content: "I've confirmed your reservation — à bientôt!",
            });
            setBooking(bookingData);
          } catch (e) {
            console.error('❌ Booking parse failed:', e, '\nRaw:', raw);
            addBotMessage(
              formatText("Your reservation has been noted! We'll be in touch to confirm. 🥐")
            );
          }
          return;
        }

        // ── Parse suggestions ────────────────────────────────────────────────
        const { displayText, chips } = parseSuggestions(fullText);
        updateBotMessage(streamId, formatText(displayText), false);
        historyRef.current.push({ role: 'assistant', content: displayText });

        if (chips.length > 0) {
          setSuggestions(chips);
        } else {
          fetchFallbackSuggestions(displayText);
        }
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== typingId));
        addBotMessage(`⚠️ Something went wrong: ${err.message}`);
      } finally {
        setIsBusy(false);
      }
    },
    [isBusy, addBotMessage, updateBotMessage, removeBotMessage, fetchFallbackSuggestions]
  );

  //Post-booking actions
  const resetAfterBooking = useCallback(() => {
    setBooking(null);
    addBotMessage(
      formatText(
        "Wonderful! We can't wait to welcome you to **Le Petit Bistrot**. 🥐 Is there anything else I can help with — dietary needs, the menu, or directions?"
      )
    );
    setSuggestions([
      '🥗 Dietary options',
      '🚇 Metro & directions',
      '🍷 Tell me about the wine list',
      '🎂 Birthday arrangements',
    ]);
  }, [addBotMessage]);

  const modifyBooking = useCallback(() => {
    setBooking(null);
    historyRef.current = [];
    addBotMessage(
      formatText("No problem at all! Let's start fresh. What would you like to change?")
    );
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