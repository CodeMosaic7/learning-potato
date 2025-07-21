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

export async function loginUser(email, password) {
  try {
    const res = await API.post('/auth/login', {
      email,
      password
    });
    return res.data;
  } catch (error) {
    console.error('Login Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || "Login failed");
  }
}

export async function getCurrentUser(token) {
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

export async function startChatbot(user_id) {
  try {
    const res = await API.post('/chatbot/start', { user_id });
    return res.data;
  } catch (error) {
    console.error('Chatbot Init Error:', error.response?.data || error.message);
    throw new Error("Chatbot start failed");
  }
}

export async function sendMessage(user_id, message) {
  try {
    const res = await API.post('/chatbot/message', { user_id, message });
    return res.data;
  } catch (error) {
    console.error('Chatbot Msg Error:', error.response?.data || error.message);
    throw new Error("Message send failed");
  }
}
