import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../api/apiService';
import { MOCK_USER } from '../api/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('esaarthi_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_USER;
      }
    }
    // Default to mock user for easy demo inspection, but token marks login status
    return MOCK_USER;
  });

  const [token, setToken] = useState(() => localStorage.getItem('esaarthi_token') || 'demo_token_esaarthi_active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('esaarthi_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('esaarthi_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('esaarthi_token', token);
    } else {
      localStorage.removeItem('esaarthi_token');
    }
  }, [token]);

  const login = async ({ email, password, rememberMe = true }) => {
    setLoading(true);
    try {
      const data = await apiService.login({ email, password });
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  
  const register = async (userData) => {
    setLoading(true);
    try {
      // Step 1: Create user account
      await apiService.register(userData);

      // Step 2: Automatically login after registration
      const data = await apiService.login({
        email: userData.email,
        password: userData.password
      });

      // Step 3: Save actual backend user and JWT
      setUser(data.user);
      setToken(data.token);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || err.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGithub = async (githubProfile = null) => {
    setLoading(true);
    try {
      let profileData = githubProfile;
      
      // If no profile data was provided directly, create a comprehensive GitHub developer profile
      if (!profileData) {
        profileData = {
          login: 'octocat',
          name: 'The Octocat (GitHub Demo)',
          avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
          email: 'octocat@github.com',
          html_url: 'https://github.com/octocat',
          bio: 'GitHub Safety Contributor & Open Source Volunteer',
          location: 'Connaught Place, New Delhi',
          company: 'GitHub'
        };
      }

      const githubUser = {
        id: `gh_${profileData.id || profileData.login || Date.now()}`,
        fullName: profileData.name || profileData.login || 'GitHub User',
        username: profileData.login || 'github_user',
        email: profileData.email || `${profileData.login || 'citizen'}@users.noreply.github.com`,
        avatarUrl: profileData.avatar_url || 'https://avatars.githubusercontent.com/u/583231?v=4',
        provider: 'github',
        githubUrl: profileData.html_url || `https://github.com/${profileData.login || ''}`,
        bio: profileData.bio || 'Verified Citizen on GitHub Safety Network',
        phone: profileData.phone || '+91 98765 43210',
        safetyScore: 92,
        status: 'Safe',
        bloodGroup: profileData.bloodGroup || 'O+',
        emergencyPin: '1337',
        homeAddress: profileData.location || 'Sector 15, Rohini, New Delhi',
        workAddress: profileData.company || 'Connaught Place, New Delhi',
        locationSharing: true,
        currentLocation: {
          name: 'Connaught Place, Central Delhi',
          lat: 28.6315,
          lng: 77.2167,
          accuracy: 8,
          timestamp: new Date().toISOString()
        }
      };

      const oauthToken = `gh_oauth_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setUser(githubUser);
      setToken(oauthToken);
      return { success: true, user: githubUser };
    } catch (err) {
      console.error('[E-Saarthi Auth] GitHub login error:', err);
      return { success: false, error: err.message || 'GitHub authentication failed' };
    } finally {
      setLoading(false);
    }
  };

  // Check URL query parameters for GitHub OAuth callback (e.g. ?code=... or ?github_oauth=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const githubAuth = params.get('github_auth');

    if (code || githubAuth) {
      // Clean query params from address bar
      window.history.replaceState({}, document.title, window.location.pathname);
      loginWithGithub();
    }
  }, []);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('esaarthi_token');
    localStorage.removeItem('esaarthi_user');
  };

  const quickDemoLogin = () => {
    setUser(MOCK_USER);
    setToken('demo_token_esaarthi_active');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        loginWithGithub,
        logout,
        quickDemoLogin,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
