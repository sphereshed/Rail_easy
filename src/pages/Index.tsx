import { useState, useRef } from "react";
import Header from "@/components/layout/Header";
import TrainSearchForm from "@/components/search/TrainSearchForm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import vandeBharatHero from "@/assets/vande-bharat-hero.jpg";
import trainsStationBg from "@/assets/trains-station-bg.jpg";

interface Station {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
}

interface Train {
  id: string;
  number: string;
  name: string;
  from_station_id: string;
  to_station_id: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  total_seats: number;
  operating_days?: string[];
  class_prices?: any;
  from_station?: Station;
  to_station?: Station;
}

const Index = () => {
  const [searchResults, setSearchResults] = useState<Train[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hi! I am your AI assistant. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { sender: 'user', text: chatInput };
    setChatMessages((msgs) => [...msgs, userMsg]);
    setChatInput('');
    setChatLoading(true);
    try {
      // Use local Node.js chatbot backend
      const res = await fetch('http://localhost:8081/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text })
      });
      const data = await res.json();
      setChatMessages((msgs) => [...msgs, { sender: 'ai', text: data.reply || 'Sorry, I could not answer that.' }]);
    } catch (err) {
      setChatMessages((msgs) => [...msgs, { sender: 'ai', text: 'Sorry, there was an error contacting the assistant.' }]);
    }
    setChatLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-r from-primary to-primary-hover overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${vandeBharatHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-hover/80" />
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-4 animate-fade-in">
            Smart Railway Booking
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto animate-fade-in">
            Experience seamless train booking with interactive seat selection and real-time availability
          </p>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-12 px-4 -mt-8 relative z-10">
        <div className="container mx-auto">
          <div className="animate-scale-in">
            <TrainSearchForm onSearch={setSearchResults} onSearchStart={() => setIsSearched(true)} />
          </div>
        </div>
      </section>

      {/* Search Results */}
      {isSearched && (
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-6">
              {searchResults.length > 0 ? "Available Trains" : "No trains found"}
            </h2>
            <div className="space-y-4">
              {searchResults.map((train, index) => (
                <Card key={train.id} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{train.name}</h3>
                          <Badge variant="outline">{train.number}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {train.from_station?.name} → {train.to_station?.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {train.departure_time} - {train.arrival_time}
                          </div>
                          <div>Duration: {train.duration}</div>
                        </div>
                        {train.operating_days && (
                          <div className="mt-2">
                            <div className="text-xs text-muted-foreground mb-1">Operating Days:</div>
                            <div className="flex flex-wrap gap-1">
                              {train.operating_days.map((day, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {day.slice(0, 3)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          {train.class_prices ? (
                            <div>
                              <div className="text-2xl font-bold">
                                ₹{Math.min(...Object.values(train.class_prices as Record<string, number>)).toLocaleString()} 
                                - ₹{Math.max(...Object.values(train.class_prices as Record<string, number>)).toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">Price range by class</div>
                            </div>
                          ) : (
                            <div className="text-2xl font-bold">₹{train.price.toLocaleString()}</div>
                          )}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Users className="h-4 w-4" />
                            {train.total_seats} seats
                          </div>
                        </div>
                        <Link to="/booking" state={{ train }}>
                          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                            Book Now
                          </button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AI Chatbot Floating Button and Popup */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-full shadow-2xl p-4 hover:scale-110 transition-all flex items-center justify-center"
          onClick={() => setChatOpen((v) => !v)}
          aria-label="Open AI Chatbot"
        >
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M8.5 10.5a3.5 3.5 0 1 1 7 0v1.25c0 .414.336.75.75.75s.75-.336.75-.75V10.5a5 5 0 1 0-10 0v1.25c0 .414.336.75.75.75s.75-.336.75-.75V10.5Zm3.5 7a1.25 1.25 0 0 0 1.25-1.25h-2.5A1.25 1.25 0 0 0 12 17.5Z" fill="#2563eb"/></svg>
        </button>
        {chatOpen && (
          <div className="fixed bottom-24 right-6 w-80 max-w-full bg-white rounded-2xl shadow-2xl border border-blue-200 flex flex-col overflow-hidden animate-fade-in z-50">
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-lg">RailEase AI Assistant</span>
              <button className="ml-2 text-white hover:text-blue-200" onClick={() => setChatOpen(false)}>&times;</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto" style={{ minHeight: '200px', maxHeight: '300px' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={msg.sender === 'ai' ? 'text-blue-700 mb-2' : 'text-right mb-2'}>
                  <span className={msg.sender === 'ai' ? 'bg-blue-100 px-3 py-2 rounded-xl inline-block' : 'bg-blue-600 text-white px-3 py-2 rounded-xl inline-block'}>
                    {msg.text}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form className="flex border-t border-blue-100" onSubmit={sendMessage}>
              <input
                type="text"
                className="flex-1 px-3 py-2 text-base rounded-bl-2xl focus:outline-none"
                placeholder="Type your message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                disabled={chatLoading}
              />
              <button type="submit" className="px-4 py-2 text-blue-700 font-bold" disabled={chatLoading || !chatInput.trim()}>
                {chatLoading ? '...' : 'Send'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
