import { useState, useEffect } from "react";
import {
  Brain, TrendingUp, Sparkles, Trophy, MessageSquare,
  Upload, BarChart3, BookOpen,
  ChevronRight, Award, Flame,
  CheckCircle, Star, Lightbulb, Pencil
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [quizTopic, setQuizTopic] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('Easy');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulated data for demonstration--- has to be replaced with actual API call
      const mockData = {
        username: "Alex",
        user: {
          mental_age: 12,
          intellect_level: "Advanced",
          assessment_progress: "75%"
        },
        quiz_stats: {
          completed_quizzes: 15,
          average_score: 87,
          recent_scores: [92, 88, 95, 85, 90]
        },
        learning_streak: 7,
        homework_stats: {
          completed_homework: 12,
          pending_homework: 3,
          submission_rate: 80
        },
        badges_earned: ["Quick Learner", "Perfect Score", "Week Warrior", "Math Master"],
        recent_activities: [
          {
            type: "quiz",
            description: "Completed Science Quiz",
            timestamp: "2 hours ago",
            points: 50
          },
          {
            type: "homework",
            description: "Submitted Math Homework",
            timestamp: "5 hours ago",
            points: 30
          },
          {
            type: "badge",
            description: "Earned 'Week Warrior' Badge",
            timestamp: "1 day ago",
            points: 100
          },
          {
            type: "assessment",
            description: "Completed Assessment Module",
            timestamp: "2 days ago",
            points: 75
          }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDashboardData(mockData);
      setUserData(mockData.user);
      setUserName(mockData.username);
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

  const handleGenerateQuiz = () => {
    if (!quizTopic.trim()) {
      alert('Please enter a topic for the quiz');
      return;
    }
    console.log(`Generating ${quizDifficulty} quiz on: ${quizTopic}`);
    alert(`Quiz generated! Topic: ${quizTopic}, Difficulty: ${quizDifficulty}`);
    setQuizTopic('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Loading your learning journey...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
     <Header/>

      <div className="container mx-auto px-6 py-8 space-y-6 max-w-7xl">       
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div> 
              <h1 className="text-4xl font-bold mb-2">Hi, {userName}!</h1>
              <p className="text-purple-100 text-lg">Keep up the amazing work! You're doing great!</p>
            </div>
            {userData?.mental_age && (
              <div className="text-center bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-30 min-w-[160px]">
                <Brain className="w-10 h-10 text-white mx-auto mb-3" />
                <p className="text-sm text-purple-100 mb-1">Mental Age</p>
                <p className="text-3xl font-bold mb-3">{userData.mental_age}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getIntellectLevelColor(userData?.intellect_level)}`}>
                  {userData?.intellect_level}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <p className="text-gray-500 text-sm font-medium mb-2">Quizzes Completed</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{dashboardData?.quiz_stats.completed_quizzes || 0}</h2>
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <p className="text-gray-500 text-sm font-medium mb-2">Learning Streak</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{dashboardData?.learning_streak || 0} <span className="text-lg text-gray-500">days</span></h2>
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <p className="text-gray-500 text-sm font-medium mb-2">Average Score</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{dashboardData?.quiz_stats.average_score || 0}%</h2>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <p className="text-gray-500 text-sm font-medium mb-2">Homework Done</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{dashboardData?.homework_stats.completed_homework || 0}</h2>
            <CheckCircle className="w-6 h-6 text-blue-500" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <p className="text-gray-500 text-sm font-medium mb-2">Badges Earned</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{dashboardData?.badges_earned?.length || 0}</h2>
            <Award className="w-6 h-6 text-purple-500" />
          </div>
        </div>

        {/* Assessment Progress */}
        {userData?.assessment_progress !== 'completed' && (
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-[250px]">
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-2">
                  <Brain className="w-6 h-6" />
                  <span>Complete Your Assessment</span>
                </h3>
                <p className="text-blue-100 mb-2">Discover your learning style and intellectual age!</p>
                <p className="text-sm text-blue-200">Progress: {userData?.assessment_progress || '0%'}</p>
              </div>
              <button 
                onClick={() => alert('Navigating to assessment...')}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                {userData?.assessment_progress ? 'Continue' : 'Start Now'} 
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Homework Section */}
        {dashboardData?.homework_stats.pending_homework > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
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
                onClick={() => alert('Navigating to homework...')}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                View All 
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Quiz Generator & Recent Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quiz Generator */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-7 shadow-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <span>Generate Quiz</span>
            </h3>
            <p className="text-gray-400 mb-5">Create a personalized quiz on any topic!</p>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Enter a topic (e.g., Math, Science, History)"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 transition-all"
              />
              <div className="flex gap-3">
                <select 
                  value={quizDifficulty}
                  onChange={(e) => setQuizDifficulty(e.target.value)}
                  className="px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
                <button 
                  onClick={handleGenerateQuiz}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Generate Quiz
                </button>
              </div>
            </div>
          </div>

          {/* Recent Scores */}
          <div className="bg-white rounded-2xl p-7 shadow-lg">
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
          {/* Badges */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-7 shadow-xl">
            <h3 className="text-xl font-semibold mb-5 flex items-center gap-2 text-white">
              <Award className="w-6 h-6" />
              <span>Badges Earned</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {dashboardData?.badges_earned?.map((badge, idx) => (
                <div key={idx} className="bg-white bg-opacity-90 rounded-xl p-5 text-center hover:bg-opacity-100 hover:scale-105 transition-all cursor-pointer">
                  <Trophy className="w-10 h-10 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">{badge}</p>
                </div>
              ))}
              {(!dashboardData?.badges_earned || dashboardData.badges_earned.length === 0) && (
                <div className="col-span-2 text-center py-8">
                  <Trophy className="w-12 h-12 text-white text-opacity-50 mx-auto mb-3" />
                  <p className="text-white">Complete challenges to earn badges!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-7 shadow-lg">
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

        {/* Homework Help Section */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-7 shadow-xl">
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="w-6 h-6" />
            <span>Need Homework Help?</span>
          </h3>
          <p className="text-green-100 mb-5">Upload your homework and get instant help!</p>
          <div className="flex flex-wrap gap-3">
            <button 
              className="flex-1 min-w-[200px] bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
              onClick={() => alert('Upload homework feature coming soon!')}
            >
              <Upload className="w-5 h-5" />
              Upload Homework
            </button>
            <button 
              className="flex-1 min-w-[200px] bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
              onClick={() => alert('AI Tutor chat coming soon!')}
            >
              <MessageSquare className="w-5 h-5" />
              Ask AI Tutor
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer/>
      
    </div>
  );
};

export default Dashboard;