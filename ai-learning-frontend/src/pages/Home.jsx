import { useState, useEffect } from 'react';
import { Brain, BookOpen, MessageSquare, Trophy, Users, ArrowRight, Star, PlayCircle, CheckCircle, Zap, Target, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate=useNavigate()
  // const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const gotologin=()=>{
    navigate('/Login')
  }

  // const gotochatbot=()=>{
  //   navigate('/Chatbot')
  // }

  // const gotodashboard=()=>{
  //   navigate('/Dashboard')
  // }

  // const gotoquiz=()=>{
  //   navigate('/Quiz')
  // }
  // const gotoHWhelper=()=>{
  //   navigate('/HomeWorkHelper')
  // }

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
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


  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      content: "This platform revolutionized how I learn. The AI adapts perfectly to my learning style!",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Software Developer",
      content: "The interactive features and personalized quizzes helped me advance my skills rapidly.",
      rating: 5
    },
    {
      name: "Dr. Emily Watson",
      role: "Educator",
      content: "An incredible tool for both students and teachers. The progress tracking is phenomenal.",
      rating: 5
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Learners" },
    { number: "95%", label: "Success Rate" },
    { number: "200+", label: "Courses Available" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-800 to-slate-900 text-white overflow-hidden animation">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Brain className="w-10 h-10 text-purple-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Learning Platform
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors duration-300">Features</a>
            {/* <a href="#about" className="text-gray-300 hover:text-purple-400 transition-colors duration-300">About</a>
            <a href="#testimonials" className="text-gray-300 hover:text-purple-400 transition-colors duration-300">Reviews</a> */}
            <button 
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            onClick={gotologin}>

              Login
            </button>
          </div>
        </div>
      </nav>

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

      {/* Stats Section */}
      {/* <section className="relative z-10 container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105">
                <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2 group-hover:text-pink-400 transition-colors">
                  {stat.number}
                </div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* Features Section */}
      <section id="features" className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Exclusive Features
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Modern Learning</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            This platform aims to provide personalised education based on mental and intellectual age of the kid.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group relative" onClick={() => navigate(feature.path)}>
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

      {/* Testimonials Section */}
      {/* <section id="testimonials" className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What Our
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Learners Say</span>
          </h2>
          <p className="text-xl text-gray-300">Join thousands of satisfied students who transformed their learning experience.</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-xl text-gray-300 mb-6 italic leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              
              <div>
                <div className="font-semibold text-white text-lg">{testimonials[currentTestimonial].name}</div>
                <div className="text-purple-400">{testimonials[currentTestimonial].role}</div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-purple-500' : 'bg-gray-500'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      {/* <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 animate-pulse"></div>
          
          <div className="relative z-10">
            <Globe className="w-16 h-16 text-purple-400 mx-auto mb-6 animate-spin-slow" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> AI Learning Journey?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who are already transforming their skills with our AI-powered platform.
            </p>
            <button className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-10 py-5 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50 flex items-center space-x-3 mx-auto">
              <CheckCircle className="w-6 h-6 group-hover:animate-bounce" />
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-12 border-t border-purple-500/30">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Learning Platform
            </span>
          </div>
          <div className="flex space-x-6 text-gray-400">
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Support</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Contact</a>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-8">
          © 2025 AI Learning Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;