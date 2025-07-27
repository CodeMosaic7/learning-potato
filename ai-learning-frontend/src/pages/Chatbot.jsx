import { useState, useEffect } from "react";
import Button from "../elements/Button";
import Badge from "../elements/Badge";
import Input from "../elements/Input"
import { User, Brain, Settings, Send, LogOut, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sendMessageToChatbot,getChatbotResponse } from "../api/api";
const Chatbot = () => {
  const navigate = useNavigate();
  const [userData, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserData = sessionStorage.getItem('user_data');
    console.log('Stored user data:', storedUserData);
    
    if (storedUserData && storedUserData !== 'null' && storedUserData !== 'undefined') {
      try {
        const parsedData = JSON.parse(storedUserData);
        console.log('Parsed user data:', parsedData);
        setUser(parsedData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/');
      }
    } else {
      console.log('No valid user data found, navigating to home');
      navigate('/');
    }
  }, [navigate]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI tutor. I'll analyze your mental age and learning patterns through our conversation. What subject would you like to explore today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setNewMessage('');
    setIsAnalyzing(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: "That's a great question! I can see you're thinking analytically. Based on your communication style, I'm updating your learning profile. Tell me, how do you usually approach problem-solving?",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user_data');
    navigate('/');
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400 border-t-transparent"></div>
          <span className="text-white text-lg">Loading your AI tutor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-500 to-slate-300">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/10 border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Mental Age Analysis</h1>
              <p className="text-gray-300 text-sm">Welcome back, {userData?.name || 'User'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="success">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-2"></div>
              Active Analysis
            </Badge>
            <Button variant="secondary" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`flex items-start gap-3 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-3 rounded-xl ${message.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  } shadow-lg`}>
                  {message.sender === 'user' ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <Brain className="h-5 w-5 text-white" />
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl backdrop-blur-xl shadow-xl ${message.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white border border-purple-400/20'
                      : 'bg-white/10 text-white border border-white/20'
                    }`}
                >
                  <p className="leading-relaxed">{message.text}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isAnalyzing && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div className="bg-white/10 backdrop-blur-xl text-white px-4 py-3 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
                    <span>AI is analyzing your response...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-6">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="bg-transparent border-none text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;