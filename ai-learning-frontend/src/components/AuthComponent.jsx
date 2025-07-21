import { useState } from "react";
import Card from "../elements/Card.jsx";
import Input from "../elements/Input.jsx";
import Button from "../elements/Button.jsx";
import { Brain, Zap } from "lucide-react";
import { registerUser, loginUser, getCurrentUser } from "../api/api.js";

const AuthComponent = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;

      if (isLogin) {
        response = await loginUser(formData.email, formData.password);
      } else {
        response = await registerUser(
          formData.full_name,
          formData.email,
          formData.username,
          formData.password
        );
      }

      const user = await getCurrentUser();

      if (user) {
        onLogin(user); // pass user to parent
      } else {
        alert("Login successful but failed to fetch user profile.");
      }
    } catch (error) {
      console.error("Authentication Error:", error);
      alert(
        error?.response?.data?.detail ||
          error?.message ||
          "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="p-8 glass">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl">
                <Brain className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 gradient-text">
              EduMind AI
            </h1>
            <p className="text-dark-400">
              Learn with artificial intelligence
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                />
                <Input
                  label="Username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
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
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors duration-200"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthComponent;
