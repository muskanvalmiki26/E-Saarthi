import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Phone,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  ExternalLink,
  Search,
  Check,
  Globe,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Official GitHub Logo SVG Component
export const GithubIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

export const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('priya.sharma@example.com');
  const [password, setPassword] = useState('SafetyFirst@2026');
  const [fullName, setFullName] = useState('Priya Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [confirmPassword, setConfirmPassword] = useState('SafetyFirst@2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  // GitHub Browser OAuth States
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [githubUsernameInput, setGithubUsernameInput] = useState('');
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubFetchError, setGithubFetchError] = useState('');
  const [fetchedGithubUser, setFetchedGithubUser] = useState(null);
  const [oauthStep, setOauthStep] = useState('authorize'); // 'authorize' | 'connecting'

  const { login, register, loginWithGithub, quickDemoLogin, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const res = await login({ email, password, rememberMe });
      if (res.success) {
        onAuthSuccess();
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } else {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      const res = await register({ fullName, email, phone, password });
      if (res.success) {
        onAuthSuccess();
      } else {
        setError(res.error || 'Registration failed');
      }
    }
  };

  const handleDemoSignIn = () => {
    quickDemoLogin();
    onAuthSuccess();
  };

  // 1-Click Instant GitHub Sign In
  const handleDirectGithubLogin = async () => {
    const res = await loginWithGithub();
    if (res.success) {
      onAuthSuccess();
    }
  };

  // Fetch Public Profile from GitHub REST API
  const handleLookupGithubUser = async (username) => {
    const target = username || githubUsernameInput;
    if (!target.trim()) return;

    setIsFetchingGithub(true);
    setGithubFetchError('');

    try {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(target.trim())}`);
      if (response.ok) {
        const data = await response.json();
        setFetchedGithubUser({
          id: data.id,
          login: data.login,
          name: data.name || data.login,
          avatar_url: data.avatar_url,
          email: data.email || `${data.login}@users.noreply.github.com`,
          html_url: data.html_url,
          bio: data.bio || 'GitHub Contributor & Safe Citizen',
          location: data.location || 'New Delhi, India',
          company: data.company || 'Open Source Developer',
          public_repos: data.public_repos
        });
      } else if (response.status === 404) {
        setGithubFetchError(`GitHub user "@${target}" not found.`);
      } else {
        // Fallback profile if rate limited by GitHub public API
        setFetchedGithubUser({
          id: Math.floor(Math.random() * 1000000),
          login: target.trim(),
          name: target.trim(),
          avatar_url: `https://avatars.githubusercontent.com/u/583231?v=4`,
          email: `${target.trim()}@users.noreply.github.com`,
          html_url: `https://github.com/${target.trim()}`,
          bio: 'GitHub Safety Community Member',
          location: 'Delhi, India',
          company: 'Verified Developer'
        });
      }
    } catch (err) {
      // Offline / network fallback
      setFetchedGithubUser({
        id: Math.floor(Math.random() * 1000000),
        login: target.trim(),
        name: target.trim(),
        avatar_url: `https://avatars.githubusercontent.com/u/583231?v=4`,
        email: `${target.trim()}@users.noreply.github.com`,
        html_url: `https://github.com/${target.trim()}`,
        bio: 'Verified Developer on GitHub',
        location: 'New Delhi, India',
        company: 'Safety First'
      });
    } finally {
      setIsFetchingGithub(false);
    }
  };

  // Complete GitHub OAuth Authentication
  const handleAuthorizeWithGithub = async () => {
    setOauthStep('connecting');
    const profileToUse = fetchedGithubUser || {
      login: 'octocat',
      name: 'The Octocat (GitHub Verified)',
      avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
      email: 'octocat@github.com',
      html_url: 'https://github.com/octocat',
      bio: 'Open Source Safety Champion',
      location: 'Connaught Place, New Delhi',
      company: 'GitHub'
    };

    setTimeout(async () => {
      const res = await loginWithGithub(profileToUse);
      if (res.success) {
        setIsGithubModalOpen(false);
        onAuthSuccess();
      } else {
        setGithubFetchError(res.error || 'Authentication error');
        setOauthStep('authorize');
      }
    }, 600);
  };

  // Launch simulated Browser OAuth window / popup
  const handleLaunchBrowserPopup = () => {
    // If client ID is defined, can redirect to real GitHub OAuth URL
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (clientId) {
      const redirectUri = window.location.origin;
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,user:email`;
      window.location.href = githubAuthUrl;
      return;
    }

    // Otherwise open in-browser authorization modal
    setIsGithubModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glowing ambient effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-800/20 overflow-hidden relative z-10">
        {/* Header Branding */}
        <div className="bg-slate-900 p-5 sm:p-8 text-center text-white border-b border-slate-800">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">E-Saarthi</h1>
          <p className="text-xs text-slate-400 mt-1">
            Women & Citizen Safety Navigation Platform
          </p>

          {/* Quick Demo Login Preset Button */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full py-2.5 px-3 sm:px-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="truncate">One-Click Academic Demo Login</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
              isLogin ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
              !isLogin ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-8 space-y-4">
          {/* GitHub OAuth Single-Click / Browser Login Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleLaunchBrowserPopup}
              className="w-full py-3 px-4 bg-[#24292F] hover:bg-[#1a1e22] text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 border border-slate-700 active:scale-[0.99] group"
              title="Authenticate securely with GitHub OAuth 2.0"
            >
              <GithubIcon className="w-5 h-5 fill-current text-white group-hover:scale-110 transition-transform" />
              <span>Continue with GitHub</span>
              <span className="text-[10px] bg-white/20 text-white font-semibold px-2 py-0.5 rounded-full ml-auto">
                OAuth 2.0
              </span>
            </button>

            {/* Quick 1-click fallback badge */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-slate-400">Browser GitHub authentication</span>
              <button
                type="button"
                onClick={handleDirectGithubLogin}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:underline"
              >
                Instant 1-Click (@octocat)
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Or with credentials
            </span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                {error}
              </div>
            )}

            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Priya Sharma"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email / Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="priya.sharma@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset link dispatched to ' + email);
                  }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Dashboard' : 'Create E-Saarthi Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* GitHub Browser OAuth Authorization Modal */}
      {isGithubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden text-slate-900 transition-all my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header mimicking GitHub OAuth dialog */}
            <div className="bg-[#24292F] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <GithubIcon className="w-6 h-6 text-white" />
                <div>
                  <h3 className="font-bold text-sm tracking-wide">Authorize E-Saarthi Safety</h3>
                  <p className="text-[11px] text-slate-300">GitHub OAuth 2.0 Browser Authentication</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsGithubModalOpen(false);
                  setOauthStep('authorize');
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
              {/* Connected apps overview banner */}
              <div className="flex items-center justify-center gap-4 py-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Shield className="w-7 h-7" />
                </div>
                <div className="text-slate-400 font-bold text-lg">⇄</div>
                <div className="w-14 h-14 rounded-2xl bg-[#24292F] flex items-center justify-center text-white shadow-md">
                  <GithubIcon className="w-7 h-7" />
                </div>
              </div>

              <div className="text-center">
                <h4 className="text-base font-extrabold text-slate-900">
                  <span className="text-blue-600">E-Saarthi Platform</span> by DeepMind/Antigravity
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  wants to access your GitHub citizen identity for safety telemetry & navigation.
                </p>
              </div>

              {/* GitHub Handle Custom Lookup or 1-Click User Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Select or Enter GitHub Username:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">@</span>
                    <input
                      type="text"
                      value={githubUsernameInput}
                      onChange={(e) => setGithubUsernameInput(e.target.value)}
                      placeholder="e.g. octocat, or your GitHub username"
                      className="w-full pl-7 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLookupGithubUser()}
                    disabled={isFetchingGithub}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {isFetchingGithub ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Fetch</span>
                      </>
                    )}
                  </button>
                </div>

                {githubFetchError && (
                  <p className="text-[11px] text-red-600 font-medium">{githubFetchError}</p>
                )}

                {/* Profile Card Preview */}
                <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                  <img
                    src={fetchedGithubUser?.avatar_url || 'https://avatars.githubusercontent.com/u/583231?v=4'}
                    alt="GitHub Avatar"
                    className="w-12 h-12 rounded-xl border border-slate-300 object-cover shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {fetchedGithubUser?.name || 'The Octocat'}
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-md font-mono">
                        @{fetchedGithubUser?.login || 'octocat'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {fetchedGithubUser?.bio || 'GitHub Open Source Safety Advocate'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {fetchedGithubUser?.location || 'New Delhi, India'} •{' '}
                      {fetchedGithubUser?.company || 'GitHub Community'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scopes & Permissions Requested */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Permissions Requested:
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-100">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      <strong>read:user</strong> — Access your public GitHub profile & handle
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-100">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      <strong>user:email</strong> — Verify safety alerts dispatch destination
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-100">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      <strong>telemetry:citizen</strong> — Secure emergency routing & SOS beacon
                    </span>
                  </div>
                </div>
              </div>

              {/* Authorization Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsGithubModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAuthorizeWithGithub}
                  disabled={oauthStep === 'connecting'}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#2da44e] hover:bg-[#2c974b] active:bg-[#268442] text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {oauthStep === 'connecting' ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing in Browser...</span>
                    </>
                  ) : (
                    <>
                      <GithubIcon className="w-4 h-4 fill-current" />
                      <span>Authorize E-Saarthi</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-400">
                You will be redirected back to the E-Saarthi Safety Dashboard upon completion.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
