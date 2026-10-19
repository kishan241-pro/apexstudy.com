import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { dbService } from '../../lib/supabase';
import {
  Zap,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  ArrowRight,
  CalendarCheck,
  TrendingUp,
  BrainCircuit,
  Timer,
} from 'lucide-react';

interface LandingAuthProps {
  onAuthenticated: (profile: UserProfile) => void;
}

export const LandingAuth: React.FC<LandingAuthProps> = ({ onAuthenticated }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your student email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (activeTab === 'signin') {
        const profile = await dbService.signIn(email.trim(), password);
        onAuthenticated(profile);
      } else {
        const { profile } = await dbService.signUp(email.trim(), password);
        onAuthenticated(profile);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const profile = await dbService.signIn('google_student@gmail.com');
      onAuthenticated(profile);
    } catch {
      setError('Google Sign-in failed. Please try email sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    try {
      const profile = await dbService.signIn('alex_student@apexstudy.io');
      onAuthenticated(profile);
    } catch {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Navbar - Clean, no internal schema buttons */}
      <nav className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">APEX<span className="text-indigo-400">STUDY</span></span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
              Grades 8–12 OS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">
            Student Portal
          </span>
        </div>
      </nav>

      {/* Hero with Embedded Sign-In Card */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Product Value Hero */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>For School Students (Grades 8 to 12)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Reach your target score with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400">Daily 5 AI Quests</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
              Sign in to unlock 5 daily curriculum-tailored study tasks (customized for Classes 8–10 and PCM, PCB, Commerce, or Arts in Classes 11–12). Track your real daily consistency on the monthly progress chart and focus with Pomodoro.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-lg">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <CalendarCheck className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">5 Daily AI Tasks</h4>
                  <p className="text-[11px] text-slate-400">Auto-updates each night at 12:00 AM</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <TrendingUp className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Monthly Progress Chart</h4>
                  <p className="text-[11px] text-slate-400">Real-time daily consistency tracking</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <Timer className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Pomodoro Focus Timer</h4>
                  <p className="text-[11px] text-slate-400">Distraction-free 25m/5m focus sprints</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <BrainCircuit className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">AI Notes & Quiz</h4>
                  <p className="text-[11px] text-slate-400">Instant summaries, flashcards & tests</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
              {/* Tabs: Sign In / Sign Up */}
              <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    activeTab === 'signin'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    activeTab === 'signup'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div className="text-left space-y-1">
                <h3 className="text-lg font-bold text-white">
                  {activeTab === 'signin' ? 'Sign in to your account' : 'Join ApexStudy'}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeTab === 'signin'
                    ? 'Enter your student email to load your saved tasks and progress.'
                    : 'Create your account to start your personalized study journey.'}
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {error}
                </div>
              )}

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-3 transition shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 12.3 0 15.2c0 2.9.7 5.6 1.9 8l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16.4C3.7 20.2 7.5 23.5 12 23.5z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold absolute">
                  or email
                </span>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@school.edu"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  {activeTab === 'signin' ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>{loading ? 'Creating...' : 'Create Account'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Fast Student Demo Sign In */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  disabled={loading}
                  className="w-full py-2 px-3 text-[11px] font-semibold text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/50 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <span>1-Click Instant Student Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <span>ApexStudy • Designed for High-School Excellence (Grades 8–12)</span>
        <div className="flex gap-4">
          <span>Automatic Midnight Reset</span>
          <span>•</span>
          <span>Monthly Consistency Tracking</span>
        </div>
      </footer>
    </div>
  );
};
