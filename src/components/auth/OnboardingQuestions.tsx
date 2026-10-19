import React, { useState } from 'react';
import { GradeLevel, StudentStream, UserProfile } from '../../types';
import { dbService } from '../../lib/supabase';
import {
  Sparkles,
  ArrowRight,
  Target,
  User,
  Zap,
  Layers,
  Award,
  BookOpen,
  Calculator,
  HeartPulse,
  Briefcase,
  Compass,
} from 'lucide-react';

interface OnboardingQuestionsProps {
  userId: string;
  userEmail: string;
  onComplete: (profile: UserProfile) => void;
}

interface GradeCardConfig {
  grade: GradeLevel;
  title: string;
  badge: string;
  description: string;
  color: string;
  borderColor: string;
  icon: React.ReactNode;
}

const GRADE_MATRIX: GradeCardConfig[] = [
  {
    grade: 'Class 8',
    title: 'Middle School Explorer',
    badge: 'Foundation',
    description: 'Master fundamentals in Science, Mathematics & Logical Reasoning.',
    color: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderColor: 'hover:border-emerald-500/60 border-emerald-500/20',
    icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
  },
  {
    grade: 'Class 9',
    title: 'Secondary Bridge',
    badge: 'Pre-Board',
    description: 'Newtonian physics, algebra, coordinate geometry & concept mastery.',
    color: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    borderColor: 'hover:border-cyan-500/60 border-cyan-500/20',
    icon: <Layers className="w-5 h-5 text-cyan-400" />,
  },
  {
    grade: 'Class 10',
    title: 'Board Exam Mastery',
    badge: 'High Stakes',
    description: 'High-yield board preparation, NCERT PYQs & 5 daily score-booster tasks.',
    color: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    borderColor: 'hover:border-indigo-500/60 border-indigo-500/20',
    icon: <Award className="w-5 h-5 text-indigo-400" />,
  },
  {
    grade: 'Class 11',
    title: 'Senior Secondary Deep-Dive',
    badge: 'Specialized Stream',
    description: 'Tailored study tracks for PCM, PCB, Commerce, and Arts streams.',
    color: 'from-violet-500/20 via-fuchsia-500/10 to-transparent',
    borderColor: 'hover:border-violet-500/60 border-violet-500/20',
    icon: <Target className="w-5 h-5 text-violet-400" />,
  },
  {
    grade: 'Class 12',
    title: 'Final Boards & Entrance',
    badge: 'Peak Milestone',
    description: 'Class 12 Boards & Entrance mastery customized to your specific stream.',
    color: 'from-rose-500/20 via-amber-500/10 to-transparent',
    borderColor: 'hover:border-rose-500/60 border-rose-500/20',
    icon: <Zap className="w-5 h-5 text-rose-400" />,
  },
];

const TARGET_PRESETS = [85, 90, 95, 98];

const STREAM_OPTIONS: {
  stream: StudentStream;
  title: string;
  subjects: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    stream: 'PCM',
    title: 'PCM',
    subjects: 'Physics • Chemistry • Mathematics',
    icon: <Calculator className="w-5 h-5 text-indigo-400" />,
    color: 'hover:border-indigo-500/70 border-indigo-500/30 bg-indigo-950/30',
  },
  {
    stream: 'PCB',
    title: 'PCB',
    subjects: 'Physics • Chemistry • Biology',
    icon: <HeartPulse className="w-5 h-5 text-emerald-400" />,
    color: 'hover:border-emerald-500/70 border-emerald-500/30 bg-emerald-950/30',
  },
  {
    stream: 'COMMERCE',
    title: 'COMMERCE',
    subjects: 'Accountancy • Economics • Business Studies',
    icon: <Briefcase className="w-5 h-5 text-amber-400" />,
    color: 'hover:border-amber-500/70 border-amber-500/30 bg-amber-950/30',
  },
  {
    stream: 'ARTS',
    title: 'ARTS',
    subjects: 'History • Political Science • Psychology • Sociology',
    icon: <Compass className="w-5 h-5 text-rose-400" />,
    color: 'hover:border-rose-500/70 border-rose-500/30 bg-rose-950/30',
  },
];

