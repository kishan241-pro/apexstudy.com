import React, { useState } from 'react';
import { UserProfile, GradeLevel, StudentStream } from '../../types';
import {
  Zap,
  Flame,
  Award,
  ChevronDown,
  LogOut,
  Sparkles,
  CalendarCheck2,
  TrendingUp,
  BrainCircuit,
  Target,
  BookOpen,
  Database,
  Bot,
} from 'lucide-react';
import { DatabaseStatusModal } from './DatabaseStatusModal';
import { useSubscription } from '../../SubscriptionContext';

interface HeaderProps {
  profile: UserProfile;
  activeNavTab: 'daily-tasks' | 'monthly-progress' | 'ncert-checklist' | 'ai-chat' | 'ai-notes';
  onNavTabChange: (tab: 'daily-tasks' | 'monthly-progress' | 'ncert-checklist' | 'ai-chat' | 'ai-notes') => void;
  onGradeChange: (newGrade: GradeLevel, newStream?: StudentStream) => Promise<void>;
  onLogout: () => void;
  onOpenUpgrade?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeNavTab,
  onNavTabChange,
  onGradeChange,
  onLogout,
  onOpenUpgrade,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [streamDropdownOpen, setStreamDropdownOpen] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  // Read subscription state from global SubscriptionContext
  const { isPremium, daysRemaining } = useSubscription();

  const currentLevel = Math.floor((profile.current_xp || 0) / 250) + 1;
  const xpInCurrentLevel = (profile.current_xp || 0) % 250;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / 250) * 100));

  const gradeOptions: GradeLevel[] = [
    'Class 8',
    'Class 9',
    'Class 10',
    'Class 11',
    'Class 12',
  ];

  const streamOptions: StudentStream[] = ['PCM', 'PCB', 'COMMERCE', 'ARTS'];
  const isSeniorClass = profile.grade === 'Class 11' || profile.grade === 'Class 12';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo & Student Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  APEX<span className="text-indigo-400">STUDY</span>
                </span>
                {profile.name && (
                  <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-medium">
                    ({profile.name})
                  </span>
                )}
              </div>
            </div>

            <div className="h-5 w-px bg-slate-800 hidden sm:block mx-1" />

            {/* Interactive Grade Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  setStreamDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-bold transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{profile.grade}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-indigo-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 animate-fade-in">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                    Switch Class
                  </div>
                  {gradeOptions.map((g) => (
                    <button
                      key={g}
                      onClick={async () => {
                        setDropdownOpen(false);
                        const defaultStream = (g === 'Class 11' || g === 'Class 12') ? (profile.stream || 'PCM') : undefined;
                        await onGradeChange(g, defaultStream);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between ${
                        profile.grade === g
                          ? 'bg-indigo-600/30 text-indigo-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{g}</span>
                      {profile.grade === g && (
                        <span className="text-[10px] text-indigo-400 font-semibold">Active</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stream Selector Dropdown - ONLY for Class 11 and Class 12 */}
            {isSeniorClass && (
              <div className="relative">
                <button
                  onClick={() => {
                    setStreamDropdownOpen(!streamDropdownOpen);
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-300 hover:bg-violet-500/20 text-xs font-bold transition"
                  title="Switch Stream (PCM, PCB, COMMERCE, ARTS)"
                >
                  <Target className="w-3.5 h-3.5 text-violet-400" />
                  <span>{profile.stream || 'PCM'}</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-violet-400" />
                </button>

                {streamDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 animate-fade-in">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                      Switch Stream
                    </div>
                    {streamOptions.map((st) => (
                      <button
                        key={st}
                        onClick={async () => {
                          setStreamDropdownOpen(false);
                          await onGradeChange(profile.grade, st);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between ${
                          profile.stream === st
                            ? 'bg-violet-600/30 text-violet-300 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{st}</span>
                        {profile.stream === st && (
                          <span className="text-[10px] text-violet-400 font-semibold">Active</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Target Percentage badge */}
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>{profile.target_percentage}% Goal</span>
            </div>
          </div>

          {/* Gamified Level Bar & Real Streak */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* XP & Level bar */}
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-xl">
              <Award className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                  <span>Lvl {currentLevel}</span>
                  <span className="text-[10px] text-amber-400 font-mono">({profile.current_xp} XP)</span>
                </div>
                <div className="w-16 sm:w-24 bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Real Unfabricated Streak */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{profile.streak_days || 0}d Streak</span>
            </div>

            {/* Subscription Status Badge */}
            {isPremium ? (
              <button
                onClick={onOpenUpgrade}
                title="Lifetime VIP Account"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="hidden sm:inline">Lifetime VIP</span>
              </button>
            ) : (
              <button
                onClick={onOpenUpgrade}
                title="7-Day Free Trial Active - Click to Upgrade"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{daysRemaining}d Trial</span>
              </button>
            )}

            {/* Cloud Connection Status Badge */}
            <button
              onClick={() => setShowDbModal(true)}
              title="Cloud Synchronization & Data Services"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Cloud Synced</span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Log Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 pt-2 pb-2">
          <button
            onClick={() => onNavTabChange('daily-tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeNavTab === 'daily-tasks'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CalendarCheck2 className="w-3.5 h-3.5" />
            <span>Daily To-Do (5 Tasks)</span>
          </button>

          <button
            onClick={() => onNavTabChange('monthly-progress')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeNavTab === 'monthly-progress'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Monthly Progress & Pomodoro</span>
          </button>

          {profile.grade !== 'Class 8' && (
            <button
              onClick={() => onNavTabChange('ncert-checklist')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeNavTab === 'ncert-checklist'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>NCERT Chapters ({profile.grade})</span>
            </button>
          )}

          <button
            onClick={() => onNavTabChange('ai-chat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeNavTab === 'ai-chat'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Tutor & Notes Chat</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          <button
            onClick={() => onNavTabChange('ai-notes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeNavTab === 'ai-notes'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>AI Study Notes & Quiz</span>
          </button>
        </div>
      </div>

      {/* Database Diagnostic & SQL Migration Modal */}
      <DatabaseStatusModal
        isOpen={showDbModal}
        onClose={() => setShowDbModal(false)}
      />
    </header>
  );
};
