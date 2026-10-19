import React, { useState, useEffect } from 'react';
import { UserProfile, TodoTask } from '../../types';
import { dbService, getLocalDateString } from '../../lib/supabase';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  RotateCw,
  Target,
  Award,
  Zap,
  CalendarCheck2,
  Clock,
  ArrowRight,
  Database,
  Calendar,
  Layers,
  ChevronRight,
  Flame,
  Info,
} from 'lucide-react';

interface DailyTasksViewProps {
  profile: UserProfile;
  tasks: TodoTask[];
  onTasksUpdated: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const DailyTasksView: React.FC<DailyTasksViewProps> = ({
  profile,
  tasks,
  onTasksUpdated,
  onProfileUpdated,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdvancingDay, setIsAdvancingDay] = useState(false);
  const [floatingXP, setFloatingXP] = useState<{ id: string; amount: number } | null>(null);
  const [viewTab, setViewTab] = useState<'today' | 'tomorrow'>('today');
  const [tomorrowTasks, setTomorrowTasks] = useState<TodoTask[]>([]);
  const [isLoadingTomorrow, setIsLoadingTomorrow] = useState(false);

  // Real-time countdown to midnight
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const activeDate = dbService.getActiveDate(profile.id);
  const tomorrowDate = dbService.getTomorrowDate(profile.id);
  const isSimulatedDate = activeDate !== getLocalDateString();

  // Tick countdown timer every second
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0); // Next 00:00:00
      const diffMs = midnight.getTime() - now.getTime();

      if (diffMs <= 0) {
        // Midnight arrived in real time!
        dbService.evaluateMidnightRollover(profile.id).then(() => {
          onTasksUpdated();
        });
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        setTimeRemaining({ hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [profile.id, onTasksUpdated]);

  // Load tomorrow's next-day tasks when viewing tomorrow tab
  useEffect(() => {
    if (viewTab === 'tomorrow') {
      setIsLoadingTomorrow(true);
      dbService
        .getNextDayTasks(profile.id)
        .then((t) => setTomorrowTasks(t))
        .catch(() => {})
        .finally(() => setIsLoadingTomorrow(false));
    }
  }, [viewTab, profile.id, tasks]);

  // Compute counts
  const currentDisplayedTasks = viewTab === 'today' ? tasks : tomorrowTasks;
  const completedCount = currentDisplayedTasks.filter((t) => t.completed).length;
  const totalCount = currentDisplayedTasks.length || 5;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Toggle task completion (check in)
  const handleToggleTask = async (task: TodoTask) => {
    const nextStatus = !task.completed;
    await dbService.toggleTask(profile.id, task.id, nextStatus);

    if (nextStatus) {
      const earnedXP = task.xp_reward || 50;
      const updatedXP = await dbService.updateXP(profile.id, earnedXP);

      setFloatingXP({ id: task.id, amount: earnedXP });
      setTimeout(() => setFloatingXP(null), 1800);

      // Level check
      const oldLevel = Math.floor((profile.current_xp || 0) / 250) + 1;
      const newLevel = Math.floor(updatedXP / 250) + 1;

      if (newLevel > oldLevel) {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
        });
      }

      onProfileUpdated({
        ...profile,
        current_xp: updatedXP,
      });
    }

    onTasksUpdated();

    // If on tomorrow tab, also refresh tomorrow tasks state
    if (viewTab === 'tomorrow') {
      const updatedTom = await dbService.getNextDayTasks(profile.id);
      setTomorrowTasks(updatedTom);
    }
  };

