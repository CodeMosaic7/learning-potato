import { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom'; 
import { Brain, MessageSquare, Trophy, ArrowRight, PlayCircle, Zap, Target} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate=useNavigate();
  // Set isVisible to true on component mount to trigger animations
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Mental Age Calculator",
      description: "Personalized learning paths adapted to your pace and style with advanced AI algorithms.",
      path: "/Chatbot"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Homework Assistance",
      description: "Get instant answers and guidance from our intelligent tutoring assistant 24/7.",
      path: "/HomeWorkHelper"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Smart Quizzes",
      description: "Dynamic assessments that adapt to your knowledge level and track your progress.",
      path: "/Quiz"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Progress Tracking",
      description: "Comprehensive analytics to monitor your learning journey and achievements.",
      path: "/Dashboard"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white overflow-hidden">
    
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-purple-300">A Learning Revolution</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Transform Your
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              Learning Journey
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Personalized education with our AI-driven platform. Adaptive quizzes, intelligent tutoring, and comprehensive progress tracking all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50 flex items-center space-x-2">
              <PlayCircle className="w-6 h-6 group-hover:animate-bounce" />
              <span>Start Learning</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Exclusive Features
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> for Modern Learning</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            This platform aims to provide personalized education based on mental and intellectual age of the child.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative cursor-pointer" 
              onClick={() => navigate(feature.path)}
            >
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 hover:border-purple-400/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                <div className="mt-6 flex items-center text-purple-400 group-hover:text-pink-400 transition-colors">
                  <span className="text-sm font-semibold">Learn More</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer/>
    
    </div>
  );
};

export default Home;