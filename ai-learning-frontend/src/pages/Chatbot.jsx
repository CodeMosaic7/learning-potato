import { useState } from "react";
import Button from "../elements/Button";
import Badge from "../elements/Badge";
import Input from "../elements/Input"
import { User,Brain,Settings,Send } from "lucide-react";
const Chatbot = () => {

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

  return (
    <div className="h-screen flex flex-col animate-fade-in">
      <div className="flex items-center justify-between p-6 border-b border-dark-700">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Mental Age Analysis</h1>
          <p className="text-dark-400 mt-1">Advanced AI conversation for personalized learning</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="success">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-2"></div>
            Active Analysis
          </Badge>
          <Button variant="secondary" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div className={`flex items-start gap-3 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2 rounded-xl ${
                message.sender === 'user' 
                  ? 'bg-primary-500' 
                  : 'bg-emerald-500'
              }`}>
                {message.sender === 'user' ? (
                  <User className="h-5 w-5 text-white" />
                ) : (
                  <Brain className="h-5 w-5 text-white" />
                )}
              </div>
              <div
                className={`px-4 py-3 rounded-2xl shadow-lg ${
                  message.sender === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-700 text-dark-200'
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
              <div className="p-2 rounded-xl bg-purple-500">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="bg-dark-700 text-dark-200 px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
                  <span>AI is analyzing your response...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-dark-700">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
          </div>
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;

