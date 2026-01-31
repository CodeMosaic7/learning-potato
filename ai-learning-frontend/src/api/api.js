import API from './config';

export async function registerUser(email, username, full_name, password, date_of_birth, gender, grade_level, profile_image) {
  try {
    let imageBase64 = null;
    if (profile_image && profile_image instanceof File) {
      imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(profile_image);
      });
    }
    const res = await API.post('/auth/register', {
      name: full_name,
      username,
      email,
      password,
      date_of_birth: date_of_birth || "",
      gender: gender || "",
      grade_level: grade_level || "",
      profile_image: imageBase64 || "",
    });
    return res.data;
  } catch (error) {
    console.error('Registration Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || "Registration failed");
  }
}

export const loginUser = async (email,password) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      const response = await API.post('/auth/login', {
        email,
        password
      });
      console.log('Login successful:');
      console.log(response.data);
      // user=getCurrentUser(response.data.access_token);
      // console.log(user) // Fetch user profile after login
      localStorage.setItem('access_token', response.access_token);
      return {success: true,};
    } catch (error) {
      console.error('Login failed:');
      return { success: false,};
    }
  };

export async function logoutUser(){
  try{
    const res= await API.post('/auth/logout');
    // return res.data;
    sessionStorage.clear();
    window.location.href = '/login';
    return {success:true};
  }
  catch(error){
    throw new Error("Logout failed"); 
  }
}

export async function Userdetails(){
  try{
    const res= await API.get('auth/me');
    console.log("User Details:", res.data);
    return res.data;
  }
  catch(error){
    throw new Error("Fetching user details failed"); 
  }
}

export async function getCurrentUser(token) {
  console.log("Using token:", token);
  try {
    const res = await API.get('/auth/me');
    return res.data;
  } catch (error) {
    throw new Error("Not authenticated");
  }
}

