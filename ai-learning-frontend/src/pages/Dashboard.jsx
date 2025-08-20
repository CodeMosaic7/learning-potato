// rebuild dashboard
import { useState, useEffect } from 'react';
import {
  Clock, Brain, TrendingUp, Sparkles, Trophy, MessageSquare,
  Upload, BarChart3, Zap, BookOpen, User, Settings, LogOut,
  ChevronRight, Calendar, Target, Award
} from 'lucide-react';
import Card from '../elements/Card.jsx'
import Button from '../elements/Button.jsx'
import Badge from '../elements/Badge.jsx'

const StatCard = ({ stat, index }) => (
  <Card 
    className="p-6 hover:scale-105 transition-transform duration-300" 
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
        <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
        <p className="text-green-400 text-sm mt-2 font-medium">{stat.change}</p>
      </div>
      <div className={`p-4 rounded-2xl ${stat.bgColor} bg-opacity-20 backdrop-blur-sm`}>
        <stat.icon className={`h-8 w-8 text-${stat.color}-400`} />
      </div>
    </div>
  </Card>
);

const ActivityItem = ({ activity, index }) => {
  const getActivityConfig = (type) => {
    const configs = {
      quiz: { icon: Trophy, color: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
      upload: { icon: Upload, color: 'bg-blue-500/20', iconColor: 'text-blue-400' },
      analysis: { icon: Brain, color: 'bg-purple-500/20', iconColor: 'text-purple-400' },
      generate: { icon: Zap, color: 'bg-amber-500/20', iconColor: 'text-amber-400' }
    };
    return configs[type] || configs.quiz;
  };

  const config = getActivityConfig(activity.type);
  const IconComponent = config.icon;

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200 group">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${config.color} group-hover:scale-110 transition-transform duration-200`}>
          <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div>
          <p className="text-white font-medium">{activity.action}</p>
          <p className="text-gray-400 text-sm">{activity.time}</p>
        </div>
      </div>
      <div className="text-right">
        {activity.score && <Badge variant="success">{activity.score}</Badge>}
        {activity.status && <Badge>{activity.status}</Badge>}
        {activity.duration && <Badge variant="warning">{activity.duration}</Badge>}
        {activity.questions && <Badge>{activity.questions} questions</Badge>}
      </div>
    </div>
  );
};

const QuickActionCard = ({ icon: Icon, title, description, onClick, variant = "secondary" }) => (
  <Button variant={variant} className="w-full p-4 h-auto flex-col items-start text-left" onClick={onClick}>
    <div className="flex items-center gap-3 w-full">
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div>
        <p className="font-medium">{title}</p>
        {description && <p className="text-xs opacity-75 mt-1">{description}</p>}
      </div>
      <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
    </div>
  </Button>
);

