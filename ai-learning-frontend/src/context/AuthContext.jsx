import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginStudent, logoutStudent, registerStudent, refreshStudentSession } from '../api/api';
import { setAccessToken } from '../api/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { student: activeStudent } = await refreshStudentSession();
        setStudent(activeStudent);
      } catch {
        setStudent(null);
        setAccessToken(null);
      } finally {
        setIsInitializing(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const res = await loginStudent(email, password);
    if (res.success) {
      setStudent(res.student);
    }
    return res;
  };

  const register = async (email, username, fullName, password, dob, gender, grade, image) => {
    const registeredStudent = await registerStudent(email, username, fullName, password, dob, gender, grade, image);
    return registeredStudent;
  };

  const logout = async () => {
    try {
      await logoutStudent();
    } finally {
      setStudent(null);
      setAccessToken(null);
    }
  };

  const value = {
    student,
    isAuthenticated: !!student,
    isInitializing,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
