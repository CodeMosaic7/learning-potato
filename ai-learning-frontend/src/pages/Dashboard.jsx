import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, Brain, TrendingUp, Sparkles, Trophy, MessageSquare,
  Upload, BarChart3, Zap, BookOpen, User, Settings, LogOut
} from 'lucide-react';import Card from '../elements/Card.jsx'
import Button from '../elements/Button.jsx'
import Badge from '../elements/Badge.jsx'


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_data');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  const stats = [
    { 
      title: 'Mental Age Analysis', 
      value: '16.5 years', 
      change: '+0.5 this month', 
      icon: Brain, 
      color: 'primary',
      bgColor: 'bg-primary-500'
    },
    { 
      title: 'Learning Progress', 
      value: '78%', 
      change: '+12% this week', 
      icon: TrendingUp, 
      color: 'emerald',
      bgColor: 'bg-emerald-500'
    },
    { 
      title: 'Quizzes Completed', 
      value: '24', 
      change: '+8 this week', 
      icon: Trophy, 
      color: 'amber',
      bgColor: 'bg-amber-500'
    },
    { 
      title: 'Study Hours', 
      value: '42h', 
      change: '+5h this week', 
      icon: Clock, 
      color: 'purple',
      bgColor: 'bg-purple-500'
    }
  ];

  const recentActivities = [
    { action: 'Completed Advanced Math Quiz', time: '2 hours ago', score: '95%', type: 'quiz' },
    { action: 'Uploaded Physics Textbook', time: '1 day ago', status: 'Processed', type: 'upload' },
    { action: 'AI Mental Age Analysis', time: '2 days ago', duration: '25 min', type: 'analysis' },
    { action: 'Generated Chemistry Quiz', time: '3 days ago', questions: '15', type: 'generate' }
  ];

  const navigation = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-dark-400 text-lg">Welcome back! Here's your learning overview</p>
        </div>
        <Button className="shadow-lg">
          <Sparkles className="h-5 w-5" />
          Start AI Analysis
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 animate-slide-up" hover style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-dark-400 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                <p className="text-emerald-400 text-sm mt-2 font-medium">{stat.change}</p>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bgColor} bg-opacity-20`}>
                <stat.icon className={`h-8 w-8 text-${stat.color}-400`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-2xl font-semibold text-white mb-6">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl hover:bg-dark-700/50 transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    activity.type === 'quiz' ? 'bg-emerald-500/20' :
                    activity.type === 'upload' ? 'bg-primary-500/20' :
                    activity.type === 'analysis' ? 'bg-purple-500/20' :
                    'bg-amber-500/20'
                  }`}>
                    {activity.type === 'quiz' && <Trophy className="h-5 w-5 text-emerald-400" />}
                    {activity.type === 'upload' && <Upload className="h-5 w-5 text-primary-400" />}
                    {activity.type === 'analysis' && <Brain className="h-5 w-5 text-purple-400" />}
                    {activity.type === 'generate' && <Zap className="h-5 w-5 text-amber-400" />}
                  </div>
                  <div>
                    <p className="text-white font-medium">{activity.action}</p>
                    <p className="text-dark-400 text-sm">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.score && <Badge variant="success">{activity.score}</Badge>}
                  {activity.status && <Badge>{activity.status}</Badge>}
                  {activity.duration && <Badge variant="warning">{activity.duration}</Badge>}
                  {activity.questions && <Badge>{activity.questions} questions</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-2xl font-semibold text-white mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <Button className="w-full justify-start text-left">
              <MessageSquare className="h-5 w-5" />
              Start AI Chat Session
            </Button>
            <Button variant="secondary" className="w-full justify-start text-left">
              <Upload className="h-5 w-5" />
              Upload Study Material
            </Button>
            <Button variant="secondary" className="w-full justify-start text-left">
              <Trophy className="h-5 w-5" />
              Generate New Quiz
            </Button>
            <Button variant="secondary" className="w-full justify-start text-left">
              <BarChart3 className="h-5 w-5" />
              View Progress Report
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'courses':
        return (
          <Card className="p-6">
            <h3 className="text-2xl font-semibold text-white mb-6">All Courses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.slice(0, 3).map((course, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200">
                  <h4 className="text-white font-medium mb-2">{course.title}</h4>
                  <p className="text-dark-400 text-sm mb-3">AI Enhanced Learning</p>
                  <div className="bg-dark-700 rounded-full h-2 mb-2">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full w-3/4"></div>
                  </div>
                  <p className="text-white text-sm">75% Complete</p>
                </div>
              ))}
            </div>
          </Card>
        );
      case 'profile':
        return (
          <Card className="p-6">
            <h3 className="text-2xl font-semibold text-white mb-6">Profile Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-lg">{user.full_name}</h4>
                  <p className="text-dark-400">@{user.username}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-dark-400 text-sm mb-1">Email</label>
                  <p className="text-white">{user.email}</p>
                </div>
                <div>
                  <label className="block text-dark-400 text-sm mb-1">Member Since</label>
                  <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </Card>
        );
      case 'settings':
        return (
          <Card className="p-6">
            <h3 className="text-2xl font-semibold text-white mb-6">Settings</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-medium mb-3">Notifications</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-dark-300">Email notifications</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-dark-300">Course reminders</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900">
      {/* Header */}
      <header className="glass bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white gradient-text">EduMind AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user.full_name}</span>
              <Button onClick={handleLogout} variant="danger" className="px-4 py-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <Card className="p-4">
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'text-dark-300 hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
      <footer className="bg-white/10 backdrop-blur-lg border-t border-white/20 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-dark-400">
          &copy; {new Date().getFullYear()} EduMind AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
    
export default Dashboard;