const ProgressChart = ({ courses }) => (
  <Card className="p-6">
    <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
      <Target className="h-6 w-6" />
      Learning Progress
    </h3>
    <div className="space-y-4">
      {courses.map((course, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white font-medium">{course.name}</span>
            <span className="text-sm text-gray-400">{course.progress}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000 ease-out"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </Card>
);



const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState({
    full_name: 'Alex Johnsonconst StatCard = ({ stat, index }) => (
  <Card 
    className="p-6 hover:scale-105 transition-transform duration-300",
    style={{ animationDelay: `${index * 100}ms` }}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
        <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
        <p className="text-green-400 text-sm mt-2 font-medium">{stat.change}</p>
      </div>
      <div className={`p-4 rounded-2xl ${stat.bgColor} bg-opacity-20 backdrop-blur-sm`}>
        <stat.icon className={`h-8 w-8 text-${stat.color}-400`} />
      </div>
    </div>
  </Card>
);

const ActivityItem = ({ activity, index }) => {
  const getActivityConfig = (type) => {
    const configs = {
      quiz: { icon: Trophy, color: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
      upload: { icon: Upload, color: 'bg-blue-500/20', iconColor: 'text-blue-400' },
      analysis: { icon: Brain, color: 'bg-purple-500/20', iconColor: 'text-purple-400' },
      generate: { icon: Zap, color: 'bg-amber-500/20', iconColor: 'text-amber-400' }
    };
    return configs[type] || configs.quiz;
  };

  const config = getActivityConfig(activity.type);
  const IconComponent = config.icon;

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200 group">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${config.color} group-hover:scale-110 transition-transform duration-200`}>
          <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div>
          <p className="text-white font-medium">{activity.action}</p>
          <p className="text-gray-400 text-sm">{activity.time}</p>
        </div>
      </div>
      <div className="text-right">
        {activity.score && <Badge variant="success">{activity.score}</Badge>}
        {activity.status && <Badge>{activity.status}</Badge>}
        {activity.duration && <Badge variant="warning">{activity.duration}</Badge>}
        {activity.questions && <Badge>{activity.questions} questions</Badge>}
      </div>
    </div>
  );
};

const QuickActionCard = ({ icon: Icon, title, description, onClick, variant = "secondary" }) => (
  <Button variant={variant} className="w-full p-4 h-auto flex-col items-start text-left" onClick={onClick}>
    <div className="flex items-center gap-3 w-full">
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div>
        <p className="font-medium">{title}</p>
        {description && <p className="text-xs opacity-75 mt-1">{description}</p>}
      </div>
      <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
    </div>
  </Button>
);

const ProgressChart = ({ courses }) => (
  <Card className="p-6">
    <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
      <Target className="h-6 w-6" />
      Learning Progress
    </h3>
    <div className="space-y-4">
      {courses.map((course, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white font-medium">{course.name}</span>
            <span className="text-sm text-gray-400">{course.progress}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000 ease-out"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </Card>
);
',
    username: 'alexj',
    email: 'alex@example.com',
    created_at: '2024-01-15T00:00:00Z'
  });

  // Mock data
  const stats = [
    { 
      title: 'Mental Age Analysis', 
      value: '16.5 years', 
      change: '+0.5 this month', 
      icon: Brain, 
      color: 'blue',
      bgColor: 'bg-blue-500'
    },
    { 
      title: 'Learning Progress', 
      value: '78%', 
      change: '+12% this week', 
      icon: TrendingUp, 
      color: 'green',
      bgColor: 'bg-green-500'
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

  const courses = [
    { name: 'Advanced Mathematics', progress: 85 },
    { name: 'Physics Fundamentals', progress: 72 },
    { name: 'Chemistry Basics', progress: 91 },
    { name: 'Biology Essentials', progress: 45 }
  ];

  const navigation = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const quickActions = [
    {
      icon: MessageSquare,
      title: 'Start AI Chat Session',
      description: 'Get personalized learning assistance',
      onClick: () => console.log('Starting AI chat')
    },
    {
      icon: Upload,
      title: 'Upload Study Material',
      description: 'Add new books or documents',
      onClick: () => console.log('Uploading material')
    },
    {
      icon: Trophy,
      title: 'Generate New Quiz',
      description: 'Create practice questions',
      onClick: () => console.log('Generating quiz')
    },
    {
      icon: BarChart3,
      title: 'View Progress Report',
      description: 'See detailed analytics',
      onClick: () => setActiveTab('analytics')
    }
  ];

  const handleLogout = () => {
    console.log('Logging out...');
  };

  // Tab Content Renderers
  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Welcome back, {user.full_name.split(' ')[0]}!
          </h1>
          <p className="text-gray-400 text-lg">Here's your learning journey at a glance</p>
        </div>
        <Button className="shadow-lg hover:shadow-xl">
          <Sparkles className="h-5 w-5" />
          Start AI Analysis
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} index={index} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Recent Activities
            </h3>
            <Button variant="ghost" className="text-sm">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <ActivityItem key={index} activity={activity} index={index} />
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                icon={action.icon}
                title={action.title}
                description={action.description}
                onClick={action.onClick}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Learning Progress Chart */}
      <ProgressChart courses={courses} />
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">My Courses</h2>
        <Button>
          <BookOpen className="h-5 w-5" />
          Browse Catalog
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <Card key={index} className="p-6 hover:scale-105 transition-transform duration-300">
            <div className="mb-4">
              <h4 className="text-white font-semibold text-lg mb-2">{course.name}</h4>
              <p className="text-gray-400 text-sm mb-3">AI Enhanced Learning Path</p>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-medium">{course.progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
            
            <Button variant="secondary" className="w-full">
              Continue Learning
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <Card className="p-6">
      <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        Learning Analytics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-white font-medium">Weekly Study Time</h4>
          <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Chart visualization would go here</p>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-white font-medium">Performance Trends</h4>
          <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Performance chart would go here</p>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderProfile = () => (
    <Card className="p-6">
      <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
        <User className="h-6 w-6" />
        Profile Information
      </h3>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-white" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-xl">{user.full_name}</h4>
            <p className="text-gray-400">@{user.username}</p>
            <div className="flex items-center gap-2 mt-2">
              <Award className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-gray-300">Advanced Learner</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Email Address</label>
              <p className="text-white">{user.email}</p>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Member Since</label>
              <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Learning Streak</label>
              <p className="text-white">15 days</p>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Total Points</label>
              <p className="text-white">2,450 XP</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderSettings = () => (
    <Card className="p-6">
      <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
        <Settings className="h-6 w-6" />
        Settings & Preferences
      </h3>
      <div className="space-y-8">
        <div>
          <h4 className="text-white font-medium mb-4">Notifications</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Email notifications</span>
              <input type="checkbox" className="rounded bg-white/10 border-white/20" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Course reminders</span>
              <input type="checkbox" className="rounded bg-white/10 border-white/20" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Weekly progress reports</span>
              <input type="checkbox" className="rounded bg-white/10 border-white/20" />
            </label>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-medium mb-4">Learning Preferences</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Preferred Study Time</label>
              <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                <option>Morning (6AM - 12PM)</option>
                <option>Afternoon (12PM - 6PM)</option>
                <option>Evening (6PM - 12AM)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'courses': return renderCourses();
      case 'analytics': return renderAnalytics();
      case 'profile': return renderProfile();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                EduMind AI
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white hidden sm:inline">Welcome, {user.full_name.split(' ')[0]}</span>
              <Button onClick={handleLogout} variant="danger" className="px-4 py-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <Card className="p-4 sticky top-24">
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
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

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-lg border-t border-white/20 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} EduMind AI. Empowering minds through intelligent learning.</p>
        </div>
      </footer>
    </div>
    );
};

export default Dashboard;