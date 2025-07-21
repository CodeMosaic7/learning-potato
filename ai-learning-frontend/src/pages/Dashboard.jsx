import {Clock,Brain,TrendingUp,Sparkles,Trophy,MessageSquare,Upload,BarChart3,Zap} from 'lucide-react';
import Card from '../elements/Card.jsx'
import Button from '../elements/Button.jsx'
import Input from '../elements/Input.jsx';
import Badge from '../elements/Badge.jsx'

const Dashboard = () => {

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

  return (
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
};

export default Dashboard;