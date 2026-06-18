import { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Menu from './components/Menu';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ApiKeyModal from './components/ApiKeyModal';
import BookingView from './components/BookingView';
import ChatWidget from './components/ChatWidget';
import ChatFab from './components/ChatFab';
// import { useApiKey } from './hooks/useApiKey';
// import { useChat } from './hooks/useChat';
// import { useChat } from './hooks/useChat.gemini';
import { useChat } from './hooks/useChat';

export default function App() {
  // const { apiKey, saveKey } = useApiKey();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatGreeted, setChatGreeted] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);

  // const { messages, suggestions, setSuggestions, isBusy, booking, greet, send, resetAfterBooking, modifyBooking } = useChat(apiKey);
  // const openChat = useCallback(() => {
  //   if (!apiKey) { setApiModalOpen(true); return; }
  //   setChatOpen(true);
  //   if (!chatGreeted) { setChatGreeted(true); setTimeout(greet, 350); }
  // }, [apiKey, chatGreeted, greet]);

  const { messages, suggestions, setSuggestions, isBusy, booking, greet, send, resetAfterBooking, modifyBooking } = useChat();

  const openChat = useCallback(() => {
    setChatOpen(true);
    if (!chatGreeted) { setChatGreeted(true); setTimeout(greet, 350); }
  }, [chatGreeted, greet]);

  const closeChat = () => setChatOpen(false);

  const handleSaveKey = (key) => {
    saveKey(key);
    setApiModalOpen(false);
    setChatOpen(true);
    if (!chatGreeted) { setChatGreeted(true); setTimeout(greet, 350); }
  };

  const handleResetKey = () => {
    closeChat();
    setApiModalOpen(true);
  };

  const handleSend = async (text) => {
    const result = await send(text);
    if (result === 'AUTH_ERROR') setTimeout(() => setApiModalOpen(true), 1200);
  };

  const handleSuggestionClick = (chip) => {
    setSuggestions([]);
    handleSend(chip);
  };

  return (
    <>
      <Navbar onReserve={openChat} />
      <Hero onReserve={openChat} />
      <About />
      <Menu onReserve={openChat} />
      <Contact />
      <Footer />

      {/* <ApiKeyModal
        isOpen={apiModalOpen}
        onSave={handleSaveKey}
        onClose={() => setApiModalOpen(false)}
        initialKey={apiKey}
      /> */}

      <BookingView
        booking={booking}
        onDone={resetAfterBooking}
        onModify={modifyBooking}
      />

      <ChatWidget
        isOpen={chatOpen}
        onClose={closeChat}
        onResetKey={handleResetKey}
        messages={messages}
        suggestions={suggestions}
        isBusy={isBusy}
        onSend={handleSend}
        onSuggestionClick={handleSuggestionClick}
      />

      <ChatFab visible={!chatOpen} onClick={openChat} />
    </>
  );
}
