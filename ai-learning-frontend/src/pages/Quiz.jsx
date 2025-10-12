import { useState, useRef, useEffect } from 'react';
import { Trophy, Clock, BookOpen, CheckCircle, X, Lightbulb, RotateCcw, Brain, Star, Target, Zap } from 'lucide-react';
import { generateQuiz } from '../api/api';
import { useNavigate } from 'react-router-dom';

const Quiz = () => {
  const navigate = useNavigate();
  const [userData, setUser] = useState(null);
  useEffect(() => {
      const userData = sessionStorage.getItem('user_data');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        navigate('/');
      }
    }, [navigate]);
  const [quizState, setQuizState] = useState({
    currentQuestion: 0,
    score: 0,
    answers: [],
    isComplete: false,
    timeLeft: 300,
    isActive: false,
    isLoading: false,
    error: null
  });

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizSettings, setQuizSettings] = useState({
    subject: 'general',
    difficulty: 'medium',
    questionCount: 5,
    timeLimit: 300,
    mentalAge: 10
  });

  const timerRef = useRef(null);

  useEffect(() => {
    if (quizState.isActive && quizState.timeLeft > 0 && !quizState.isComplete) {
      timerRef.current = setInterval(() => {
        setQuizState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (quizState.timeLeft === 0 && quizState.isActive) {
      handleQuizComplete();
    }

    return () => clearInterval(timerRef.current);
  }, [quizState.isActive, quizState.timeLeft, quizState.isComplete]);

  const submitQuizResults = async (results) => {
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: quizSettings.subject,
          difficulty: quizSettings.difficulty,
          score: results.score,
          totalQuestions: quizQuestions.length,
          answers: results.answers,
          timeSpent: quizSettings.timeLimit - quizState.timeLeft,
          completedAt: new Date().toISOString()
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Quiz results submitted successfully:', data);
      }
    } catch (error) {
      console.error('Failed to submit quiz results:', error.message);
    }
  };

  const transformQuestions = (apiQuestions) => {
    return apiQuestions.map(q => ({
      id: q.id,
      question: q.question,
      options: [
        q.options.A,
        q.options.B,
        q.options.C,
        q.options.D
      ],
      correct: q.correct_answer.charCodeAt(0) - 65,
      explanation: q.explanation || null
    }));
  };

  const startQuiz = async () => {
    setQuizState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await generateQuiz(
        quizSettings.mentalAge,
        quizSettings.subject,
        quizSettings.timeLimit,
        quizSettings.questionCount
      );
      
      console.log('API Response:', data);

      let questions = [];
      let timeLimit = quizSettings.timeLimit;

      if (data && data.questions && Array.isArray(data.questions)) {
        questions = transformQuestions(data.questions);
      } else if (Array.isArray(data)) {
        questions = transformQuestions(data);
      }

      if (data.time_limit) {
        timeLimit = data.time_limit;
        setQuizSettings(prev => ({ ...prev, timeLimit: data.time_limit }));
      }

      if (questions.length === 0) {
        throw new Error('No questions received from API');
      }

      setQuizQuestions(questions);
      setQuizState(prev => ({
        ...prev,
        currentQuestion: 0,
        score: 0,
        answers: [],
        isComplete: false,
        timeLeft: timeLimit,
        isActive: true,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error starting quiz:', error);
      setQuizState(prev => ({
        ...prev,
        error: error.message || 'Failed to load quiz questions',
        isLoading: false
      }));
    }
  };

  const handleQuizAnswer = (selectedOption) => {
    const currentQ = quizQuestions[quizState.currentQuestion];
    const isCorrect = selectedOption === currentQ.correct;

    setQuizState(prev => {
      const newAnswers = [
        ...prev.answers,
        {
          questionId: currentQ.id,
          selected: selectedOption,
          correct: isCorrect
        }
      ];

      const nextQuestion = prev.currentQuestion + 1;

      const updatedState = {
        ...prev,
        answers: newAnswers,
        score: isCorrect ? prev.score + 1 : prev.score
      };

      if (nextQuestion < quizQuestions.length) {
        return {
          ...updatedState,
          currentQuestion: nextQuestion
        };
      } else {
        setTimeout(() => handleQuizComplete(), 100);
        return updatedState;
      }
    });
  };

  const handleQuizComplete = () => {
    setQuizState(prev => {
      const finalState = {
        ...prev,
        isComplete: true,
        isActive: false
      };
      
      submitQuizResults({
        score: finalState.score,
        answers: finalState.answers
      });
      
      return finalState;
    });
    clearInterval(timerRef.current);
  };

  const resetQuiz = () => {
    clearInterval(timerRef.current);
    setQuizState({
      currentQuestion: 0,
      score: 0,
      answers: [],
      isComplete: false,
      timeLeft: quizSettings.timeLimit,
      isActive: false,
      isLoading: false,
      error: null
    });
    setQuizQuestions([]);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreMessage = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage === 100) return "🎉 Perfect Score! Outstanding!";
    if (percentage >= 80) return "🌟 Excellent Work!";
    if (percentage >= 70) return "👏 Great Job!";
    if (percentage >= 60) return "👍 Good Effort!";
    return "💪 Keep Practicing!";
  };

  const currentQuestion = quizQuestions[quizState.currentQuestion];
  const userAnswer = quizState.answers.find(a => a.questionId === currentQuestion?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black-100 to-slate-900 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-purple-500 mr-3" />
            <h1 className="text-4xl font-bold text-white">AI Learning Quiz</h1>
          </div>
          <p className="text-gray-400 text-lg">Test your knowledge with our intelligent quiz system</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
          {/* Quiz Setup Screen */}
          {!quizState.isActive && !quizState.isComplete && (
            <div className="text-center">
              <div className="relative mb-8">
                <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
                <div className="absolute -top-2 -right-2 bg-black rounded-full p-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready for Your Quiz Challenge?</h2>
              <p className="text-gray-600 mb-8 text-lg">Customize your learning experience</p>
              
              {/* Quiz Settings */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Subject Selection */}
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <BookOpen className="w-6 h-6 text-purple-500 mr-2" />
                      <label className="text-gray-900 font-semibold">Subject</label>
                    </div>
                    <select
                      value={quizSettings.subject}
                      onChange={(e) => setQuizSettings(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    >
                      <option value="general">🌍 General Knowledge</option>
                      <option value="math">🔢 Mathematics</option>
                      <option value="science">🔬 Science</option>
                      <option value="history">📚 History</option>
                      <option value="english">📝 English</option>
                      <option value="geography">🗺️ Geography</option>
                      <option value="technology">💻 Technology</option>
                      <option value="sports">⚽ Sports</option>
                    </select>
                  </div>

                  {/* Difficulty Selection */}
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <Target className="w-6 h-6 text-orange-500 mr-2" />
                      <label className="text-gray-900 font-semibold">Difficulty</label>
                    </div>
                    <div className="space-y-3">
                      {[
                        { value: 'easy', label: '🟢 Easy', color: 'green' },
                        { value: 'medium', label: '🟡 Medium', color: 'yellow' },
                        { value: 'hard', label: '🔴 Hard', color: 'red' }
                      ].map((level) => (
                        <label key={level.value} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="difficulty"
                            value={level.value}
                            checked={quizSettings.difficulty === level.value}
                            onChange={(e) => setQuizSettings(prev => ({ ...prev, difficulty: e.target.value }))}
                            className="sr-only"
                          />
                          <div className={`w-full p-3 rounded-lg border transition-all ${
                            quizSettings.difficulty === level.value
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-300 bg-white hover:bg-gray-50'
                          }`}>
                            <span className="text-gray-900 font-medium">{level.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Question Count */}
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <Zap className="w-6 h-6 text-blue-500 mr-2" />
                      <label className="text-gray-900 font-semibold">Questions</label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[5, 10, 15, 20].map((count) => (
                        <button
                          key={count}
                          onClick={() => setQuizSettings(prev => ({ ...prev, questionCount: count }))}
                          className={`p-3 rounded-lg border transition-all font-medium ${
                            quizSettings.questionCount === count
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Limit */}
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <Clock className="w-6 h-6 text-pink-500 mr-2" />
                      <label className="text-gray-900 font-semibold">Time Limit</label>
                    </div>
                    <select
                      value={quizSettings.timeLimit}
                      onChange={(e) => setQuizSettings(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                    >
                      <option value={180}>⏱️ 3 Minutes</option>
                      <option value={300}>⏱️ 5 Minutes</option>
                      <option value={600}>⏱️ 10 Minutes</option>
                      <option value={900}>⏱️ 15 Minutes</option>
                      <option value={1800}>⏱️ 30 Minutes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {quizState.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-xl text-red-700 flex items-center">
                  <X className="w-6 h-6 mr-3 flex-shrink-0" />
                  <span>{quizState.error}</span>
                </div>
              )}

              {/* Start Button */}
              <button
                onClick={startQuiz}
                disabled={quizState.isLoading}
                className="bg-black text-white px-12 py-4 rounded-full font-bold text-xl hover:bg-gray-800 transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center mx-auto"
              >
                {quizState.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Loading Questions...
                  </>
                ) : (
                  <>
                    <Trophy className="w-6 h-6 mr-3" />
                    Start Quiz Challenge
                  </>
                )}
              </button>
            </div>
          )}

          {/* Loading State */}
          {quizState.isActive && quizQuestions.length === 0 && (
            <div className="text-center py-12">
              {quizState.isLoading ? (
                <div>
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-6"></div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Preparing Your Quiz</h3>
                  <p className="text-gray-600">Finding the perfect questions for you...</p>
                </div>
              ) : quizState.error ? (
                <div>
                  <X className="w-16 h-16 text-red-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-red-700 mb-4">Something went wrong</h3>
                  <p className="text-red-600 mb-6">{quizState.error}</p>
                  <button
                    onClick={resetQuiz}
                    className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-all duration-300"
                  >
                    <RotateCcw className="w-5 h-5 mr-2 inline" />
                    Try Again
                  </button>
                </div>
              ) : (
                <div>
                  <BookOpen className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No Questions Available</h3>
                  <p className="text-gray-600 mb-6">Please try different settings</p>
                  <button
                    onClick={resetQuiz}
                    className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-all duration-300"
                  >
                    Back to Settings
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Active Quiz */}
          {quizState.isActive && !quizState.isComplete && quizQuestions.length > 0 && (
            <div>
              {/* Quiz Header */}
              <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div className="flex items-center text-gray-700">
                  <BookOpen className="w-6 h-6 mr-2" />
                  <span className="text-lg font-medium">
                    Question {quizState.currentQuestion + 1} of {quizQuestions.length}
                  </span>
                </div>
                <div className="flex items-center bg-red-50 text-red-700 px-4 py-2 rounded-full border border-red-300">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-mono text-lg font-bold">{formatTime(quizState.timeLeft)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(((quizState.currentQuestion + 1) / quizQuestions.length) * 100)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 ease-out"
                    style={{ width: `${((quizState.currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-gray-50 rounded-2xl p-8 mb-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
                  {currentQuestion.question}
                </h3>
                
                <div className="grid gap-4">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = userAnswer?.selected === index;
                    const isCorrect = index === currentQuestion.correct;
                    const showResult = userAnswer !== undefined;

                    return (
                      <button
                        key={index}
                        onClick={() => !showResult && handleQuizAnswer(index)}
                        disabled={showResult}
                        className={`p-5 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                          showResult
                            ? isCorrect
                              ? 'bg-green-50 border-2 border-green-500 text-green-700 shadow-lg'
                              : isSelected
                              ? 'bg-red-50 border-2 border-red-500 text-red-700 shadow-lg'
                              : 'bg-gray-50 border border-gray-300 text-gray-600'
                            : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-purple-500 cursor-pointer hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium mr-4">
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span className="text-lg font-medium">{option}</span>
                          </div>
                          {showResult && isCorrect && (
                            <CheckCircle className="w-7 h-7 text-green-500" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <X className="w-7 h-7 text-red-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {userAnswer && currentQuestion.explanation && (
                  <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-300">
                    <div className="flex items-start">
                      <Lightbulb className="w-6 h-6 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-blue-900 font-semibold mb-2">Explanation:</p>
                        <p className="text-blue-800 leading-relaxed">{currentQuestion.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Score Display */}
              <div className="text-center">
                <div className="inline-flex items-center bg-gray-50 rounded-full px-6 py-3 border border-gray-300">
                  <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-gray-900 font-medium">
                    Score: <span className="font-bold text-yellow-600">{quizState.score}</span>
                    /{quizQuestions.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Complete */}
          {quizState.isComplete && (
            <div className="text-center py-8">
              <div className="relative mb-8">
                <Trophy className="w-32 h-32 text-yellow-500 mx-auto" />
                <div className="absolute -top-4 -right-4 bg-black rounded-full p-3">
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Quiz Complete!</h2>
              <p className="text-2xl text-gray-700 mb-8">
                {getScoreMessage(quizState.score, quizQuestions.length)}
              </p>

              {/* Score Card */}
              <div className="max-w-md mx-auto mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-300">
                <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                  {quizState.score}/{quizQuestions.length}
                </div>
                <div className="text-xl text-gray-900 mb-4">
                  {Math.round((quizState.score / quizQuestions.length) * 100)}% Correct
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-gray-600">Time Used</div>
                    <div className="text-gray-900 font-medium">
                      {formatTime(quizSettings.timeLimit - quizState.timeLeft)}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-gray-600">Subject</div>
                    <div className="text-gray-900 font-medium capitalize">
                      {quizSettings.subject}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetQuiz}
                  className="bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center justify-center"
                >
                  <RotateCcw className="w-6 h-6 mr-3" />
                  Take Another Quiz
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-white border-2 border-gray-300 text-gray-900 px-8 py-4 rounded-full font-medium hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
                >
                  <BookOpen className="w-6 h-6 mr-3" />
                  Back to Learning
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;