import { useState, useRef, useEffect } from 'react';
import { Trophy, Clock, BookOpen, CheckCircle, X, Lightbulb, RotateCcw, Brain, Star, Target, Zap } from 'lucide-react';
import { generateQuiz } from '../api/api';

const Quiz = () => {
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
      // Remove axios import and use fetch instead
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

  // Function to transform API response to expected format
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
      // Convert correct answer letter to index
      correct: q.correct_answer.charCodeAt(0) - 65, // 'A' -> 0, 'B' -> 1, etc.
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

      // Handle the actual API response structure
      let questions = [];
      let timeLimit = quizSettings.timeLimit;

      if (data && data.questions && Array.isArray(data.questions)) {
        questions = transformQuestions(data.questions);
      } else if (Array.isArray(data)) {
        // If data is directly an array of questions
        questions = transformQuestions(data);
      }

      // Check for time_limit in response
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
      
      // Submit results with the final score
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">AI Learning Quiz</h1>
          </div>
          <p className="text-blue-200 text-lg">Test your knowledge with our intelligent quiz system</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Quiz Setup Screen */}
          {!quizState.isActive && !quizState.isComplete && (
            <div className="text-center">
              <div className="relative mb-8">
                <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 animate-bounce" />
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Ready for Your Quiz Challenge?</h2>
              <p className="text-blue-200 mb-8 text-lg">Customize your learning experience</p>
              
              {/* Quiz Settings */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Subject Selection */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center mb-4">
                      <BookOpen className="w-6 h-6 text-purple-400 mr-2" />
                      <label className="text-white font-semibold">Subject</label>
                    </div>
                    <select
                      value={quizSettings.subject}
                      onChange={(e) => setQuizSettings(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
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
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center mb-4">
                      <Target className="w-6 h-6 text-orange-400 mr-2" />
                      <label className="text-white font-semibold">Difficulty</label>
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
                              ? 'border-purple-400 bg-purple-500/20'
                              : 'border-white/20 bg-white/5 hover:bg-white/10'
                          }`}>
                            <span className="text-white font-medium">{level.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Question Count */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center mb-4">
                      <Zap className="w-6 h-6 text-blue-400 mr-2" />
                      <label className="text-white font-semibold">Questions</label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[5, 10, 15, 20].map((count) => (
                        <button
                          key={count}
                          onClick={() => setQuizSettings(prev => ({ ...prev, questionCount: count }))}
                          className={`p-3 rounded-lg border transition-all font-medium ${
                            quizSettings.questionCount === count
                              ? 'border-blue-400 bg-blue-500/20 text-blue-300'
                              : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Limit */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center mb-4">
                      <Clock className="w-6 h-6 text-pink-400 mr-2" />
                      <label className="text-white font-semibold">Time Limit</label>
                    </div>
                    <select
                      value={quizSettings.timeLimit}
                      onChange={(e) => setQuizSettings(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all"
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
                <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 flex items-center">
                  <X className="w-6 h-6 mr-3 flex-shrink-0" />
                  <span>{quizState.error}</span>
                </div>
              )}

              {/* Start Button */}
              <button
                onClick={startQuiz}
                disabled={quizState.isLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-4 rounded-full font-bold text-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center mx-auto"
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
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-6"></div>
                  <h3 className="text-2xl font-bold text-white mb-2">Preparing Your Quiz</h3>
                  <p className="text-blue-200">Finding the perfect questions for you...</p>
                </div>
              ) : quizState.error ? (
                <div>
                  <X className="w-16 h-16 text-red-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-red-300 mb-4">Something went wrong</h3>
                  <p className="text-red-200 mb-6">{quizState.error}</p>
                  <button
                    onClick={resetQuiz}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  >
                    <RotateCcw className="w-5 h-5 mr-2 inline" />
                    Try Again
                  </button>
                </div>
              ) : (
                <div>
                  <BookOpen className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">No Questions Available</h3>
                  <p className="text-blue-200 mb-6">Please try different settings</p>
                  <button
                    onClick={resetQuiz}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
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
                <div className="flex items-center text-blue-200">
                  <BookOpen className="w-6 h-6 mr-2" />
                  <span className="text-lg font-medium">
                    Question {quizState.currentQuestion + 1} of {quizQuestions.length}
                  </span>
                </div>
                <div className="flex items-center bg-red-500/20 text-red-300 px-4 py-2 rounded-full border border-red-400/30">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-mono text-lg font-bold">{formatTime(quizState.timeLeft)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-blue-200 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(((quizState.currentQuestion + 1) / quizQuestions.length) * 100)}%</span>
                </div>
                <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 ease-out"
                    style={{ width: `${((quizState.currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white/5 rounded-2xl p-8 mb-8 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-8 leading-relaxed">
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
                              ? 'bg-green-500/20 border-2 border-green-400 text-green-300 shadow-green-400/20 shadow-lg'
                              : isSelected
                              ? 'bg-red-500/20 border-2 border-red-400 text-red-300 shadow-red-400/20 shadow-lg'
                              : 'bg-white/5 border border-white/10 text-blue-200'
                            : 'bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-purple-400/50 cursor-pointer hover:shadow-lg hover:shadow-purple-400/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm font-medium mr-4">
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span className="text-lg font-medium">{option}</span>
                          </div>
                          {showResult && isCorrect && (
                            <CheckCircle className="w-7 h-7 text-green-400 animate-pulse" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <X className="w-7 h-7 text-red-400 animate-pulse" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {userAnswer && currentQuestion.explanation && (
                  <div className="mt-8 p-6 bg-blue-500/20 rounded-xl border border-blue-400/30">
                    <div className="flex items-start">
                      <Lightbulb className="w-6 h-6 text-blue-300 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-blue-200 font-semibold mb-2">Explanation:</p>
                        <p className="text-blue-100 leading-relaxed">{currentQuestion.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Score Display */}
              <div className="text-center">
                <div className="inline-flex items-center bg-white/10 rounded-full px-6 py-3 border border-white/20">
                  <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-white font-medium">
                    Score: <span className="font-bold text-yellow-400">{quizState.score}</span>
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
                <Trophy className="w-32 h-32 text-yellow-400 mx-auto animate-bounce" />
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3">
                  <Star className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h2 className="text-4xl font-bold text-white mb-4">Quiz Complete!</h2>
              <p className="text-2xl text-blue-200 mb-8">
                {getScoreMessage(quizState.score, quizQuestions.length)}
              </p>

              {/* Score Card */}
              <div className="max-w-md mx-auto mb-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-8 border border-white/20">
                <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                  {quizState.score}/{quizQuestions.length}
                </div>
                <div className="text-xl text-white mb-4">
                  {Math.round((quizState.score / quizQuestions.length) * 100)}% Correct
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-blue-200">Time Used</div>
                    <div className="text-white font-medium">
                      {formatTime(quizSettings.timeLimit - quizState.timeLeft)}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-blue-200">Subject</div>
                    <div className="text-white font-medium capitalize">
                      {quizSettings.subject}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetQuiz}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center justify-center"
                >
                  <RotateCcw className="w-6 h-6 mr-3" />
                  Take Another Quiz
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-full font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
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