import { useState, useEffect } from 'react';
import {
  Clock, Brain, TrendingUp, Sparkles, Trophy, MessageSquare,
  Upload, BarChart3, Zap, BookOpen, User, Settings, LogOut,
  ChevronRight, Calendar, Target, Award
} from 'lucide-react';
import Card from '../elements/Card.jsx'
import Button from '../elements/Button.jsx'
import Badge from '../elements/Badge.jsx'

const Dashboard = () => {
  // steps
  // 1. Get data from api
  // 2. and display it well
  return (
    <div className=" flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-blue-800 to-slate-900 text-white overflow-hidden animation">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>
      {/* Header */}
      <nav className='relative z-10 container mx-auto px-6 py-4'>
        <div className='flex items-center justify-between'>        
        <div className='flex items-center space-x-3'>
          <div className="relative">
            <Brain className="w-10 h-10 text-purple-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"></div>
          </div>
          <span className='text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
            AI Learning Platform
          </span>
        </div>
        <div>
          User
        </div>
        </div>

      </nav>

      {/* content */}
      <div className='flex-grow'>
        content

















        
      </div>
      <footer className="z-10 container mx-auto px-6 py-12 border-t border-purple-500/30">
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
  )
}



export default Dashboard;