  // Re-generate fresh 5 AI tasks for active day
  const handleRefreshTasks = async () => {
    setIsRefreshing(true);
    try {
      await dbService.generateFreshDailyTasks(
        profile.id,
        profile.grade,
        profile.target_percentage,
        profile.name,
        profile.stream
      );
      onTasksUpdated();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Advance to next day (simulate end of day rollover in real time)
  const handleAdvanceDay = async () => {
    setIsAdvancingDay(true);
    try {
      const result = await dbService.advanceToNextDay(profile.id);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.5 },
      });
      setViewTab('today');
      onTasksUpdated();
    } finally {
      setIsAdvancingDay(false);
    }
  };

  // Reset to actual real-time date
  const handleResetToRealTime = () => {
    dbService.resetToRealTimeDate(profile.id);
    setViewTab('today');
    onTasksUpdated();
  };

  const isSenior = profile.grade === 'Class 11' || profile.grade === 'Class 12';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Student Welcome & Target Overview Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              {profile.grade} {isSenior && profile.stream ? `• ${profile.stream}` : ''} Plan
            </span>

            {profile.grade === 'Class 9' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                2026–27 NCERT Edition
              </span>
            )}

            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              Target: {profile.target_percentage}%
            </span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            Hello, {profile.name || 'Scholar'}!
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Check in your daily tasks below. When the day ends at midnight, your progress is recorded and the next day&apos;s adaptive curriculum tasks automatically arrive.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-white">Daily Check-in</div>
            <div className="text-xs font-mono text-cyan-400">
              {completedCount} of {totalCount} Done ({progressPercent}%)
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-sm">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Real-time Day Rollover & Countdown Tracker Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Clock className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Real-Time Day Rollover Engine
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              Active Date: <span className="text-cyan-400 font-mono font-semibold">{activeDate}</span> • Day ends in:{' '}
              <span className="font-mono text-amber-400 font-bold">
                {String(timeRemaining.hours).padStart(2, '0')}h{' '}
                {String(timeRemaining.minutes).padStart(2, '0')}m{' '}
                {String(timeRemaining.seconds).padStart(2, '0')}s
              </span>
            </p>
          </div>
        </div>

        {/* Real-time Day Advance & Simulator Control */}
        <div className="flex items-center gap-2">
          {isSimulatedDate && (
            <button
              onClick={handleResetToRealTime}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-semibold border border-amber-500/30 transition"
              title="Reset back to current calendar today"
            >
              Reset to Today
            </button>
          )}

          <button
            onClick={handleAdvanceDay}
            disabled={isAdvancingDay}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 shrink-0"
            title="Simulate day end in real time: archives today's completed tasks, advances the date, and loads tomorrow's AI tasks"
          >
            <span>{isAdvancingDay ? 'Advancing Day...' : 'Advance to Next Day'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5 Daily Tasks Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        {/* Navigation Tabs: Today vs Tomorrow's Schedule */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewTab('today')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewTab === 'today'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Today&apos;s Tasks ({activeDate})</span>
            </button>

            <button
              onClick={() => setViewTab('tomorrow')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewTab === 'tomorrow'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tomorrow&apos;s AI Schedule ({tomorrowDate})</span>
            </button>
          </div>

          <button
            onClick={handleRefreshTasks}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-semibold flex items-center gap-1.5 border border-slate-700 self-start sm:self-auto"
            title="Re-generate fresh daily AI study tasks for this class"
          >
            <RotateCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Regenerating...' : 'Regenerate Tasks'}</span>
          </button>
        </div>

        {/* Sub-header status */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{viewTab === 'today' ? "Today's 5 Active Tasks" : "Tomorrow's Pre-Generated Schedule"}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Curriculum Synchronized
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {viewTab === 'today'
                ? 'Check in completed tasks to earn XP and automatically queue tomorrow’s schedule.'
                : 'Tasks pre-generated and ready to activate as soon as today ends.'}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Real-Time State</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Tasks Runner List */}
        <div className="space-y-3 pt-1">
          {isLoadingTomorrow ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <RotateCw className="w-5 h-5 text-indigo-400 animate-spin mx-auto" />
              <p>Preparing tomorrow&apos;s academic schedule...</p>
            </div>
          ) : currentDisplayedTasks.length > 0 ? (
            currentDisplayedTasks.map((task, index) => {
              const isFloating = floatingXP?.id === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task)}
                  className={`group relative flex items-start justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    task.completed
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950 shadow-sm'
                  }`}
                >
                  {/* Floating XP Toast */}
                  {isFloating && (
                    <div className="absolute right-6 -top-3 z-30 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-lg animate-bounce">
                      +{floatingXP.amount} XP!
                    </div>
                  )}

                  <div className="flex items-start gap-3 flex-1 min-w-0 pr-3">
                    <div className="mt-0.5 shrink-0 text-slate-500 group-hover:text-indigo-400 transition">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <p
                        className={`text-sm font-medium leading-snug break-words ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {task.text}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700/60">
                          {task.subject}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Task #{index + 1} • {task.day_date}
                        </span>
                        {task.completed && (
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            Checked in
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl font-mono ${
                        task.completed
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      +{task.xp_reward || 50} XP
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No tasks found. Click &quot;Regenerate Tasks&quot; to formulate 5 daily study goals.
            </div>
          )}
        </div>

        {/* Informative footer */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Checked-in tasks update your streak & automatically pre-fill tomorrow&apos;s schedule</span>
          </span>
          <span className="font-semibold text-slate-300">
            Enterprise Academic Engine
          </span>
        </div>
      </div>
    </div>
  );
};
