import { useState } from "react";
import { Brain, Zap } from "lucide-react";

const AuthComponent = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      alert(`${isLogin ? 'Login' : 'Registration'} successful!`);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white overflow-hidden flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 hover:border-purple-400/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            mello.ai
          </h1>
          <p className="text-slate-400">
            Learn with artificial intelligence
          </p>
        </div>

        <div className="space-y-6">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Processing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                {isLogin ? "Sign In" : "Create Account"}
              </>
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-200"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;