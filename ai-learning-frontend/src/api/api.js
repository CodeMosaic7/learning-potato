import API, { setAccessToken } from './config';

export async function registerStudent(email, username, full_name, password, date_of_birth, gender, grade_level, profile_image) {
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
    date_of_birth: date_of_birth || null,
    gender: gender || null,
    grade_level: grade_level || null,
    profile_image: imageBase64 || "",
  });
  return res.data;
}

export async function loginStudent(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  const response = await API.post('/auth/login', { email, password });
  const { access_token, student } = response.data;
  setAccessToken(access_token);
  return { success: true, student, access_token };
}

export async function logoutStudent() {
  try {
    await API.post('/auth/logout');
  } finally {
    setAccessToken(null);
    localStorage.removeItem("user_details");
  }
  return { success: true };
}

export async function getCurrentStudent() {
  const res = await API.get('/auth/me');
  return res.data;
}

export async function refreshStudentSession() {
  const res = await API.post('/auth/refresh');
  const { access_token, student } = res.data;
  setAccessToken(access_token);
  return { student, access_token };
}

// Retain legacy aliases for backwards compatibility in untouched components
export const registerUser = registerStudent;
export const loginUser = async (email, password) => {
  try {
    const res = await loginStudent(email, password);
    return res;
  } catch (err) {
    return { success: false, error: err.response?.data?.error?.message || err.message };
  }
};
export const logoutUser = logoutStudent;
export const Userdetails = getCurrentStudent;
export const getCurrentUser = async () => getCurrentStudent();
export const debugToken = async () => ({ auth_header: "bearer" });

// Protected Feature APIs
export async function generateQuiz(mental_age, topic, time_limit, num_questions = 5) {
  const res = await API.post('/quiz/', {
    mental_age,
    topic,
    num_questions,
    time_limit
  });
  return res.data;
}

export async function uploadHomeworkImage(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file');
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await API.post('/homework/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
}

export async function initializeChatbot() {
  const res = await API.post('/chatbot/initialize', {});
  return res.data;
}

export async function sendMessageToChatbot(sessionId, message) {
  const response = await API.post('/chatbot/chat', {
    session_id: sessionId,
    message: message
  });
  return response.data;
}

export async function getChatbotResponse(sessionId, messageId) {
  return { id: messageId, response: "ok" };
}

export async function getChatHistory(sessionId) {
  return { session_id: sessionId, history: [] };
}

export async function endChatbotSession(sessionId) {
  return { session_id: sessionId, status: "ended" };
}

export async function getMentalAgeAnalysis(sessionId) {
  return { session_id: sessionId, analysis: {} };
}

export async function updateChatbotSettings(settings) {
  return { settings };
}

export async function getChatbotStatus() {
  const res = await API.get('/chatbot/status');
  return res.data;
}

// Dashboard APIs
export async function getDashboardOverview() {
  const res = await API.get('/dashboard/');
  return res.data;
}

export async function getUserProfile() {
  const res = await API.get('/dashboard/profile');
  return res.data;
}

export async function createUserProfile(profileData) {
  const res = await API.post('/dashboard/profile', profileData);
  return res.data;
}

export async function updateUserProfile(profileData) {
  const res = await API.put('/dashboard/profile', profileData);
  return res.data;
}

export async function deleteUserProfile() {
  const res = await API.delete('/dashboard/profile');
  return res.data;
}

export async function getLearningInsights() {
  const res = await API.get('/dashboard/learning-insights');
  return res.data;
}

export async function getLearningProgress() {
  const res = await API.get('/dashboard/progress');
  return res.data;
}

export async function getRecentActivity(limit = 10) {
  const res = await API.get(`/dashboard/recent-activity?limit=${limit}`);
  return res.data;
}

export async function getWeeklyStats() {
  const res = await API.get('/dashboard/stats/weekly');
  return res.data;
}

export async function getUserCourses() {
  return [];
}

export async function getUserAchievements() {
  return [];
}

export async function getCourseRecommendations() {
  return [];
}