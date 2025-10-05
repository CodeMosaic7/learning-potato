import { useState, useEffect } from "react";
import {
  Clock, Brain, TrendingUp, Sparkles, Trophy, MessageSquare,
  Upload, BarChart3, Zap, BookOpen, User, Settings, LogOut,
  ChevronRight, Calendar, Target, Award, Flame, Compass,
  CheckCircle, Star, Book, Lightbulb, Pencil
} from "lucide-react";
import Card from "../elements/Card.jsx";
import Button from "../elements/Button.jsx";
import Badge from "../elements/Badge.jsx";
import Header from "../components/Header.jsx";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch complete dashboard data
      const response = await fetch('/api/v1/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setDashboardData(data);
      setUserData(data.user);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getIntellectLevelColor = (level) => {
    const colors = {
      "Beginner": "bg-blue-500/20 text-blue-300 border-blue-400",
      "Intermediate": "bg-green-500/20 text-green-300 border-green-400",
      "Advanced": "bg-purple-500/20 text-purple-300 border-purple-400",
      "Expert": "bg-orange-500/20 text-orange-300 border-orange-400"
    };
    return colors[level] || "bg-gray-500/20 text-gray-300 border-gray-400";
  };

  const getActivityIcon = (type) => {
    const icons = {
      quiz: <BookOpen className="w-5 h-5 text-blue-400" />,
      homework: <Pencil className="w-5 h-5 text-green-400" />,
      badge: <Award className="w-5 h-5 text-yellow-400" />,
      assessment: <Brain className="w-5 h-5 text-purple-400" />
    };
    return icons[type] || <Star className="w-5 h-5 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-800 to-slate-900">
        <div className="text-white text-xl">Loading your learning journey...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-blue-800 to-slate-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl animate-pulse"></div>
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="relative z-10 flex-grow container mx-auto px-6 py-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {userData?.name || 'Learner'}! 🎉</h1>
              <p className="text-gray-300 mt-2">Keep up the amazing work! You're doing great!</p>
            </div>
            {userData?.mental_age && (
              <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Mental Age</p>
                <p className="text-2xl font-bold">{userData.mental_age}</p>
                <Badge className={`mt-2 ${getIntellectLevelColor(userData?.intellect_level)}`}>
                  {userData?.intellect_level}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <p className="text-gray-400 text-sm">Quizzes Completed</p>
            <h2 className="text-2xl font-bold">{dashboardData?.quiz_stats.completed_quizzes || 0}</h2>
            <Trophy className="w-6 h-6 text-yellow-400 mt-2" />
          </Card>
          <Card>
            <p className="text-gray-400 text-sm">Learning Streak</p>
            <h2 className="text-2xl font-bold">{dashboardData?.learning_streak || 0} days</h2>
            <Flame className="w-6 h-6 text-orange-400 mt-2" />
          </Card>
          <Card>
            <p className="text-gray-400 text-sm">Average Score</p>
            <h2 className="text-2xl font-bold">{dashboardData?.quiz_stats.average_score || 0}%</h2>
            <TrendingUp className="w-6 h-6 text-green-400 mt-2" />
          </Card>
          <Card>
            <p className="text-gray-400 text-sm">Homework Done</p>
            <h2 className="text-2xl font-bold">{dashboardData?.homework_stats.completed_homework || 0}</h2>
            <CheckCircle className="w-6 h-6 text-blue-400 mt-2" />
          </Card>
          <Card>
            <p className="text-gray-400 text-sm">Badges Earned</p>
            <h2 className="text-2xl font-bold">{dashboardData?.badges_earned?.length || 0}</h2>
            <Award className="w-6 h-6 text-purple-400 mt-2" />
          </Card>
        </div>

        {/* Assessment Progress */}
        {userData?.assessment_progress !== 'completed' && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span>Complete Your Assessment</span>
                </h3>
                <p className="mt-2 text-gray-300">Discover your learning style and intellectual age!</p>
                <p className="text-sm text-gray-400 mt-1">Progress: {userData?.assessment_progress || '0%'}</p>
              </div>
              <Button onClick={() => window.location.href = '/assessment'}>
                {userData?.assessment_progress ? 'Continue' : 'Start Now'} <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Homework Section */}
        {dashboardData?.homework_stats.pending_homework > 0 && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold flex items-center space-x-2">
                  <Pencil className="w-5 h-5 text-green-400" />
                  <span>Pending Homework</span>
                </h3>
                <p className="mt-2 text-lg">You have {dashboardData.homework_stats.pending_homework} homework assignments to complete</p>
                <div className="mt-3 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-green-400 h-full transition-all duration-500"
                    style={{ width: `${dashboardData.homework_stats.submission_rate}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 mt-1">Submission Rate: {dashboardData.homework_stats.submission_rate}%</p>
              </div>
              <Button onClick={() => window.location.href = '/homework'}>
                View All <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Quiz Generator & Recent Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span>Generate Quiz</span>
            </h3>
            <p className="text-gray-300 mb-4">Create a personalized quiz on any topic!</p>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Enter a topic (e.g., Math, Science, History)"
                className="w-full px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
              />
              <div className="flex gap-2">
                <select className="px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none">
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
                <Button className="flex-1">Generate Quiz</Button>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span>Recent Quiz Scores</span>
            </h3>
            <div className="space-y-3">
              {dashboardData?.quiz_stats.recent_scores?.map((score, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <span>Quiz #{dashboardData.quiz_stats.completed_quizzes - idx}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="font-bold text-lg">{score}%</p>
                    </div>
                    {score >= 90 ? <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> : null}
                  </div>
                </div>
              ))}
              {(!dashboardData?.quiz_stats.recent_scores || dashboardData.quiz_stats.recent_scores.length === 0) && (
                <p className="text-gray-400 text-center py-4">No quizzes completed yet. Start your first quiz!</p>
              )}
            </div>
          </Card>
        </div>

        {/* Badges & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span>Badges Earned</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {dashboardData?.badges_earned?.map((badge, idx) => (
                <div key={idx} className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30 text-center">
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold">{badge}</p>
                </div>
              ))}
              {(!dashboardData?.badges_earned || dashboardData.badges_earned.length === 0) && (
                <div className="col-span-2 text-gray-400 text-center py-4">
                  <p>Complete challenges to earn badges! 🏆</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-green-400" />
              <span>Recent Activity</span>
            </h3>
            <ul className="space-y-3">
              {dashboardData?.recent_activities?.map((activity, idx) => (
                <li key={idx} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-400">{activity.timestamp}</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300">
                    +{activity.points} XP
                  </Badge>
                </li>
              ))}
              {(!dashboardData?.recent_activities || dashboardData.recent_activities.length === 0) && (
                <p className="text-gray-400 text-center py-4">No recent activity. Start learning!</p>
              )}
            </ul>
          </Card>
        </div>

        {/* Homework Help Section */}
        <Card>
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <span>Need Homework Help?</span>
          </h3>
          <p className="text-gray-300 mb-4">Upload your homework and get instant help!</p>
          <div className="flex gap-4">
            <Button className="flex-1" onClick={() => window.location.href = '/homework-help'}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Homework
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/ai-tutor'}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Ask AI Tutor
            </Button>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="z-10 container mx-auto px-6 py-12 border-t border-purple-500/30">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Kids Learning Platform
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
          © 2025 Kids Learning Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;