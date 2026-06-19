import { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Menu from './components/Menu';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BookingView from './components/BookingView';
import ChatWidget from './components/ChatWidget';
import ChatFab from './components/ChatFab';
import { useChat } from './hooks/useChat';

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatGreeted, setChatGreeted] = useState(false);

  const { messages, suggestions, setSuggestions, isBusy, booking, greet, send, resetAfterBooking, modifyBooking } = useChat();

  const openChat = useCallback(() => {
    setChatOpen(true);
    if (!chatGreeted) { setChatGreeted(true); setTimeout(greet, 350); }
  }, [chatGreeted, greet]);

  const closeChat = () => setChatOpen(false);

  const handleResetKey = () => {
    closeChat();
    setApiModalOpen(true);
  };

  const handleSend = async (text) => {
    await send(text);
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
