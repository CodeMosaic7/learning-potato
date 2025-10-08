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
      "Beginner": "bg-blue-100 text-blue-700 border border-blue-300",
      "Intermediate": "bg-green-100 text-green-700 border border-green-300",
      "Advanced": "bg-purple-100 text-purple-700 border border-purple-300",
      "Expert": "bg-orange-100 text-orange-700 border border-orange-300"
    };
    return colors[level] || "bg-gray-100 text-gray-700 border border-gray-300";
  };

  const getActivityIcon = (type) => {
    const icons = {
      quiz: <BookOpen className="w-5 h-5 text-blue-500" />,
      homework: <Pencil className="w-5 h-5 text-green-500" />,
      badge: <Award className="w-5 h-5 text-yellow-500" />,
      assessment: <Brain className="w-5 h-5 text-purple-500" />
    };
    return icons[type] || <Star className="w-5 h-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-900 text-xl font-medium">Loading your learning journey...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black-100 to-slate-900 text-white overflow-hidden">
      <Header />

      <div className="flex-grow container mx-auto px-6 py-8 space-y-6 max-w-7xl">
        
        {/* Welcome Section - Black Card */}
        <div className="bg-black rounded-3xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div> 
              <h1 className="text-4xl font-bold mb-2">Hi, {userData?.name || 'User'}!</h1>
              <p className="text-gray-400 text-lg">Keep up the amazing work! You're doing great!</p>
            </div>
            {userData?.mental_age && (
              <div className="text-center bg-gray-900 rounded-2xl p-6 border border-gray-800 min-w-[160px]">
                <Brain className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                <p className="text-sm text-gray-400 mb-1">Mental Age</p>
                <p className="text-3xl font-bold mb-3">{userData.mental_age}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getIntellectLevelColor(userData?.intellect_level)}`}>
                  {userData?.intellect_level}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Key Stats - White Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-sm font-medium mb-2">Quizzes Completed</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{dashboardData?.quiz_stats.completed_quizzes || 0}</h2>
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-sm font-medium mb-2">Learning Streak</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{dashboardData?.learning_streak || 0} <span className="text-lg text-gray-500">days</span></h2>
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-sm font-medium mb-2">Average Score</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{dashboardData?.quiz_stats.average_score || 0}%</h2>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-sm font-medium mb-2">Homework Done</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{dashboardData?.homework_stats.completed_homework || 0}</h2>
            <CheckCircle className="w-6 h-6 text-blue-500" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-sm font-medium mb-2">Badges Earned</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{dashboardData?.badges_earned?.length || 0}</h2>
            <Award className="w-6 h-6 text-purple-500" />
          </div>
        </div>

        {/* Assessment Progress */}
        {userData?.assessment_progress !== 'completed' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-[250px]">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-900 mb-2">
                  <Brain className="w-6 h-6 text-purple-500" />
                  <span>Complete Your Assessment</span>
                </h3>
                <p className="text-gray-600 mb-2">Discover your learning style and intellectual age!</p>
                <p className="text-sm text-gray-500">Progress: {userData?.assessment_progress || '0%'}</p>
              </div>
              <button 
                onClick={() => window.location.href = '/assessment'}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                {userData?.assessment_progress ? 'Continue' : 'Start Now'} 
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Homework Section */}
        {dashboardData?.homework_stats.pending_homework > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-[250px]">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-900 mb-2">
                  <Pencil className="w-6 h-6 text-green-500" />
                  <span>Pending Homework</span>
                </h3>
                <p className="text-lg text-gray-700 mb-3">You have <span className="font-semibold">{dashboardData.homework_stats.pending_homework}</span> homework assignments to complete</p>
                <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden mb-2">
                  <div 
                    className="bg-green-500 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${dashboardData.homework_stats.submission_rate}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">Submission Rate: {dashboardData.homework_stats.submission_rate}%</p>
              </div>
              <button 
                onClick={() => window.location.href = '/homework'}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                View All 
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Quiz Generator & Recent Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quiz Generator - Black Card */}
          <div className="bg-black rounded-2xl p-7 shadow-xl text-white">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <span>Generate Quiz</span>
            </h3>
            <p className="text-gray-400 mb-5">Create a personalized quiz on any topic!</p>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Enter a topic (e.g., Math, Science, History)"
                className="w-full px-4 py-3 bg-gray-900 rounded-xl border border-gray-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-500 transition-all"
              />
              <div className="flex gap-3">
                <select className="px-4 py-3 bg-gray-900 rounded-xl border border-gray-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-white transition-all">
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
                <button className="flex-1 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                  Generate Quiz
                </button>
              </div>
            </div>
          </div>

          {/* Recent Scores - White Card */}
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-900">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              <span>Recent Quiz Scores</span>
            </h3>
            <div className="space-y-3">
              {dashboardData?.quiz_stats.recent_scores?.map((score, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                      {idx + 1}
                    </div>
                    <span className="text-gray-900 font-medium">Quiz #{dashboardData.quiz_stats.completed_quizzes - idx}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xl text-gray-900">{score}%</p>
                    {score >= 90 && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                  </div>
                </div>
              ))}
              {(!dashboardData?.quiz_stats.recent_scores || dashboardData.quiz_stats.recent_scores.length === 0) && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No quizzes completed yet. Start your first quiz!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Badges & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Badges - White Card */}
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-900">
              <Award className="w-6 h-6 text-yellow-500" />
              <span>Badges Earned</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {dashboardData?.badges_earned?.map((badge, idx) => (
                <div key={idx} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-200 text-center hover:shadow-md transition-all cursor-pointer">
                  <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">{badge}</p>
                </div>
              ))}
              {(!dashboardData?.badges_earned || dashboardData.badges_earned.length === 0) && (
                <div className="col-span-2 text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Complete challenges to earn badges!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity - White Card */}
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-900">
              <MessageSquare className="w-6 h-6 text-green-500" />
              <span>Recent Activity</span>
            </h3>
            <ul className="space-y-3">
              {dashboardData?.recent_activities?.map((activity, idx) => (
                <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                  <span className="ml-3 bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0">
                    +{activity.points} XP
                  </span>
                </li>
              ))}
              {(!dashboardData?.recent_activities || dashboardData.recent_activities.length === 0) && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity. Start learning!</p>
                </div>
              )}
            </ul>
          </div>
        </div>

        {/* Homework Help Section - White Card */}
        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-gray-900">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <span>Need Homework Help?</span>
          </h3>
          <p className="text-gray-600 mb-5">Upload your homework and get instant help!</p>
          <div className="flex flex-wrap gap-3">
            <button 
              className="flex-1 min-w-[200px] bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              onClick={() => window.location.href = '/homework-help'}
            >
              <Upload className="w-5 h-5" />
              Upload Homework
            </button>
            <button 
              className="flex-1 min-w-[200px] bg-white text-gray-900 border-2 border-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              onClick={() => window.location.href = '/ai-tutor'}
            >
              <MessageSquare className="w-5 h-5" />
              Ask AI Tutor
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-gray-200 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold text-gray-900">
              Kids Learning Platform
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-gray-600">
            <a href="#" className="hover:text-purple-500 transition-colors font-medium">Privacy</a>
            <a href="#" className="hover:text-purple-500 transition-colors font-medium">Terms</a>
            <a href="#" className="hover:text-purple-500 transition-colors font-medium">Support</a>
            <a href="#" className="hover:text-purple-500 transition-colors font-medium">Contact</a>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-8 text-sm">
          © 2025 Kids Learning Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;