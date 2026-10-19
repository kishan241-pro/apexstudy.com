import React, { useState, useEffect } from 'react';
import { UserProfile, TodoTask, StudyMaterial, GradeLevel, StudentStream } from '../../types';
import { dbService } from '../../lib/supabase';
import { LeftSidebar } from './LeftSidebar';
import { DailyTasksView } from './DailyTasksView';
import { MonthlyProgressChart } from './MonthlyProgressChart';
import { NcertChecklistView } from './NcertChecklistView';
import { AIStudyKit } from './AIStudyKit';
import { AIChatBot } from './AIChatBot';
import {
  Bot,
  CheckCircle2,
  Menu,
  Zap,
  CalendarCheck2,
  TrendingUp,
  BookOpen,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useSubscription } from '../../SubscriptionContext';
import { PaywallOverlay } from '../../PaywallOverlay';
import { TrialBanner } from '../../TrialBanner';

interface StudentDashboardProps {
  initialProfile: UserProfile;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  initialProfile,
  onLogout,
}) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [activeNavTab, setActiveNavTab] = useState<
    'daily-tasks' | 'monthly-progress' | 'ncert-checklist' | 'ai-chat' | 'ai-notes'
  >('daily-tasks');
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [showManualPaywall, setShowManualPaywall] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Read subscription state from global context
  const { isTrialExpired, isPremium, daysRemaining, refreshSubscription } = useSubscription();

  // Check for upgrade toast from /payment-success redirect
  useEffect(() => {
    try {
      const savedToast = sessionStorage.getItem('apex_upgrade_toast');
      if (savedToast) {
        setToastMessage(savedToast);
        sessionStorage.removeItem('apex_upgrade_toast');
        setTimeout(() => setToastMessage(null), 5000);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Load today's 5 tasks & study materials
  const refreshTasksAndData = async () => {
    try {
      const currentProf = await dbService.getCurrentProfile();
      if (currentProf) setProfile(currentProf);

      const [loadedTasks, loadedMaterials] = await Promise.all([
        dbService.getTodayTasks(profile.id),
        dbService.getStudyMaterials(profile.id),
      ]);

      setTasks(loadedTasks);
      setMaterials(loadedMaterials);
    } catch {
      // Handled silently
    }
  };

  useEffect(() => {
    refreshTasksAndData();
  }, [profile.id]);

  const handleGradeChange = async (newGrade: GradeLevel, newStream?: StudentStream) => {
    const updated = await dbService.updateGradeAndStream(profile.id, newGrade, newStream);
    if (updated) {
      setProfile(updated);
      refreshTasksAndData();
    }
  };

  // SPECIFICATION 1.3: If difference > 7 AND 'is_premium' is false, block the dashboard layout
  // and render a beautiful, high-converting Paywall Overlay!
  if (isTrialExpired && !isPremium) {
    return (
      <PaywallOverlay
        userEmail={profile.email}
        onSimulateSuccess={async () => {
          await refreshSubscription();
          await refreshTasksAndData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row relative overflow-hidden">
      {/* Toast Notification from /payment-success upgrade */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-500 text-white font-semibold shadow-2xl shadow-emerald-500/30 border border-emerald-400 text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Optional Manual Paywall Preview modal */}
      {showManualPaywall && (
        <div className="relative">
          <PaywallOverlay
            userEmail={profile.email}
            onSimulateSuccess={async () => {
              setShowManualPaywall(false);
              await refreshSubscription();
              await refreshTasksAndData();
            }}
          />
          <button
            onClick={() => setShowManualPaywall(false)}
            className="fixed top-4 right-4 z-[60] px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold backdrop-blur cursor-pointer border border-slate-700"
          >
            Close Preview ✕
          </button>
        </div>
      )}

      {/* SPECIFICATION: Move dashboard navigation, monthly progress and study stats to clean aesthetic Left Side */}
      <LeftSidebar
        profile={profile}
        activeNavTab={activeNavTab}
        onNavTabChange={(tab) => setActiveNavTab(tab)}
        onGradeChange={handleGradeChange}
        onLogout={onLogout}
        onOpenUpgrade={() => setShowManualPaywall(true)}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area on the right */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile Top Header (only visible on mobile screens < md) */}
        <header className="md:hidden sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="font-black text-base text-white tracking-tight flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span>
                APEX<span className="text-indigo-400">STUDY</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {profile.grade}
            </span>
            <button
              onClick={() => setShowManualPaywall(true)}
              className="text-xs font-bold px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm cursor-pointer"
            >
              {isPremium ? 'VIP' : `${daysRemaining}d Trial`}
            </button>
          </div>
        </header>

        {/* Main View Body */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {/* Trial Days Countdown Banner */}
          <TrialBanner onOpenPaywall={() => setShowManualPaywall(true)} />

          {activeNavTab === 'daily-tasks' && (
            <DailyTasksView
              profile={profile}
              tasks={tasks}
              onTasksUpdated={refreshTasksAndData}
              onProfileUpdated={(up) => setProfile(up)}
            />
          )}

          {activeNavTab === 'monthly-progress' && (
            <MonthlyProgressChart
              profile={profile}
              onProfileUpdated={(up) => setProfile(up)}
            />
          )}

          {activeNavTab === 'ncert-checklist' && (
            <NcertChecklistView
              profile={profile}
              onRevisionUpdated={refreshTasksAndData}
            />
          )}

          {activeNavTab === 'ai-chat' && (
            <AIChatBot
              profile={profile}
              onProfileUpdated={(up) => setProfile(up)}
              onMaterialsUpdated={async () => {
                const updated = await dbService.getStudyMaterials(profile.id);
                setMaterials(updated);
              }}
            />
          )}

          {activeNavTab === 'ai-notes' && (
            <div className="max-w-4xl mx-auto">
              <AIStudyKit
                profile={profile}
                materials={materials}
                onMaterialsUpdated={async () => {
                  const updated = await dbService.getStudyMaterials(profile.id);
                  setMaterials(updated);
                }}
                onProfileUpdated={(up) => setProfile(up)}
              />
            </div>
          )}
        </main>

        {/* Mobile Bottom Navigation Bar (Ultra-clean phone navigation) */}
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 py-2 px-3 flex items-center justify-around"
        >
          <button
            onClick={() => setActiveNavTab('daily-tasks')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition ${
              activeNavTab === 'daily-tasks' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <CalendarCheck2 className="w-5 h-5" />
            <span className="text-[10px]">Tasks</span>
          </button>

          <button
            onClick={() => setActiveNavTab('monthly-progress')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition ${
              activeNavTab === 'monthly-progress' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px]">Progress</span>
          </button>

          <button
            onClick={() => setActiveNavTab('ai-chat')}
            className="flex flex-col items-center gap-1 p-1.5 rounded-xl text-cyan-400 font-bold"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md -mt-4 ring-4 ring-slate-950">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-[10px]">AI Tutor</span>
          </button>

          {profile.grade !== 'Class 8' && (
            <button
              onClick={() => setActiveNavTab('ncert-checklist')}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition ${
                activeNavTab === 'ncert-checklist' ? 'text-indigo-400 font-bold' : 'text-slate-400'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[10px]">NCERT</span>
            </button>
          )}

          <button
            onClick={() => setActiveNavTab('ai-notes')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition ${
              activeNavTab === 'ai-notes' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px]">Kits</span>
          </button>
        </nav>

        {/* Floating AI Tutor Quick Trigger Button (on desktop when not on ai-chat tab) */}
        {activeNavTab !== 'ai-chat' && (
          <button
            onClick={() => setActiveNavTab('ai-chat')}
            className="hidden md:flex fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition items-center gap-2.5 font-bold text-xs border border-indigo-400/40 group cursor-pointer"
            title="Open 24/7 ApexMentor AI Tutor & Notes Simplifier"
          >
            <Bot className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition shrink-0" />
            <span>Launch AI Academic Mentor</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
