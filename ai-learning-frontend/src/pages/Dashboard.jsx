import { useState, useEffect } from "react";
import {
  Clock, Brain, TrendingUp, Sparkles, Trophy, MessageSquare,
  Upload, BarChart3, Zap, BookOpen, User, Settings, LogOut,
  ChevronRight, Calendar, Target, Award, Flame, Compass
} from "lucide-react";
import Card from "../elements/Card.jsx";
import Button from "../elements/Button.jsx";
import Badge from "../elements/Badge.jsx";

const Dashboard = () => {
  const [stats, setStats] = useState({
    solved: 132,
    streak: 15,
    rank: 1204,
    xp: 3400,
    hours: 56,
  });

  const [daily, setDaily] = useState({
    title: "Dynamic Programming: Fibonacci",
    difficulty: "Medium",
    time: "23h 45m left",
  }); 

  const [path, setPath] = useState({
    current: "Data Structures → Trees",
    next: "Graph Algorithms → BFS & DFS",
  });

  const [recent, setRecent] = useState([
    { id: 1, title: "Recursion Basics Quiz", status: "Completed", time: "2h ago" },
    { id: 2, title: "Greedy Algorithms Problem Set", status: "In Progress", time: "1d ago" },
    { id: 3, title: "Sorting Visualization", status: "Completed", time: "2d ago" },
  ]);

  useEffect(() => {
    // TODO: fetch real stats & personalized data
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-blue-800 to-slate-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <nav className="relative z-10 container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-10 h-10 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Adaptive Learning Platform
            </span>
          </div>
          <div className="flex items-center space-x-4 text-gray-300">
            <User className="w-6 h-6" />
            <Settings className="w-6 h-6" />
            <LogOut className="w-6 h-6" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex-grow container mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <p className="text-gray-400 text-sm">Problems Solved</p>
            <h2 className="text-2xl font-bold">{stats.solved}</h2>
            <Trophy className="w-6 h-6 text-yellow-400 mt-2" />
          </Card>
          <Card>
            <p className="text-gray-400 text-sm">Current Streak</p>
            <h2 className="text-2xl font-bold">{stats.streak} days</h2>
            <Flame className="w-6 h-6 text-orange-400 mt-2" />
          </Card>
          <Card>
            <p className="text-gray-400 text-sm">Rank</p>
            <h2 className="text-2xl font-bold">#{stats.rank}</h2>
            <TrendingUp className="w-6 h-6 text-green-400 mt-2" />
          </Card>
          <Card>
            <p className="text-gray-400 text-sm">Study Hours</p>
            <h2 className="text-2xl font-bold">{stats.hours} hrs</h2>
            <Clock className="w-6 h-6 text-blue-400 mt-2" />
          </Card>
          <Card>
            <p className="text-gray-400 text-sm">XP</p>
            <h2 className="text-2xl font-bold">{stats.xp}</h2>
            <Zap className="w-6 h-6 text-purple-400 mt-2" />
          </Card>
        </div>

        {/* Daily Challenge */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span>Daily Challenge</span>
              </h3>
              <p className="mt-2 text-lg font-medium">{daily.title}</p>
              <Badge variant="outline" className="mt-2">{daily.difficulty}</Badge>
              <p className="text-gray-400 text-sm mt-1">{daily.time}</p>
            </div>
            <Button>
              Solve Now <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Personalized Learning Path */}
        <Card>
          <h3 className="text-xl font-semibold mb-2 flex items-center space-x-2">
            <Compass className="w-5 h-5 text-pink-400" />
            <span>Your Learning Path</span>
          </h3>
          <p className="text-lg">📌 Current: <span className="font-bold">{path.current}</span></p>
          <p className="text-lg mt-2">🎯 Next: <span className="font-bold text-purple-300">{path.next}</span></p>
        </Card>

        {/* Skills & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <span>Skill Breakdown</span>
            </h3>
            <div className="h-40 flex items-center justify-center text-gray-400">
              [Radar Chart / Progress Bars Placeholder]
            </div>
          </Card>
          <Card>
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <span>Recent Activity</span>
            </h3>
            <ul className="space-y-3">
              {recent.map((r) => (
                <li key={r.id} className="flex justify-between items-center">
                  <span>{r.title}</span>
                  <span className="text-sm text-gray-400">{r.time}</span>
                  <Badge>{r.status}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="z-10 container mx-auto px-6 py-12 border-t border-purple-500/30">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Adaptive Learning Platform
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
          © 2025 Adaptive Learning Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;