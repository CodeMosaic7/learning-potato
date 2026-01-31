import { useState, useRef } from 'react';
import { Send, Camera, User, Bot, Star, Clock, Brain, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { uploadHomeworkImage } from '../api/api'; 
// import {getTextualHelp} from "../api/apis"
const HomeWorkHelper = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hi there! I'm your Homework helper. Upload a photo of your homework,of any subject, textbook, or worksheet, and I'll help you understand and complete it step by step! 📚✨",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    if (file){
      const text=uploadHomeworkImage(file)
    }

    setIsLoading(true);
    setUploadError(null);
    try {
      const userMessage = {
        id: Date.now(),
        sender: 'user',
        text: 'I uploaded my homework. Can you help me with this?',
        image: URL.createObjectURL(file),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const aiResponse = await {
        id: Date.now() + 1,
        sender: 'bot',
        text: "I can see this is a math problem involving quadratic equations. Let me help you solve this step by step.",
        metadata: {
          subject: "Mathematics",
          difficulty: "Medium"
        },
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setTimeout(() => {
        setMessages(prev => [...prev, suggestionsMessage]);
      }, 1000);

    } catch (error) {
      setUploadError(error.message);
      
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: `Sorry, I couldn't process your image: ${error.message}. Please try uploading again or describe your homework question in text.`,
        isError: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    setIsLoading(true);
    const newMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    setTimeout(() => {
      const responses = [
        "Let me break this down for you step by step. First, let's identify what we know and what we need to find...",
        "That's a great question! Here's how we can approach this problem. The key concept here is...",
        "I see what you're working on. Let's solve this together. Can you tell me what you think the first step should be?",
        "This looks like a challenging problem. Here's a helpful way to think about it...",
        "Good job asking for help! Let's work through this systematically. The important thing to remember is..."
      ];
      
      const aiResponse = {
        id: Date.now() + 1,
        sender: 'bot',
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "Can you explain this step by step?",
    "What's the main concept here?",
    "How do I start this problem?",
    "Can you check my answer?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white overflow-hidden py-8">
      <div className="max-w-4xl mx-auto px-6">
        <Header />
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="text-pink-400 mr-3" size={40} />
            <h1 className="text-4xl font-bold text-white">AI Homework Helper</h1>
            <Star className="text-yellow-400 ml-3" size={32} />
          </div>
          <p className="text-purple-200">Upload your homework and get personalized help!</p>
        </div>

        {/* Error Alert */}
        {uploadError && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-xl p-4 mb-6 flex items-center">
            <AlertCircle className="text-red-400 mr-3 flex-shrink-0" size={20} />
            <p className="text-red-200">{uploadError}</p>
            <button 
              onClick={() => setUploadError(null)}
              className="ml-auto text-red-200 hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/30 rounded-3xl overflow-hidden hover:border-purple-400/50 transition-all">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <div className="flex items-center">
              <Bot className="text-white mr-3" size={24} />
              <div>
                <h3 className="text-white font-semibold">AI Tutor</h3>
                <p className="text-purple-100 text-sm">
                  {isLoading ? 'Analyzing your homework...' : 'Ready to help with your homework'}
                </p>
              </div>
              <Clock className="ml-auto text-purple-200" size={20} />
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : message.isError
                      ? 'bg-red-500/20 backdrop-blur-sm text-red-200 border border-red-400/50'
                      : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && (
                      <Bot className={`mt-1 flex-shrink-0 ${message.isError ? 'text-red-300' : 'text-purple-300'}`} size={16} />
                    )}
                    {message.sender === 'user' && (
                      <User className="mt-1 flex-shrink-0 text-blue-200" size={16} />
                    )}
                    <div className="flex-1">
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Uploaded homework"
                          className="w-full rounded-lg mb-2 border border-white/30"
                        />
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                      
                      {message.metadata && (
                        <div className="mt-2 p-2 bg-white/10 rounded-lg border border-white/20">
                          <div className="text-xs text-purple-200 space-y-1">
                            {message.metadata.subject && (
                              <div><strong>Subject:</strong> {message.metadata.subject}</div>
                            )}
                            {message.metadata.difficulty && (
                              <div><strong>Difficulty:</strong> {message.metadata.difficulty}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <Bot className="text-purple-300" size={16} />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Questions */}
          <div className="px-4 py-3 border-t border-purple-500/30 bg-slate-900/30">
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(question)}
                  disabled={isLoading}
                  className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs px-3 py-1.5 rounded-full border border-white/20 transition-all"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-purple-500/30 bg-slate-900/30">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Camera size={20} />
              </button>
              
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  placeholder="Ask about your homework, upload an image, or describe what you need help with..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 transition-all resize-none"
                  rows={2}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={inputText.trim() === '' || isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Send size={20} />
              </button>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              disabled={isLoading}
              className="hidden"
            />
          </div>
        </div>

        {/* Footer */}
       <Footer/>
      </div>
    </div>
  );
};

export default HomeWorkHelper;