export async function debugToken(token) {
  const res = await API.get('/auth/debug-token', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
}

// Quiz Generator API
export async function generateQuiz(mental_age, topic,time_limit, num_questions = 5) {
  try {
    const res = await API.post('/quiz/', {
      mental_age,
      topic,
      num_questions,
      time_limit
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || `Quiz Error: ${error.message}`);
  }
}

// Homework Upload API
export async function uploadHomeworkImage(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await axios.post('http://127.0.0.1:8000/homework/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || `Upload failed`);
  }
}

// Chatbot APIs
export async function initializeChatbot() {
  try {
    const res = await API.post('/chatbot/initialize', {});
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || `Chatbot Initialization Error: ${error.message}`);
  }
}

export async function sendMessageToChatbot(sessionId, message) {
  try {
    const response = await API.post('/chatbot/chat', {
      session_id: sessionId,
      message: message
    });
    return response.data;
  } catch (error) {
    console.error('Send message error:', error);
    throw new Error(error.response?.data?.detail || `Message Send Error: ${error.message}`);
  }
}

// Get chatbot response (if you have a separate endpoint for this)
export async function getChatbotResponse(sessionId, messageId) {
  try {
    const response = await API.get(`/chatbot/response/${sessionId}/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Get chatbot response error:', error);
    throw new Error(error.response?.data?.detail || `Get Response Error: ${error.message}`);
  }
}

// Get chat history for a session
export async function getChatHistory(sessionId) {
  try {
    const response = await API.get(`/chatbot/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Get chat history error:', error);
    throw new Error(error.response?.data?.detail || `Chat History Error: ${error.message}`);
  }
}

// End/close chatbot session
export async function endChatbotSession(sessionId) {
  try {
    const response = await API.post('/chatbot/end-session', {
      session_id: sessionId
    });
    return response.data;
  } catch (error) {
    console.error('End session error:', error);
    throw new Error(error.response?.data?.detail || `End Session Error: ${error.message}`);
  }
}

// Get user's mental age analysis (if you have this feature)
export async function getMentalAgeAnalysis(sessionId) {
  try {
    const response = await API.get(`/chatbot/analysis/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Get analysis error:', error);
    throw new Error(error.response?.data?.detail || `Analysis Error: ${error.message}`);
  }
}

// Update chatbot settings/preferences
export async function updateChatbotSettings(settings) {
  try {
    const response = await API.put('/chatbot/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Update settings error:', error);
    throw new Error(error.response?.data?.detail || `Settings Update Error: ${error.message}`);
  }
}

// Get chatbot status
export async function getChatbotStatus(sessionId) {
  try {
    const response = await API.get(`/chatbot/status/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Get status error:', error);
    throw new Error(error.response?.data?.detail || `Status Check Error: ${error.message}`);
  }
}
// Dashboard APIs
// Get dashboard overview
export async function getDashboardOverview(token) {
  try {
    const res = await API.get('/dashboard/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Dashboard overview error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch dashboard overview');
  }
}

// Get user profile
export async function getUserProfile(token) {
  try {
    const res = await API.get('/dashboard/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch user profile');
  }
}

// Create user profile
export async function createUserProfile(token, profileData) {
  try {
    const res = await API.post('/dashboard/profile', {
      user_id: profileData.user_id,
      bio: profileData.bio || null,
      location: profileData.location || null,
      interests: profileData.interests || [],
      learning_goals: profileData.learning_goals || [],
      preferred_learning_style: profileData.preferred_learning_style || null,
      intellectual_level: profileData.intellectual_level || null,
      emotional_state: profileData.emotional_state || null,
      strengths: profileData.strengths || [],
      weaknesses: profileData.weaknesses || [],
      learning_style: profileData.learning_style || null,
      recommended_subjects: profileData.recommended_subjects || []
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return res.data;
  } catch (error) {
    console.error('Create profile error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create user profile');
  }
}

// Update user profile
export async function updateUserProfile(token, profileData) {
  try {
    const res = await API.put('/dashboard/profile', {
      user_id: profileData.user_id,
      bio: profileData.bio || null,
      location: profileData.location || null,
      interests: profileData.interests || [],
      learning_goals: profileData.learning_goals || [],
      preferred_learning_style: profileData.preferred_learning_style || null,
      intellectual_level: profileData.intellectual_level || null,
      emotional_state: profileData.emotional_state || null,
      strengths: profileData.strengths || [],
      weaknesses: profileData.weaknesses || [],
      learning_style: profileData.learning_style || null,
      recommended_subjects: profileData.recommended_subjects || []
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return res.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to update user profile');
  }
}

// Delete user profile
export async function deleteUserProfile(token) {
  try {
    const res = await API.delete('/dashboard/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Delete profile error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to delete user profile');
  }
}

// Get learning insights
export async function getLearningInsights(token) {
  try {
    const res = await API.get('/dashboard/learning-insights', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Get learning insights error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch learning insights');
  }
}

// Get learning progress
export async function getLearningProgress(token) {
  try {
    const res = await API.get('/dashboard/progress', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Get progress error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch learning progress');
  }
}

// Get recent activity
export async function getRecentActivity(token, limit = 10) {
  try {
    const res = await API.get(`/dashboard/recent-activity?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Get recent activity error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch recent activity');
  }
}

// Get weekly stats
export async function getWeeklyStats(token) {
  try {
    const res = await API.get('/dashboard/stats/weekly', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Get weekly stats error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch weekly statistics');
  }
}

// Get user courses
export async function getUserCourses(token) {
  try {
    const res = await API.get('/dashboard/courses', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Get user courses error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch user courses');
  }
}

// Get user achievements
export async function getUserAchievements(token) {
  try {
    const res = await API.get('/dashboard/achievements', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Get achievements error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch achievements');
  }
}

// Get course recommendations
export async function getCourseRecommendations(token) {
  try {
    const res = await API.get('/dashboard/recommendations', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Get recommendations error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch recommendations');
  }
}