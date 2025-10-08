import { useState, useEffect } from "react";
import Button from "../elements/Button";
import Badge from "../elements/Badge";
import Input from "../elements/Input"
import { User, Brain, Settings, Send, LogOut, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { initializeChatbot, sendMessageToChatbot, getChatbotResponse } from "../api/api";
import Header from "../components/Header";

const Chatbot = () => {
  const navigate = useNavigate();
  const [userData, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [chatbotInitialized, setChatbotInitialized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUserData = sessionStorage.getItem('user_data');
    console.log('Stored user data:', storedUserData);
    
    if (storedUserData && storedUserData !== 'null' && storedUserData !== 'undefined') {
      try {
        const parsedData = JSON.parse(storedUserData);
        console.log('Parsed user data:', parsedData);
        setUser(parsedData);
        initializeChatbotSession();
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/');
      }
    } else {
      console.log('No valid user data found, navigating to home');
      navigate('/');
    }
  }, [navigate]);

  const initializeChatbotSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Initializing chatbot session...');
      const response = await initializeChatbot();
      
      console.log('Chatbot initialization response:', response);
      
      if (response.session_id && response.initial_response) {
        setSessionId(response.session_id);
        setChatbotInitialized(true);
        
        // Add the initial AI message
        const initialMessage = {
          id: 1,
          text: response.initial_response.message || response.initial_response.text || "Hello! I'm your AI tutor. I'll analyze your mental age and learning patterns through our conversation. What subject would you like to explore today?",
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages([initialMessage]);
      } else {
        throw new Error('Invalid response from chatbot initialization');
      }
    } catch (error) {
      console.error('Error initializing chatbot:', error);
      setError(`Failed to initialize chatbot: ${error.message}`);
      
      // Fallback to default message if API fails
      const fallbackMessage = {
        id: 1,
        text: "Hello! I'm your AI tutor. I'll analyze your mental age and learning patterns through our conversation. What subject would you like to explore today?",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = newMessage;
    setNewMessage('');
    setIsAnalyzing(true);
    setError(null);

    try {
      let aiResponse;
      
      if (chatbotInitialized && sessionId) {
        // Use the real API
        console.log('Sending message to chatbot:', messageToSend);
        const response = await sendMessageToChatbot(sessionId, messageToSend);
        console.log('Chatbot response:', response);
        
        aiResponse = {
          id: messages.length + 2,
          text: response.message || response.text || response.response || "I understand. Can you tell me more about that?",
          sender: 'ai',
          timestamp: new Date()
        };
      } else {
        // Fallback response if chatbot not properly initialized
        aiResponse = {
          id: messages.length + 2,
          text: "That's a great question! I can see you're thinking analytically. Based on your communication style, I'm updating your learning profile. Tell me, how do you usually approach problem-solving?",
          sender: 'ai',
          timestamp: new Date()
        };
      }

      setTimeout(() => {
        setMessages(prev => [...prev, aiResponse]);
        setIsAnalyzing(false);
      }, 1000); // Small delay for better UX
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Failed to send message: ${error.message}`);
      
      // Fallback AI response on error
      const fallbackResponse = {
        id: messages.length + 2,
        text: "I'm sorry, I encountered an issue processing your message. Could you please try again?",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, fallbackResponse]);
        setIsAnalyzing(false);
      }, 1000);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user_data');
    navigate('/');
  };

  const retryInitialization = () => {
    initializeChatbotSession();
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400 border-t-transparent"></div>
            <span className="text-white text-lg">Loading your AI tutor...</span>
          </div>
          {error && (
            <div className="text-center">
              <p className="text-red-400 mb-2">{error}</p>
              <Button onClick={retryInitialization} variant="secondary" size="sm">
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black-100 to-slate-900 text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="backdrop-blur-xl bg-black/90 border-b border-gray-700 px-6 py-4">
  <div className="max-w-7xl mx-auto flex items-center justify-between">
    {/* Left Section */}
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-xl bg-gradient-to-r from-gray-800 to-gray-600">
        <MessageCircle className="h-6 w-6 text-gray-100" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-100">AI Mental Age Analysis</h1>
        <p className="text-gray-400 text-sm">
          Welcome back, {userData?.name || 'User'}
        </p>
      </div>
    </div>

    {/* Right Section */}
    <div className="flex items-center gap-4">
      <Badge variant={chatbotInitialized ? "success" : "warning"}>
        <div
          className={`w-2 h-2 ${
            chatbotInitialized ? 'bg-emerald-400' : 'bg-yellow-400'
          } rounded-full animate-pulse mr-2`}
        ></div>
        {chatbotInitialized ? 'Active Analysis' : 'Connecting...'}
      </Badge>

      <Button variant="secondary" size="sm" className="bg-gray-800 hover:bg-gray-700 text-gray-200">
        <Settings className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="border-gray-600 text-gray-200 hover:bg-gray-800"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  </div>
</div>


     {/* Error Banner */}
{error && (
  <div className="bg-red-900/30 border-b border-red-600/40 px-6 py-3">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <p className="text-red-300 font-medium">{error}</p>
      <Button
        onClick={retryInitialization}
        variant="secondary"
        size="sm"
        className="bg-gray-800 hover:bg-gray-700 text-gray-200"
      >
        Retry
      </Button>
    </div>
  </div>
)}

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
          {/* Icon Bubble */}
          <div
            className={`p-3 rounded-xl shadow-lg ${
              message.sender === 'user'
                ? 'bg-gradient-to-r from-gray-800 to-gray-700'
                : 'bg-gradient-to-r from-gray-900 to-gray-700'
            }`}
          >
            {message.sender === 'user' ? (
              <User className="h-5 w-5 text-gray-200" />
            ) : (
              <Brain className="h-5 w-5 text-gray-200" />
            )}
          </div>

          {/* Message Bubble */}
          <div
            className={`px-4 py-3 rounded-2xl backdrop-blur-xl shadow-xl border ${
              message.sender === 'user'
                ? 'bg-gray-800/90 text-gray-100 border-gray-700'
                : 'bg-gray-900/80 text-gray-200 border-gray-700'
            }`}
          >
            <p className="leading-relaxed">{message.text}</p>
            <p className="text-xs text-gray-400 mt-2">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    ))}

    {/* AI Typing Indicator */}
    {isAnalyzing && (
      <div className="flex justify-start animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 shadow-lg">
            <Brain className="h-5 w-5 text-gray-200" />
          </div>
          <div className="bg-gray-900/80 backdrop-blur-xl text-gray-200 px-4 py-3 rounded-2xl border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
              <span>AI is analyzing your response...</span>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>

  {/* Message Input */}
  <div className="p-6">
    <div className="backdrop-blur-xl bg-gray-900/80 rounded-2xl border border-gray-700 p-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder={chatbotInitialized ? "Type your message here..." : "Connecting to AI tutor..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && handleSendMessage()}
            disabled={!chatbotInitialized || isAnalyzing}
            className="bg-transparent border-none text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-gray-600 disabled:opacity-50"
          />
        </div>
        <Button 
          onClick={handleSendMessage} 
          disabled={!newMessage.trim() || !chatbotInitialized || isAnalyzing}
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className={`h-5 w-5 ${isAnalyzing ? 'animate-pulse' : ''}`} />
        </Button>
      </div>
    </div>
  </div>
</div>
    </div>
  );
};

export default Chatbot;