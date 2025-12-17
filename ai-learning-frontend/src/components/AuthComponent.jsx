import { useState } from "react";
import { Brain, Zap, Upload, X } from "lucide-react";
import { registerUser, loginUser } from "../api/api"; 
import { useNavigate } from "react-router-dom";

const AuthComponent = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    username: "",
    password: "",
    date_of_birth: "",
    gender: "",
    grade_level: "",
    profile_image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, GIF, or WebP)');
        return;
      }
      
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setFormData({ ...formData, profile_image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setFormData({ ...formData, profile_image: null });
    setImagePreview(null);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (isLogin) {
      loginUser(formData.email, formData.password)
        .then((response) => {
          if (response.success) {
            setTimeout(() => {
              alert('Login successful!');
              setIsLoading(false);
              navigate('/dashboard');
            }, 1500);
          } else {
            alert('Login failed. Please check your credentials.');
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error('Login error:', error);
          alert('An error occurred during login.');
          setIsLoading(false);
        });
    } else {
      registerUser(
        formData.email, 
        formData.username, 
        formData.full_name, 
        formData.password,
        formData.date_of_birth,
        formData.gender,
        formData.grade_level,
        formData.profile_image
      )
        .then((response) => {
          if (response.success) {
            return loginUser(formData.email, formData.password);
          } else {
            throw new Error('Registration failed');
          }
        })
        .then((response) => {
          if (response.success) {
            setTimeout(() => {
              alert('Registration successful!');
              setIsLoading(false);
              navigate('/dashboard');
            }, 1500);
          } else {
            alert('Auto-login failed. Please login manually.');
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error('Registration error:', error);
          alert('An error occurred during registration.');
          setIsLoading(false);
        });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white overflow-hidden flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 hover:border-purple-400/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 max-h-[90vh] overflow-y-auto">
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
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Profile Image (Optional)
                </label>
                <div className="flex flex-col items-center gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Profile preview" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-full cursor-pointer hover:border-purple-500 transition-colors">
                      <Upload className="h-8 w-8 text-slate-400" />
                      <span className="text-xs text-slate-400 mt-2">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-slate-500 text-center mt-2">
                  JPG, PNG, GIF or WebP (Max 5MB)
                </p>
              </div>

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
                  required={!isLogin}
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
                  required={!isLogin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    setFormData({ ...formData, date_of_birth: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Grade Level
                </label>
                <input
                  type="text"
                  placeholder="Enter your grade level (e.g., 10, 12)"
                  value={formData.grade_level}
                  onChange={(e) =>
                    setFormData({ ...formData, grade_level: e.target.value })
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
              required
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
              required
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