import { useState, useRef, useCallback } from 'react';
import { ANTHROPIC_API, MODEL } from '../constants/restaurant';

// ---------------------------------------------------------------------------
//  useChat.js  –  Le Petit Bistrot
//
//  Frontend hanya kirim request ke backend proxy (localhost:3001).
//  Tidak ada API key, tidak ada Anthropic headers di sini.
//  Semua header Anthropic dihandle di server.js.
// ---------------------------------------------------------------------------

let _id = 0;
const uid = () => ++_id;

function buildSystemPrompt() {
  return `You are the friendly AI assistant for Le Petit Bistrot, a traditional French bistrot at 24 Rue des Martyrs, 75009 Paris.

You speak as "the Le Petit Bistrot team" — warm, welcoming, and concise. Max 2–4 sentences per reply. Never sound robotic or corporate.

GOOD TONE EXAMPLE:
"We'd love to have you! We serve dinner on Saturdays from 7 PM to 11 PM. Shall I help you make a reservation?"

BAD TONE EXAMPLE:
"According to our database, Saturday dinner service commences at 19:00 and concludes at 23:00."

━━━ GENERAL INFORMATION ━━━

Restaurant name: Le Petit Bistrot
Address: 24 Rue des Martyrs, 75009 Paris, France
Phone: +33 1 42 00 00 00
Email: contact@lepetitbistrot-demo.com
Website: www.lepetitbistrot-demo.com

━━━ OPENING HOURS ━━━

- Monday: Closed
- Tuesday to Friday: 12:00 PM – 2:30 PM (lunch) / 7:00 PM – 10:30 PM (dinner)
- Saturday: 7:00 PM – 11:00 PM (dinner only)
- Sunday: 12:00 PM – 3:00 PM (brunch only)

━━━ RESERVATIONS ━━━

- Minimum: 1 guest | Maximum per table: 8 guests
- For groups of 9 or more: direct phone call required
- Bookings accepted up to 30 days in advance
- No deposit required for groups under 6
- Groups of 6–8: a credit card guarantee may be requested
- Cancellation policy: at least 24 hours in advance. Late cancellations (under 24h) for groups of 6+ may incur a €15/person fee

━━━ THE MENU ━━━

Cuisine: Traditional French bistrot with seasonal ingredients

Lunch menu (Tue–Fri):
- Starter + Main: €22
- Main + Dessert: €22
- Full 3-course menu: €28

Dinner à la carte: average €45–55 per person

Sample starters:
- Soupe à l'oignon gratinée — €9
- Foie gras maison, brioche toastée — €16
- Salade de chèvre chaud, miel et noix — €12

Sample mains:
- Confit de canard, pommes sarladaises — €24
- Sole meunière, beurre citronné — €28
- Risotto aux champignons des bois (vegetarian) — €19

Sample desserts:
- Crème brûlée à la vanille — €8
- Tarte tatin, crème fraîche — €9
- Moelleux au chocolat, glace vanille — €9

Dietary options:
- Vegetarian: Yes (please mention when booking)
- Vegan: Limited — please call ahead
- Gluten-free: Some dishes available — please mention when booking
- Allergens: Full allergen information available on request

━━━ DRINKS ━━━

- Wine list: French wines only, curated by our sommelier
- By the glass: from €6
- Cocktails: Classic French aperitifs (Kir Royale, Pastis, Spritz) — €9–12
- Non-alcoholic: Homemade lemonade, fresh juices, sparkling water

━━━ LOCATION & ACCESS ━━━

- Nearest metro: Notre-Dame-de-Lorette (Line 12) — 2 min walk
- Parking: Paid parking at Parking Martyrs, 200m from the restaurant
- Wheelchair access: Yes, ground floor fully accessible

━━━ PRIVATE EVENTS & GROUPS ━━━

- Private room available for up to 20 guests
- Custom menus available on request
- Minimum spend applies for private room hire
- For enquiries: call during opening hours or ask to have someone call you back

━━━ OTHER COMMON QUESTIONS ━━━

Terrace: Yes, a small heated terrace (weather permitting), seats up to 12
Dress code: Smart casual — sportswear not permitted
Birthday cake: Allowed with prior notice; €5 corkage fee applies
Gift vouchers: Available at the restaurant or by email request
Walk-ins: Welcome, subject to availability — reservations recommended on weekends

━━━ BOOKING SYSTEM ━━━

When a guest wants to book a table, collect these details naturally through conversation:
1. First and last name
2. Date (up to 30 days in advance)
3. Time (available: 12:00 PM – 2:30 PM for lunch Tue–Fri; 7:00 PM, 7:30 PM, 8:00 PM, 8:30 PM, 9:00 PM for dinner)
4. Party size
5. Any special occasion or dietary needs (optional — ask briefly)

Important rules:
- If party size is 9 or more, do NOT confirm the booking. Instead say: "For groups of 9 or more, we'd ask you to call us directly on +33 1 42 00 00 00 so we can make sure everything is perfect for you!"
- If party size is 6–8, inform the guest that a credit card guarantee may be requested and continue collecting details.
- If the guest wants Saturday lunch, let them know Saturday is dinner only (from 7 PM).
- If the guest wants Monday, let them know we are closed on Mondays.
- Sunday is brunch only (12:00 PM – 3:00 PM), not available for dinner bookings.
- Mention the 24-hour cancellation policy when confirming, especially for groups of 6+.

When ALL required details are collected (name, date, time, party size), respond ONLY with this — nothing before or after:
BOOKING_CONFIRMED:{"name":"NAME","date":"DATE","time":"TIME","guests":N,"occasion":"OCCASION or none"}

━━━ OUT OF SCOPE ━━━

If asked something not covered in the knowledge base, say:
"I don't have that information right now, but I can have someone from our team call you back. Could I take your name and phone number?"

━━━ SUGGESTIONS RULE ━━━

After EVERY reply (except BOOKING_CONFIRMED and group-redirect), append on a new line:
SUGGESTIONS:["chip 1","chip 2","chip 3"]
- 2–4 chips, each under 40 characters, with a relevant emoji
- Make them specific and natural follow-ups to what was just discussed
- Examples: ["🍽️ Book a table","🥗 Vegetarian options?","🍷 Tell me about the wine list"]`;
}

// ---------------------------------------------------------------------------
// Hook utama — apiKey dihapus, tidak dibutuhkan di frontend
// ---------------------------------------------------------------------------
export function useChat() {
  const [messages, setMessages]       = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isBusy, setIsBusy]           = useState(false);
  const [booking, setBooking]         = useState(null);
  const historyRef                    = useRef([]);

  // ── Helpers ───────────────────────────────────────────────────────────────

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

  // ── Fallback suggestions ───────────────────────────────────────────────────

  const fetchFallbackSuggestions = useCallback(async (lastReply) => {
    try {
      const res = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      });
      const data = await res.json();
      const raw  = data.content?.[0]?.text?.trim() || '[]';
      const arr  = JSON.parse(raw.replace(/```json|```/g, '').trim());
      if (Array.isArray(arr) && arr.length) setSuggestions(arr);
    } catch {}
  }, []);

  // ── Kirim pesan utama ──────────────────────────────────────────────────────

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
        const systemPromptText = buildSystemPrompt();

        const res = await fetch(ANTHROPIC_API, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 600,
            stream: true,
            system: [
              {
                type: 'text',
                text: systemPromptText,
                cache_control: { type: 'ephemeral' },
              },
            ],
            messages: historyRef.current,
          }),
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

  // ── Post-booking actions ───────────────────────────────────────────────────

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