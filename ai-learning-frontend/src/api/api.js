// src/api/api.js
import API from './config';

// Auth APIs

export async function registerUser(email, username, full_name, password) {
  try {
    const res = await API.post('/auth/register', {
      email,
      username,
      full_name,
      password
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
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Login successful:');
      // user=getCurrentUser(response.data.access_token);
      // console.log(user) // Fetch user profile after login
      return { 
        success: true, 
        
      };
    } catch (error) {
      console.error('Login failed:');
      
      return { 
        success: false,
      };
    }
  };

export async function getCurrentUser(token) {
  console.log("Using token:", token);
  try {
    const res = await API.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
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


