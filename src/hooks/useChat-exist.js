import { useState, useRef, useCallback } from "react";
import {
  OPENROUTER_API,
  MODEL,
  SYSTEM_PROMPT,
} from "../constants/restaurant-exist";

let _id = 0;
const uid = () => ++_id;

export function useChat(apiKey) {
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isBusy, setIsBusy] = useState(false);
  const [booking, setBooking] = useState(null);
  const historyRef = useRef([]);

  const formatText = (t) =>
    t
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");

  const parseSuggestions = (text) => {
    const idx = text.lastIndexOf("SUGGESTIONS:");
    if (idx === -1) return { displayText: text.trim(), chips: [] };
    const displayText = text.slice(0, idx).trim();
    const jsonPart = text.slice(idx + 12).trim();
    const end = jsonPart.indexOf("]");
    try {
      const arr = JSON.parse(
        end !== -1 ? jsonPart.slice(0, end + 1) : jsonPart
      );
      if (Array.isArray(arr)) return { displayText, chips: arr };
    } catch {}
    return { displayText, chips: [] };
  };

  const addBotMessage = useCallback((html, isStreaming = false) => {
    const id = uid();
    setMessages((prev) => [...prev, { id, role: "bot", html, isStreaming }]);
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

  const greet = useCallback(() => {
    addBotMessage(
      formatText(
        "Welcome to **The Olive Tree**! I'm here to help you with reservations, menu questions, or anything else about our restaurant. How can I help you today?"
      )
    );
    setSuggestions([
      "🍽️ Book a table",
      "🥗 View menu highlights",
      "🕐 Opening hours",
      "📍 Where are you located?",
    ]);
  }, [addBotMessage]);

  const fetchFallbackSuggestions = useCallback(
    async (lastReply) => {
      try {
        const res = await fetch(OPENROUTER_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.href,
            "X-Title": "The Olive Tree Paris",
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              {
                role: "system",
                content:
                  "You generate quick-reply chips for a restaurant chatbot. Output ONLY a JSON array of 2–4 short strings (max 38 chars each, with emoji). No explanation, no markdown.",
              },
              {
                role: "user",
                content: `The assistant just said: "${lastReply}"\nGenerate follow-up suggestion chips.`,
              },
            ],
            max_tokens: 80,
            temperature: 0.8,
          }),
        });
        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content?.trim() || "[]";
        const arr = JSON.parse(raw.replace(/```json|```/g, "").trim());
        if (Array.isArray(arr) && arr.length) setSuggestions(arr);
      } catch {}
    },
    [apiKey]
  );

  const send = useCallback(
    async (userText) => {
      if (isBusy || !userText.trim()) return;

      setSuggestions([]);
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", html: userText },
      ]);
      historyRef.current.push({ role: "user", content: userText });
      setIsBusy(true);

      // Typing indicator
      const typingId = uid();
      setMessages((prev) => [...prev, { id: typingId, role: "typing" }]);

      try {
        const res = await fetch(OPENROUTER_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.href,
            "X-Title": "The Olive Tree Paris",
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...historyRef.current,
            ],
            stream: true,
            max_tokens: 600,
            temperature: 0.7,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${res.status}`);
        }

        // Remove typing, add streaming message
        setMessages((prev) => prev.filter((m) => m.id !== typingId));
        const streamId = uid();
        setMessages((prev) => [
          ...prev,
          { id: streamId, role: "bot", html: "", isStreaming: true },
        ]);

        let fullText = "";
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder
            .decode(value)
            .split("\n")
            .filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const delta = JSON.parse(data).choices?.[0]?.delta?.content || "";
              fullText += delta;
              // Sembunyikan SUGGESTIONS: dan BOOKING_CONFIRMED: saat streaming
              const visible = fullText.includes("SUGGESTIONS:")
                ? fullText.slice(0, fullText.lastIndexOf("SUGGESTIONS:")).trim()
                : fullText.includes("BOOKING_CONFIRMED:")
                ? fullText
                    .slice(0, fullText.lastIndexOf("BOOKING_CONFIRMED:"))
                    .trim()
                : fullText;
              updateBotMessage(streamId, formatText(visible), true);
            } catch {}
          }
        }

        // Finalize streaming — identik dengan msgEl.classList.remove('streaming') di native
        updateBotMessage(streamId, "", false);

        // Booking trigger
        if (fullText.includes("BOOKING_CONFIRMED:")) {
          removeBotMessage(streamId);
          const raw = fullText.split("BOOKING_CONFIRMED:")[1].trim();
          try {
            const bookingData = JSON.parse(raw);
            historyRef.current.push({
              role: "assistant",
              content: "I've confirmed your reservation — see you soon!",
            });
            setBooking(bookingData);
          } catch (e) {
            console.error("❌ Booking parse failed:", e, "\nRaw:", raw);
            addBotMessage(
              formatText(
                "Your reservation has been noted! We'll be in touch to confirm. 🫒"
              )
            );
          }
          return;
        }

        const { displayText, chips } = parseSuggestions(fullText);
        updateBotMessage(streamId, formatText(displayText), false);
        historyRef.current.push({ role: "assistant", content: displayText });

        if (chips.length > 0) {
          setSuggestions(chips);
        } else {
          fetchFallbackSuggestions(displayText);
        }
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== typingId));
        const isAuthErr =
          err.message.includes("401") || err.message.includes("403");
        addBotMessage(
          isAuthErr
            ? "🔑 Looks like the API key is invalid. Please update it."
            : `⚠️ Something went wrong: ${err.message}`
        );
        if (isAuthErr) return "AUTH_ERROR";
      } finally {
        setIsBusy(false);
      }
    },
    [
      isBusy,
      apiKey,
      addBotMessage,
      updateBotMessage,
      removeBotMessage,
      fetchFallbackSuggestions,
    ]
  );

  const resetAfterBooking = useCallback(() => {
    setBooking(null);
    addBotMessage(
      formatText(
        "Wonderful! We can't wait to welcome you to The Olive Tree. 🫒 Is there anything else I can help with — dietary needs, the menu, or directions?"
      )
    );
    setSuggestions([
      "🥗 Dietary options",
      "🚗 Parking & directions",
      "🍷 Tell me about the wine list",
    ]);
  }, [addBotMessage]);

  const modifyBooking = useCallback(() => {
    setBooking(null);
    historyRef.current = [];
    addBotMessage(
      formatText(
        "No problem at all! Let's start fresh. What would you like to change?"
      )
    );
    setSuggestions(["Different date", "Different time", "More guests"]);
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
