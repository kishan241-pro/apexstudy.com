import React, { useState, useEffect } from 'react';
import { UserProfile, GradeLevel, StudentStream, DailyHistoryRecord } from '../../types';
import { dbService, getLocalDateString } from '../../lib/supabase';
import { useSubscription } from '../../SubscriptionContext';
import { DatabaseStatusModal } from './DatabaseStatusModal';
import { PAYHIP_CHECKOUT_URL } from '../../PaywallOverlay';
import {
  Zap,
  Flame,
  Award,
  ChevronDown,
  LogOut,
  Sparkles,
  CalendarCheck2,
  TrendingUp,
  Target,
  BookOpen,
  Database,
  Bot,
  Layers,
  X,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface LeftSidebarProps {
  profile: UserProfile;
  activeNavTab: 'daily-tasks' | 'monthly-progress' | 'ncert-checklist' | 'ai-chat' | 'ai-notes';
  onNavTabChange: (tab: 'daily-tasks' | 'monthly-progress' | 'ncert-checklist' | 'ai-chat' | 'ai-notes') => void;
  onGradeChange: (newGrade: GradeLevel, newStream?: StudentStream) => Promise<void>;
  onLogout: () => void;
  onOpenUpgrade: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  profile,
  activeNavTab,
  onNavTabChange,
  onGradeChange,
  onLogout,
  onOpenUpgrade,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [streamDropdownOpen, setStreamDropdownOpen] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  const [monthlyAverage, setMonthlyAverage] = useState<number>(0);
  const [activeDaysCount, setActiveDaysCount] = useState<number>(0);

  const { isPremium, isTrialActive, daysRemaining } = useSubscription();

  const currentLevel = Math.floor((profile.current_xp || 0) / 250) + 1;
  const xpInCurrentLevel = (profile.current_xp || 0) % 250;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / 250) * 100));

  const gradeOptions: GradeLevel[] = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const streamOptions: StudentStream[] = ['PCM', 'PCB', 'COMMERCE', 'ARTS'];
  const isSeniorClass = profile.grade === 'Class 11' || profile.grade === 'Class 12';

  // Fetch monthly stats for the left-side quick overview widget
  useEffect(() => {
    try {
      const now = new Date();
      const records: DailyHistoryRecord[] = dbService.getMonthlyHistory(
        profile.id,
        now.getFullYear(),
        now.getMonth() + 1
      );
      if (records && records.length > 0) {
        const completedDays = records.filter((r) => r.completedCount > 0);
        setActiveDaysCount(completedDays.length);
        const totalPct = records.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
        setMonthlyAverage(Math.round(totalPct / records.length));
      }
    } catch {
      // Fallback
    }
  }, [profile.id, profile.current_xp]);

  const navItems = [
    {
      id: 'daily-tasks' as const,
      label: 'Daily To-Do (5 Tasks)',
      icon: CalendarCheck2,
      badge: '5 Tasks/Day',
    },
    {
      id: 'monthly-progress' as const,
      label: 'Monthly Progress & Focus',
      icon: TrendingUp,
      badge: `${monthlyAverage}% Avg`,
    },
    ...(profile.grade !== 'Class 8'
      ? [
          {
            id: 'ncert-checklist' as const,
            label: `NCERT Chapters (${profile.grade})`,
            icon: BookOpen,
          },
        ]
      : []),
    {
      id: 'ai-chat' as const,
      label: 'AI Academic Mentor',
      icon: Bot,
      highlight: true,
    },
    {
      id: 'ai-notes' as const,
      label: 'AI Study Kits & Quizzes',
      icon: Layers,
    },
  ];

  const handleSelectNav = (tab: typeof activeNavTab) => {
    onNavTabChange(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 sm:p-5 text-slate-200 overflow-y-auto">
      {/* Top Branding & Student Summary */}
      <div className="space-y-4">
        {/* Brand header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white leading-tight">
                APEX<span className="text-indigo-400">STUDY</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-400">Class 8-12 Math/Science</div>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Profile & Grade Switcher Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">
                {profile.name || 'Student Scholar'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">{profile.email}</div>
            </div>

            <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
              <Target className="w-3 h-3 text-emerald-400" />
              <span>{profile.target_percentage}%</span>
            </div>
          </div>

          {/* Interactive Class & Stream Selectors */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
            {/* Grade Selector */}
            <div className="relative flex-1">
              <button
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  setStreamDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-bold transition cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{profile.grade}</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                    Switch Class
                  </div>
                  {gradeOptions.map((g) => (
                    <button
                      key={g}
                      onClick={async () => {
                        setDropdownOpen(false);
                        await onGradeChange(g);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between cursor-pointer ${
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

            {/* Stream Selector (Class 11 & 12 only) */}
            {isSeniorClass && (
              <div className="relative">
                <button
                  onClick={() => {
                    setStreamDropdownOpen(!streamDropdownOpen);
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-300 hover:bg-violet-500/20 text-xs font-bold transition cursor-pointer"
                >
                  <span>{profile.stream || 'PCM'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-violet-400" />
                </button>

                {streamDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-40 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in duration-150">
                    <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                      Switch Stream
                    </div>
                    {streamOptions.map((st) => (
                      <button
                        key={st}
                        onClick={async () => {
                          setStreamDropdownOpen(false);
                          await onGradeChange(profile.grade, st);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between cursor-pointer ${
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
          </div>

          {/* Gamified Level & Real Streak */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Level {currentLevel}</span>
              </span>
              <span className="text-orange-400 font-bold flex items-center gap-1 text-[11px]">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>{profile.streak_days || 0}d Streak</span>
              </span>
            </div>

            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>{xpInCurrentLevel} / 250 XP</span>
              <span>{profile.current_xp} Total XP</span>
            </div>
          </div>
        </div>

        {/* 7-Day Free Trial / Lifetime Pass Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 shadow-md">
          {isPremium ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Lifetime Pass</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[10px] text-emerald-300">All Features Unlocked</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                VIP
              </span>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>7-Day Free Trial</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                  {daysRemaining}d Left
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Full access to AI equation solver & NCERT study kits.
              </p>

              <a
                href={PAYHIP_CHECKOUT_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/25 transition cursor-pointer"
              >
                <span>Upgrade ($9.99 Lifetime)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="space-y-1">
          <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Study Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* SPECIFICATION: Move Monthly Progress Overview in Left Side */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Monthly Progress</span>
            </span>
            <span className="text-[11px] font-bold text-indigo-300 font-mono">
              {monthlyAverage}% Completed
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, monthlyAverage))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Active Study Days:</span>
            <span className="text-white font-semibold font-mono">{activeDaysCount} Days</span>
          </div>

          <button
            onClick={() => handleSelectNav('monthly-progress')}
            className="w-full py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <span>Open Full Calendar & Pomodoro</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Bottom Controls: Supabase Diagnostic & Logout */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2 shrink-0">
        <button
          onClick={() => setShowDbModal(true)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 text-xs text-slate-300 transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cloud Sync & Storage</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Database Status Modal */}
      <DatabaseStatusModal isOpen={showDbModal} onClose={() => setShowDbModal(false)} />
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar (md and up) */}
      <aside className="hidden md:flex w-72 lg:w-80 shrink-0 h-screen sticky top-0 bg-slate-950/95 border-r border-slate-800/90 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (overlay on mobile devices when isOpenMobile is true) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Slide-over panel */}
          <div className="relative w-80 max-w-[85vw] h-full bg-slate-950 border-r border-slate-800 z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default LeftSidebar;
