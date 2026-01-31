import { useState, useEffect, useRef } from "react";
import { User, Brain, Send, LogOut, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  initializeChatbot,
  sendMessageToChatbot
} from "../api/api";
import Button from "../elements/Button";
import Badge from "../elements/Badge";
import Input from "../elements/Input";

const Chatbot = () => {
  const navigate = useNavigate();
  const [userData, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [chatbotInitialized, setChatbotInitialized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  
  // Ref for auto-scrolling to bottom
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // INITIAL AUTH + CHAT SETUP
  useEffect(() => {
    const storedUserData = localStorage.getItem("user_details");
    if (!storedUserData) {
      console.log("User Data not found");
      navigate("/");
      return;
    }
    try {
      console.log(storedUserData);
      const parsed = JSON.parse(storedUserData);
      console.log(parsed);
      setUser(parsed);
      // chat initialised
      initChat();
    } catch (e) {
      console.error("Error parsing user data:", e);
      navigate("/");
    }
  }, [navigate]);

  const initChat = async () => {
    try {
      setIsLoading(true);
      const res = await initializeChatbot();

      if (res.session_id) {
        setSessionId(res.session_id);
        setChatbotInitialized(true);
      }

      const initial = {
        id: Date.now(),
        sender: "ai",
        text:
          res.initial_response?.message ||
          "Hello! I'm your AI tutor. Let's begin your learning journey.",
        timestamp: new Date(),
      };

      setMessages([initial]);
    } catch (e) {
      console.error("Error initializing chat:", e);
      setError("Failed to initialize chatbot");
      setMessages([
        {
          id: Date.now(),
          sender: "ai",
          text: "Hello! Something went wrong connecting, but I'm still here!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!newMessage.trim() || isAnalyzing) return;
    
    const messageText = newMessage.trim();
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setNewMessage("");
    setIsAnalyzing(true)
    try {
      const res = await sendMessageToChatbot(sessionId, messageText);

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text:
          res.message ||
          res.text ||
          "Hmm, interesting… could you explain more?",
        timestamp: new Date(),
      };
      
      setTimeout(() => {
        setMessages((prev) => [...prev, aiMsg]);
        setIsAnalyzing(false);
      }, 700);
    } catch (e) {
      console.error("Error sending message:", e);
      const fallback = {
        id: Date.now() + 1,
        sender: "ai",
        text: "Oops! Something went wrong. Try again?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallback]);
      setIsAnalyzing(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user_details");
    navigate("/");
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // LOADING SCREEN
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#080C1A] via-[#0F0A21] to-[#080C1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-2 border-pink-400 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-pink-200 text-lg">Booting your AI tutor...</p>
        </div>
      </div>
    );
  }

  // MAIN CHAT UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080C1A] via-[#0F0A21] to-[#080C1A] text-white flex flex-col">

      {/* NAV HEADER */}
      <header className="py-5 px-8 border-b border-white/10 backdrop-blur-xl bg-black/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
                AI Mental Age Tutor
              </h1>
              <p className="text-gray-400 text-sm">
                Welcome, {userData?.name || "Learner"} 👋
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge
              variant="success"
              className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
            >
              ● Active
            </Badge>

            <Button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-pink-500 px-4 py-2 rounded-xl hover:opacity-80"
            >
              <LogOut className="h-4 w-4 mr-2 inline" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* CHAT BODY */}
      <div className="max-w-4xl mx-auto flex-1 overflow-y-auto py-8 px-4 space-y-6">
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300">
            {error}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-4 max-w-lg rounded-2xl shadow-xl backdrop-blur-lg border ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-[#1E1E2E] to-[#2A2A3C] border-white/10"
                  : "bg-gradient-to-r from-[#140F2A] to-[#1B1635] border-purple-500/20"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <p className="text-xs text-gray-400 mt-2">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {/* AI typing indicator */}
        {isAnalyzing && (
          <div className="flex justify-start">
            <div className="p-4 bg-[#140F2A]/70 border border-purple-500/20 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
                <span className="text-purple-300">AI is thinking…</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="px-6 py-6 bg-black/30 border-t border-white/10 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex gap-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-white/5 border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isAnalyzing}
          />

          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isAnalyzing}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Send className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;