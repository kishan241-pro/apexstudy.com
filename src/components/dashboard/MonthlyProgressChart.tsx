import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, DailyHistoryRecord, PomodoroMode } from '../../types';
import { dbService, getLocalDateString } from '../../lib/supabase';
import { getNcertChapters, NcertSubjectGroup, NcertChapter } from '../../lib/ncert-data';
import confetti from 'canvas-confetti';
import {
  TrendingUp,
  Award,
  Target,
  Flame,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  CheckCircle2,
  Circle,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Check,
  Sparkles,
} from 'lucide-react';

interface MonthlyProgressChartProps {
  profile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

const POMODORO_DURATIONS: Record<PomodoroMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 10 * 60,
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MonthlyProgressChart: React.FC<MonthlyProgressChartProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const todayStr = getLocalDateString();
  const todayDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(todayDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(todayDate.getMonth() + 1);
  const [history, setHistory] = useState<DailyHistoryRecord[]>([]);
  const [selectedDayRecord, setSelectedDayRecord] = useState<DailyHistoryRecord | null>(null);

  // NCERT Syllabus Tracker State (Class 9, 10, 11, 12 only)
  const isEligibleForNcert = profile.grade !== 'Class 8';
  const [ncertGroups, setNcertGroups] = useState<NcertSubjectGroup[]>([]);
  const [revisedMap, setRevisedMap] = useState<Record<string, boolean>>({});
  const [activeNcertSubject, setActiveNcertSubject] = useState<string>('All');

  // Load monthly task history
  useEffect(() => {
    const records = dbService.getMonthlyHistory(profile.id, selectedYear, selectedMonth);
    setHistory(records);
    const todayRec = records.find((r) => r.date === todayStr);
    setSelectedDayRecord(todayRec || records[records.length - 1] || null);
  }, [profile.id, selectedYear, selectedMonth, profile.current_xp]);

  // Load NCERT chapters and revision state
  const loadNcertState = () => {
    if (isEligibleForNcert) {
      const groups = getNcertChapters(profile.grade, profile.stream);
      setNcertGroups(groups);
      const state = dbService.getChapterRevisionState(profile.id);
      setRevisedMap(state);
    }
  };

  useEffect(() => {
    loadNcertState();
  }, [profile.id, profile.grade, profile.stream]);

  // Monthly tasks statistics
  const totalTasksCompleted = history.reduce((sum, r) => sum + r.completedCount, 0);
  const totalTasksPossible = history.reduce((sum, r) => sum + r.totalCount, 0);
  const avgCompletionRate =
    totalTasksPossible > 0 ? Math.round((totalTasksCompleted / totalTasksPossible) * 100) : 0;
  const targetAlignmentScore = Math.min(
    100,
    Math.round((avgCompletionRate / (profile.target_percentage || 95)) * 100)
  );

  // NCERT Syllabus calculations
  const allNcertChapters: NcertChapter[] = ncertGroups.flatMap((g) => g.chapters);
  const totalNcertChapters = allNcertChapters.length;
  const revisedNcertCount = allNcertChapters.filter((c) => revisedMap[c.id]).length;
  const ncertRevisionPercentage =
    totalNcertChapters > 0 ? Math.round((revisedNcertCount / totalNcertChapters) * 100) : 0;

  // Toggle chapter revision directly from the new chart section
  const handleToggleChapter = async (chapterId: string) => {
    const nextVal = await dbService.toggleChapterRevised(profile.id, chapterId);
    setRevisedMap((prev) => ({ ...prev, [chapterId]: nextVal }));

    if (nextVal) {
      const newCount = revisedNcertCount + 1;
      if (newCount === totalNcertChapters || newCount % 5 === 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    }
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear((prev) => prev - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear((prev) => prev + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // ----------------------------------------------------
  // POMODORO FOCUS TIMER
  // ----------------------------------------------------
  const [pomoMode, setPomoMode] = useState<PomodoroMode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(POMODORO_DURATIONS.work);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0);
  const [isTabPaused, setIsTabPaused] = useState<boolean>(false);
  const wasActiveBeforeTabSwitch = useRef<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handlePomoComplete();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // Tab-Visibility Guard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isActive) {
          wasActiveBeforeTabSwitch.current = true;
          setIsActive(false);
          setIsTabPaused(true);
        }
      } else {
        if (wasActiveBeforeTabSwitch.current) {
          setIsTabPaused(true);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive]);

  const handlePomoComplete = async () => {
    setIsActive(false);
    confetti({
      particleCount: 85,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (pomoMode === 'work') {
      const bonusXP = 100;
      const updatedXP = await dbService.updateXP(profile.id, bonusXP);
      setSessionsCompleted((prev) => prev + 1);
      onProfileUpdated({ ...profile, current_xp: updatedXP });
      setPomoMode('shortBreak');
      setTimeLeft(POMODORO_DURATIONS.shortBreak);
    } else {
      setPomoMode('work');
      setTimeLeft(POMODORO_DURATIONS.work);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(POMODORO_DURATIONS[pomoMode]);
  };

  const handleModeChange = (mode: PomodoroMode) => {
    setPomoMode(mode);
    setIsActive(false);
    setTimeLeft(POMODORO_DURATIONS[mode]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalDuration = POMODORO_DURATIONS[pomoMode];
  const progressRatio = (totalDuration - timeLeft) / totalDuration;
  const strokeDashoffset = 283 - 283 * progressRatio;

  // Filtered chapters for the checklist below the new chart
  const displayedNcertChapters = allNcertChapters.filter(
    (c) => activeNcertSubject === 'All' || c.subject === activeNcertSubject
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* ------------------------------------------- */}
      {/* 1. MONTHLY PROGRESS ANALYTICS CHART         */}
      {/* ------------------------------------------- */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header with Month Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Monthly Task Consistency
              </h2>
              <p className="text-xs text-slate-400">
                Daily task completion history updated automatically
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-200 px-3 font-mono">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tasks Completed</span>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {totalTasksCompleted}
            </div>
            <div className="text-[10px] text-slate-500">This month</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Avg Completion</span>
            </div>
            <div className="text-2xl font-black text-cyan-400 font-mono">
              {avgCompletionRate}%
            </div>
            <div className="text-[10px] text-slate-500">Across active days</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Align</span>
            </div>
            <div className="text-2xl font-black text-indigo-400 font-mono">
              {targetAlignmentScore}%
            </div>
            <div className="text-[10px] text-slate-500">Target: {profile.target_percentage}%</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Active Streak</span>
            </div>
            <div className="text-2xl font-black text-orange-400 font-mono">
              {profile.streak_days || 0}d
            </div>
            <div className="text-[10px] text-slate-500">Consecutive active days</div>
          </div>
        </div>

        {/* Daily Bar Chart */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daily Task Completion (Day 1 to {history.length})</span>
            {selectedDayRecord && (
              <span className="font-semibold text-indigo-300">
                {selectedDayRecord.date}: {selectedDayRecord.completedCount} / {selectedDayRecord.totalCount} Tasks ({selectedDayRecord.percentage}%)
              </span>
            )}
          </div>

          <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-4 sm:p-6 overflow-x-auto">
            <div className="flex items-end justify-between gap-1 sm:gap-2 h-44 min-w-[500px]">
              {history.map((rec) => {
                const dayNum = parseInt(rec.date.split('-')[2], 10);
                const isToday = rec.date === todayStr;
                const isSelected = selectedDayRecord?.date === rec.date;

                let barColor = 'bg-slate-800/80';
                if (rec.percentage === 100) {
                  barColor = 'bg-gradient-to-t from-emerald-600 to-emerald-400';
                } else if (rec.percentage >= 60) {
                  barColor = 'bg-gradient-to-t from-cyan-600 to-cyan-400';
                } else if (rec.percentage > 0) {
                  barColor = 'bg-gradient-to-t from-amber-600 to-amber-400';
                }

                const barHeight = Math.max(8, (rec.percentage / 100) * 140);

                return (
                  <button
                    key={rec.date}
                    onClick={() => setSelectedDayRecord(rec)}
                    className="flex-1 flex flex-col items-center justify-end h-full group focus:outline-none"
                    title={`${rec.date}: ${rec.completedCount}/${rec.totalCount} tasks completed (${rec.percentage}%)`}
                  >
                    <div
                      className={`w-full max-w-[20px] rounded-t-md transition-all duration-300 group-hover:brightness-125 ${barColor} ${
                        isSelected ? 'ring-2 ring-indigo-400' : ''
                      }`}
                      style={{ height: `${barHeight}px` }}
                    />
                    <span
                      className={`text-[10px] font-mono mt-2 transition ${
                        isToday
                          ? 'text-cyan-400 font-bold underline'
                          : isSelected
                          ? 'text-white font-bold'
                          : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. NEW REAL-TIME NCERT SYLLABUS REVISION CHART (CLASSES 9-12)  */}
      {/* ------------------------------------------------------------- */}
      {isEligibleForNcert && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex flex-wrap items-center gap-2">
                  <span>NCERT Syllabus Revision Tracker</span>
                  {profile.grade === 'Class 9' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-300" />
                      2026–27 New NCERT Edition
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      NCERT Edition
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">
                  {profile.grade === 'Class 9'
                    ? 'Updated 2026-27 NCERT Textbooks: Science ("Exploration") & Mathematics ("Ganita Manjari")'
                    : `Real-time syllabus completion chart for ${profile.grade} ${profile.stream ? `(${profile.stream})` : ''}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{revisedNcertCount} / {totalNcertChapters} Chapters Revised ({ncertRevisionPercentage}%)</span>
            </div>
          </div>

          {/* Real-time Syllabus Chart Gauge & Subject Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 sm:p-6">
            {/* Left: Overall Circular Progress Ring */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeDasharray="264"
                    strokeDashoffset={264 - 264 * (ncertRevisionPercentage / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-mono text-3xl font-black text-white">
                    {ncertRevisionPercentage}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Syllabus Done
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-400 mt-2 font-medium">
                {revisedNcertCount} of {totalNcertChapters} NCERT Chapters
              </span>
            </div>

            {/* Right: Subject-by-Subject Progress Bars */}
            <div className="md:col-span-8 space-y-3.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Subject-Wise Coverage Breakdown
              </h4>
              {ncertGroups.map((group) => {
                const groupRevised = group.chapters.filter((c) => revisedMap[c.id]).length;
                const groupTotal = group.chapters.length;
                const groupPct = groupTotal > 0 ? Math.round((groupRevised / groupTotal) * 100) : 0;

                return (
                  <div key={group.subject} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{group.subject}</span>
                      <span className="text-slate-400 font-mono">
                        {groupRevised} / {groupTotal} ({groupPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${groupPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Chapter Checklist in front of all chapters */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Chapter Checklist (Click to Mark Revised)
              </span>

              {/* Subject Tabs */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setActiveNcertSubject('All')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    activeNcertSubject === 'All'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  All ({totalNcertChapters})
                </button>
                {ncertGroups.map((g) => (
                  <button
                    key={g.subject}
                    onClick={() => setActiveNcertSubject(g.subject)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      activeNcertSubject === g.subject
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {g.subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Checklist */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {displayedNcertChapters.map((chap) => {
                const isRevised = Boolean(revisedMap[chap.id]);
                return (
                  <div
                    key={chap.id}
                    onClick={() => handleToggleChapter(chap.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer select-none ${
                      isRevised
                        ? 'bg-emerald-950/20 border-emerald-800/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="shrink-0 text-slate-500">
                        {isRevised ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 font-mono mr-1.5 font-bold">
                          Ch {chap.chapterNumber}
                        </span>
                        <span className={`text-xs font-semibold ${isRevised ? 'text-slate-300' : 'text-slate-100'}`}>
                          {chap.name}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg shrink-0 flex items-center gap-1 ${
                        isRevised
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isRevised && <Check className="w-3 h-3 text-emerald-400" />}
                      <span>{isRevised ? 'Revised' : 'Mark Revised'}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------- */}
      {/* 3. POMODORO FOCUS TIMER (BELOW CHARTS)      */}
      {/* ------------------------------------------- */}
      <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 overflow-hidden">
        {/* Tab-Visibility Guard Friendly Overlay */}
        {isTabPaused && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">
              Focus Guard: Paused
            </h3>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed mb-4">
              You minimized or switched to another window. The timer was safely paused so your study metrics stay authentic.
            </p>
            <button
              onClick={() => {
                setIsTabPaused(false);
                wasActiveBeforeTabSwitch.current = false;
                setIsActive(true);
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Focus Session</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Pomodoro Focus Engine
            </h3>
            <p className="text-xs text-slate-400">
              Structured 25-minute deep focus sprints
            </p>
          </div>

          <div className="px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 border border-slate-700">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{sessionsCompleted} Sessions Completed</span>
          </div>
        </div>

        {/* Mode Toggles */}
        <div className="max-w-md mx-auto flex p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => handleModeChange('work')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              pomoMode === 'work'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => handleModeChange('shortBreak')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              pomoMode === 'shortBreak'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            5m Short Break
          </button>
          <button
            onClick={() => handleModeChange('longBreak')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              pomoMode === 'longBreak'
                ? 'bg-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            10m Long Reset
          </button>
        </div>

        {/* Circular Visualizer */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="transparent" stroke="#1e293b" strokeWidth="5" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke={pomoMode === 'work' ? '#6366f1' : '#10b981'}
                strokeWidth="5"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-mono text-5xl font-black text-white tracking-tight">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 mt-1">
                {pomoMode === 'work' ? 'Deep Work' : 'Break Time'}
              </span>
              {isActive && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Focus Active
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={resetTimer}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleTimer}
              className={`px-8 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition shadow-lg ${
                isActive
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Focus Session</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center text-xs text-slate-400">
          Tab-Visibility Guard is armed. Minimize or switch tabs will pause your timer.
        </div>
      </div>
    </div>
  );
};