export const OnboardingQuestions: React.FC<OnboardingQuestionsProps> = ({
  userId,
  userEmail,
  onComplete,
}) => {
  const [name, setName] = useState('');
  const [targetPercentage, setTargetPercentage] = useState<number>(95);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [selectedStream, setSelectedStream] = useState<StudentStream>('PCM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isSeniorClass = selectedGrade === 'Class 11' || selectedGrade === 'Class 12';

  // Handle class selection
  const handleSelectGrade = async (grade: GradeLevel) => {
    if (!name.trim()) {
      setError('Please enter your name first.');
      return;
    }

    setSelectedGrade(grade);
    setError('');

    // If Class 8, 9, or 10: complete immediately (no stream question!)
    if (grade !== 'Class 11' && grade !== 'Class 12') {
      await finalizeOnboarding(grade, undefined);
    }
  };

  // Finalize onboarding for Class 11/12 with chosen stream
  const handleFinalizeSeniorOnboarding = async (stream: StudentStream) => {
    if (!selectedGrade) return;
    setSelectedStream(stream);
    await finalizeOnboarding(selectedGrade, stream);
  };

  const finalizeOnboarding = async (grade: GradeLevel, stream?: StudentStream) => {
    setIsSubmitting(true);
    try {
      const updated = await dbService.completeOnboarding(
        userId,
        name.trim(),
        targetPercentage,
        grade,
        stream
      );
      onComplete(updated);
    } catch {
      setError('Failed to setup your plan. Please retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Navbar */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">APEX<span className="text-indigo-400">STUDY</span></span>
            <span className="ml-2 text-xs text-slate-500">Student Profile Setup</span>
          </div>
        </div>
      </div>

      {/* Main Questionnaire */}
      <div className="max-w-4xl w-full mx-auto my-auto py-6 space-y-8 animate-fade-in">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalize Your Curriculum & 5 Daily AI Tasks</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Configure Your Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Answer the questions below so your daily tasks match your exact syllabus and goals.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        {/* Question 1: Name & Question 2: Target Percentage Card */}
        <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
          {/* Question 1: Name */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>1. What is your name?</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Alex Sharma"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
            <p className="text-[11px] text-slate-500">
              Personalizes your daily study dashboard.
            </p>
          </div>

          {/* Question 2: Target Percentage */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Target Percentage?</span>
              </span>
              <span className="text-xs font-black text-emerald-400 font-mono">
                {targetPercentage}%
              </span>
            </label>

            <div className="flex gap-1.5">
              {TARGET_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTargetPercentage(preset)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                    targetPercentage === preset
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>

            <input
              type="range"
              min="70"
              max="100"
              value={targetPercentage}
              onChange={(e) => setTargetPercentage(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
            />
          </div>
        </div>

        {/* Question 3: Class Selection Matrix */}
        <div className="space-y-3">
          <div className="text-center">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              3. Choose Your Class
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your academic year to set up your curriculum.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {GRADE_MATRIX.map((item) => {
              const isSelected = selectedGrade === item.grade;
              return (
                <button
                  key={item.grade}
                  type="button"
                  onClick={() => handleSelectGrade(item.grade)}
                  disabled={isSubmitting}
                  className={`group relative text-left p-4 rounded-xl bg-gradient-to-b ${item.color} bg-slate-900/90 border ${
                    isSelected ? 'ring-2 ring-indigo-400 border-indigo-400' : item.borderColor
                  } transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between min-h-[220px] focus:outline-none`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-white/5">
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {item.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-indigo-300 transition">
                        {item.grade}
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-300 mt-0.5">
                        {item.title}
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5">
                    <div className="w-full py-1.5 px-2.5 rounded-lg bg-white/10 group-hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition">
                      <span>Select {item.grade}</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question 4 (ONLY for Class 11 and Class 12): Stream Selection */}
        {isSeniorClass && (
          <div className="space-y-4 pt-4 border-t border-slate-800/80 animate-fade-in">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
                <Target className="w-3.5 h-3.5 text-violet-400" />
                <span>Specialized Curriculum for {selectedGrade}</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-white">
                4. Which stream have you chosen for {selectedGrade}?
              </h2>
              <p className="text-xs text-slate-400">
                Your 5 daily AI tasks will be generated specifically for your selected stream.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-4xl mx-auto">
              {STREAM_OPTIONS.map((opt) => (
                <button
                  key={opt.stream}
                  type="button"
                  onClick={() => handleFinalizeSeniorOnboarding(opt.stream)}
                  disabled={isSubmitting}
                  className={`p-4 rounded-2xl border text-left transition transform hover:-translate-y-1 flex flex-col justify-between min-h-[140px] ${opt.color} ${
                    selectedStream === opt.stream ? 'ring-2 ring-indigo-400' : ''
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-slate-950/80 border border-white/10">
                        {opt.icon}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Stream
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-white">
                        {opt.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-snug mt-1">
                        {opt.subjects}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 mt-2">
                    <div className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition">
                      {isSubmitting && selectedStream === opt.stream ? (
                        <span>Launching...</span>
                      ) : (
                        <>
                          <span>Choose {opt.title}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-5xl w-full mx-auto text-center py-4 text-xs text-slate-500 border-t border-slate-900">
        ApexStudy • Complete personalization for Grades 8–12
      </div>
    </div>
  );
};
