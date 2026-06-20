import { useState, useRef, useCallback } from 'react';
import { MODEL } from '../constants/restaurant';
import { sendChatRequest } from '../services/chatService';

let _id = 0;
const uid = () => ++_id;

// Required fields that must all exist before showing booking confirmation
const REQUIRED_BOOKING_FIELDS = ['name', 'phone', 'date', 'time', 'guests'];

export function useChat() {
  const [messages, setMessages]       = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isBusy, setIsBusy]           = useState(false);
  const [booking, setBooking]         = useState(null);
  const historyRef                    = useRef([]);

  // Helpers
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

  /**
   * FIX #1: Robust BOOKING_CONFIRMED extraction.
   * Handles edge cases:
   *   - Text appearing before the token (AI added a summary)
   *   - SUGGESTIONS appended after the JSON
   *   - Multi-line responses where JSON is on its own line
   */
  const extractBookingConfirmed = (fullText) => {
    const TOKEN = 'BOOKING_CONFIRMED:';
    const tokenIdx = fullText.indexOf(TOKEN);
    if (tokenIdx === -1) return null;

    // Grab everything after the token
    let raw = fullText.slice(tokenIdx + TOKEN.length).trim();

    // Strip any SUGGESTIONS that might have been appended after the JSON
    const suggestionsIdx = raw.indexOf('SUGGESTIONS:');
    if (suggestionsIdx !== -1) {
      raw = raw.slice(0, suggestionsIdx).trim();
    }

    // Find the JSON object boundaries to isolate it
    const jsonStart = raw.indexOf('{');
    const jsonEnd   = raw.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return null;

    const jsonStr = raw.slice(jsonStart, jsonEnd + 1);

    try {
      const data = JSON.parse(jsonStr);

      // FIX #2: Validate all required fields are present and non-empty
      const missingFields = REQUIRED_BOOKING_FIELDS.filter(
        (f) => !data[f] || String(data[f]).trim() === ''
      );
      if (missingFields.length > 0) {
        console.warn('⚠️ BOOKING_CONFIRMED parsed but missing fields:', missingFields, data);
        return null; // Treat as incomplete — let conversation continue
      }

      // Normalize guests to a number
      data.guests = Number(data.guests);

      return data;
    } catch (e) {
      console.error('❌ Booking JSON parse failed:', e, '\nRaw JSON string:', jsonStr);
      return null;
    }
  };

  // Build a human-readable confirmation summary from booking data,
  // e.g. "Great, your table for 2 on Saturday 20 June at 8:00pm has been reserved. See you soon!"
  const formatBookingSummary = (data) => {
    if (!data) return null;

    const guests = Number(data.guests);
    const partySize = Number.isFinite(guests)
      ? `table for ${guests} ${guests === 1 ? 'guest' : 'guests'}`
      : 'table';

    let dateLabel = data.date || '';
    const parsedDate = data.date ? new Date(data.date) : null;
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      const weekday = parsedDate.toLocaleDateString('en-US', { weekday: 'long' });
      const dayMonth = parsedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
      dateLabel = `${weekday} ${dayMonth}`;
    }

    let timeLabel = data.time || '';
    if (timeLabel) {
      const match = timeLabel.match(/^(\d{1,2}):(\d{2})$/);
      if (match) {
        let [, h, m] = match;
        h = Number(h);
        const suffix = h >= 12 ? 'pm' : 'am';
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        timeLabel = `${hour12}:${m}${suffix}`;
      }
    }

    const whenParts = [dateLabel, timeLabel ? `at ${timeLabel}` : ''].filter(Boolean).join(' ');

    return `Great, your ${partySize}${whenParts ? ` on ${whenParts}` : ''} has been reserved${
      data.name ? `, ${data.name}` : ''
    }. See you soon!`;
  };

  // Date context — injected into every request so the AI knows today's date
  const getDateContext = () => {
    const now  = new Date();
    const day  = now.toLocaleDateString('en-US', { weekday: 'long' });
    const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    return `[Context: Today is ${day}, ${date}]`;
  };

  // Message state helpers
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

  // Greeting
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

  // Fallback suggestions
  const fetchFallbackSuggestions = useCallback(async (lastReply) => {
    try {
      const res = await sendChatRequest({
        max_tokens: 80,
        stream:     false,
        system:     'You generate quick-reply chips for a restaurant chatbot. Output ONLY a JSON array of 2–4 short strings (max 38 chars each, with emoji). No explanation, no markdown, no backticks.',
        messages: [
          {
            role:    'user',
            content: `The assistant just said: "${lastReply}"\nGenerate follow-up suggestion chips.`,
          },
        ],
      });
      const data = await res.json();
      const raw  = data.content?.[0]?.text?.trim() || '[]';
      const arr  = JSON.parse(raw.replace(/```json|```/g, '').trim());
      if (Array.isArray(arr) && arr.length) setSuggestions(arr);
    } catch {}
  }, []);

  // Send message
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
          { role: 'assistant', content: "Understood, I have noted today's date." },
          ...historyRef.current,
        ];

        const res = await sendChatRequest({
          max_tokens: 600,
          stream:     true,
          messages:   messagesWithDate,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${res.status}`);
        }

        // Streaming SSE
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
                // Hide internal tokens from visible chat during streaming
                const visible = fullText.includes('BOOKING_CONFIRMED:')
                  ? fullText.slice(0, fullText.indexOf('BOOKING_CONFIRMED:')).trim()
                  : fullText.includes('SUGGESTIONS:')
                  ? fullText.slice(0, fullText.lastIndexOf('SUGGESTIONS:')).trim()
                  : fullText;
                updateBotMessage(streamId, formatText(visible), true);
              }
            } catch {}
          }
        }

        updateBotMessage(streamId, '', false);

        // FIX #3: Use robust extractor instead of simple string split
        const bookingData = extractBookingConfirmed(fullText);

        if (bookingData) {
          // Valid, complete booking confirmed
          removeBotMessage(streamId);
          historyRef.current.push({
            role:    'assistant',
            content: "I've confirmed your reservation — à bientôt!",
          });
          setBooking(bookingData);
          return;
        }

        // Check if token was present but parsing failed (incomplete data)
        if (fullText.includes('BOOKING_CONFIRMED:')) {
          // AI fired the token too early — detect which fields are actually missing
          console.warn('⚠️ BOOKING_CONFIRMED detected but data incomplete, recovering...');
          removeBotMessage(streamId);

          // Try to parse what we have to give a helpful recovery hint
          let missingHint = 'a few details';
          try {
            const raw = fullText.slice(fullText.indexOf('BOOKING_CONFIRMED:') + 18).trim();
            const jsonStr = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
            const partial = JSON.parse(jsonStr);
            const fieldLabels = { name: 'your full name', phone: 'your phone number', date: 'the date', time: 'the time', guests: 'the number of guests' };
            const missing = REQUIRED_BOOKING_FIELDS.filter(f => !partial[f] || String(partial[f]).trim() === '');
            if (missing.length > 0) missingHint = missing.map(f => fieldLabels[f]).join(' and ');
          } catch {}

          addBotMessage(
            formatText(`Almost there! Could you just confirm **${missingHint}** so I can finalise your reservation? 🥐`)
          );
          return;
        }

        // Normal reply — parse suggestions
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

  // Post-booking actions
  const resetAfterBooking = useCallback(() => {
    setBooking((current) => {
      const summary = formatBookingSummary(current);

      addBotMessage(
        formatText(
          summary
            ? `${summary} We can't wait to welcome you to **Le Petit Bistrot**. 🥐`
            : "Wonderful! We can't wait to welcome you to **Le Petit Bistrot**. 🥐"
        )
      );

      return null;
    });

    setSuggestions([]);
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