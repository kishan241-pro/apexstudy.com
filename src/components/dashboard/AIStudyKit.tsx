import React, { useState, useRef } from 'react';
import { UserProfile, StudyMaterial, Flashcard, QuizQuestion } from '../../types';
import { dbService } from '../../lib/supabase';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  UploadCloud,
  FileText,
  ListOrdered,
  HelpCircle,
  RotateCw,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  AlertCircle,
  Copy,
  Check,
  Zap,
  FolderOpen,
} from 'lucide-react';

interface AIStudyKitProps {
  profile: UserProfile;
  materials: StudyMaterial[];
  onMaterialsUpdated: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
}

const SAMPLE_TEXTS: Record<string, { title: string; content: string }> = {
  bio10: {
    title: 'Grade 10 Biology: Cellular Respiration & ATP Cycle',
    content: `Cellular respiration is the biochemical process by which cells break down glucose molecules in the presence of oxygen to release adenosine triphosphate (ATP), the universal energy currency of living cells.
The chemical equation is: C6H12O6 + 6O2 -> 6CO2 + 6H2O + 36-38 ATP.
Stage 1: Glycolysis occurs in the cell cytoplasm without requiring oxygen (anaerobic). One 6-carbon glucose molecule is cleaved into two 3-carbon pyruvate molecules, with a net yield of 2 ATP and 2 NADH.
Stage 2: The Krebs Cycle (Citric Acid Cycle) takes place inside the mitochondrial matrix under aerobic conditions. Pyruvate is converted to Acetyl-CoA, producing carbon dioxide, ATP, NADH, and FADH2 electron carriers.
Stage 3: Oxidative Phosphorylation occurs along the inner mitochondrial cristae membrane. High-energy electrons traverse the electron transport chain, generating a proton gradient that drives ATP synthase to generate the bulk of cellular ATP (~32 ATP).
Under anaerobic conditions in human muscle cells, lactic acid fermentation occurs, yielding only 2 ATP per glucose and temporary muscle fatigue.`,
  },
  phys11: {
    title: "Grade 11 Physics: Newton's Laws & Frictional Forces",
    content: `Newton's First Law (Law of Inertia) states that an object persists in its state of rest or uniform rectilinear motion unless acted upon by a non-zero external resultant force.
Newton's Second Law establishes the fundamental equation of motion: F = dp/dt. For constant mass systems, Net Force = mass * acceleration (F = m * a). Force is measured in Newtons (kg * m / s^2).
Newton's Third Law states that every action force produces an equal and opposite reaction force, acting on two distinct interacting bodies simultaneously.
Friction is the contact resistive force parallel to the interface that opposes relative sliding motion.
Static Friction (f_s <= mu_s * N) opposes impending relative motion, reaching its maximum threshold at limiting friction.
Kinetic Friction (f_k = mu_k * N) acts during active relative motion. Generally, the coefficient of kinetic friction (mu_k) is lower than static friction (mu_s) because microscopic surface asperities have less time to cold-weld.`,
  },
  chem12: {
    title: 'Grade 12 Chemistry: Organic Reaction Mechanisms & Kinetics',
    content: `Nucleophilic Substitution reactions are categorized into SN1 and SN2 pathways based on reaction kinetics and stereochemical outcomes.
SN2 Mechanism: Bi-molecular, single-step concerted process characterized by second-order rate kinetics: Rate = k[substrate][nucleophile]. The incoming nucleophile attacks the electrophilic carbon from the backside opposite to the leaving group, producing complete Walden inversion of stereochemical configuration. Favored by primary alkyl halides and strong nucleophiles in polar aprotic solvents (e.g., DMSO, acetone).
SN1 Mechanism: Uni-molecular two-step process initiated by the slow, rate-determining departure of the leaving group to form a planar carbocation intermediate: Rate = k[substrate]. The nucleophile attacks the flat carbocation with equal probability from either side, resulting in partial or complete racemization. Favored by tertiary alkyl halides, weak nucleophiles, and polar protic solvents (e.g., H2O, ethanol).
Markovnikov's Rule: In electrophilic additions to asymmetric alkenes, the acidic proton attaches to the carbon possessing more hydrogen atoms to yield the more stable carbocation intermediate.`,
  },
};

export const AIStudyKit: React.FC<AIStudyKitProps> = ({
  profile,
  materials,
  onMaterialsUpdated,
  onProfileUpdated,
}) => {
  // Input form state
  const [inputText, setInputText] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  // Active Kit State
  const [activeKit, setActiveKit] = useState<{
    title: string;
    summary: string[];
    flashcards: Flashcard[];
    quiz: QuizQuestion[];
  } | null>(
    materials.length > 0
      ? {
          title: materials[0].title,
          summary: materials[0].summary,
          flashcards: materials[0].flashcards,
          quiz: materials[0].quiz,
        }
      : null
  );

  // Tab State: 'summary' | 'flashcards' | 'quiz'
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz'>('summary');

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Record<number, boolean>>({});

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Drag and drop target
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Handle file drop / read
  const handleFileProcess = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setInputText(content);
        if (!docTitle) {
          setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Submit notes to Google AI backend tunnel (/api/generate-study-kit)
  const handleGenerateStudyKit = async (overrideText?: string, overrideTitle?: string) => {
    const textToProcess = overrideText || inputText;
    const titleToProcess = overrideTitle || docTitle || `${profile.grade} Study Notes`;

    if (!textToProcess.trim()) {
      setErrorModal({
        show: true,
        message: 'Please paste notes or select a sample chapter to generate your study kit.',
      });
      return;
    }

    setIsProcessing(true);
    setErrorModal({ show: false, message: '' });

    try {
      const res = await fetch('/api/generate-study-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToProcess,
          grade: profile.grade,
          title: titleToProcess,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'AI generation failed. Please retry.');
      }

      const { summary, flashcards, quiz } = result.data;

      // Save to Supabase / Persistent Storage
      await dbService.saveStudyMaterial({
        user_id: profile.id,
        title: titleToProcess,
        raw_content: textToProcess.slice(0, 1000),
        summary,
        flashcards,
        quiz,
      });

      // Update UI state
      setActiveKit({
        title: titleToProcess,
        summary,
        flashcards,
        quiz,
      });

      // Reset flashcard and quiz states
      setCardIndex(0);
      setIsFlipped(false);
      setKnownCards({});
      setSelectedAnswers({});
      setQuizSubmitted(false);
      setActiveTab('summary');

      // Award bonus XP for notes upload
      const newXP = await dbService.updateXP(profile.id, 75);
      onProfileUpdated({ ...profile, current_xp: newXP });

      onMaterialsUpdated();
    } catch (err: any) {
      setErrorModal({
        show: true,
        message: err.message || 'Unable to generate Study Kit. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick-load sample syllabus notes
  const handleLoadSample = (key: string) => {
    const sample = SAMPLE_TEXTS[key];
    if (sample) {
      setInputText(sample.content);
      setDocTitle(sample.title);
      handleGenerateStudyKit(sample.content, sample.title);
    }
  };

  // Flashcards handlers
  const handleCardNext = () => {
    if (!activeKit) return;
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % activeKit.flashcards.length);
  };

  const handleCardPrev = () => {
    if (!activeKit) return;
    setIsFlipped(false);
    setCardIndex((prev) => (prev === 0 ? activeKit.flashcards.length - 1 : prev - 1));
  };

  const handleMarkCard = (known: boolean) => {
    setKnownCards((prev) => ({ ...prev, [cardIndex]: known }));
    handleCardNext();
  };

  // Quiz handlers
  const handleSelectQuizOption = (qIdx: number, option: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeKit) return;
    let score = 0;
    activeKit.quiz.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      if (selected && selected.trim() === q.correctAnswer.trim()) {
        score++;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    if (score >= 7) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
      // Award high-score bonus XP
      const newXP = await dbService.updateXP(profile.id, 150);
      onProfileUpdated({ ...profile, current_xp: newXP });
    }
  };

  const handleCopySummary = () => {
    if (!activeKit) return;
    navigator.clipboard.writeText(activeKit.summary.join('\n• '));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full space-y-5">
      {/* Retry Modal on Error */}
      {errorModal.show && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Generation Error
          </h3>
          <p className="text-xs text-slate-300 max-w-sm leading-relaxed mb-4">
            {errorModal.message}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setErrorModal({ show: false, message: '' })}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              Dismiss
            </button>
            <button
              onClick={() => handleGenerateStudyKit()}
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Academic Study Synthesis Engine
            </h2>
            <p className="text-xs text-slate-400">
              Structured summaries, active-recall flashcards & mastery quizzes
            </p>
          </div>
        </div>

        {materials.length > 0 && (
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-cyan-400" />
            <span>{materials.length} Saved</span>
          </span>
        )}
      </div>

      {/* Upload & Paste Section */}
      <div className="space-y-3">
        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center ${
            isDragOver
              ? 'border-cyan-500 bg-cyan-500/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
            accept=".txt,.md"
            className="hidden"
          />
          <UploadCloud className="w-7 h-7 text-cyan-400 mb-1" />
          <p className="text-xs font-semibold text-slate-200">
            Drop your chapter notes or syllabus extract (.txt, .md)
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            or click to browse from your device
          </p>
        </div>

        {/* Text Paste Box */}
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Chapter Title (e.g. Cellular Respiration)"
              className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            placeholder="Paste rough lecture notes, textbook extracts, or revision text here..."
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none font-mono"
          />
        </div>

        {/* Preset Sample Quick-Load Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mr-1">
            <FolderOpen className="w-3 h-3 text-cyan-400" />
            Quick Presets:
          </span>
          <button
            onClick={() => handleLoadSample('bio10')}
            className="text-[10px] px-2 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
          >
            Bio 10: ATP Cycle
          </button>
          <button
            onClick={() => handleLoadSample('phys11')}
            className="text-[10px] px-2 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
          >
            Phys 11: Newton&apos;s Laws
          </button>
          <button
            onClick={() => handleLoadSample('chem12')}
            className="text-[10px] px-2 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
          >
            Chem 12: Organic SN1/SN2
          </button>
        </div>

        {/* Generate Button */}
        <button
          onClick={() => handleGenerateStudyKit()}
          disabled={isProcessing}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Generating {profile.grade} AI Study Kit...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Study Kit</span>
            </>
          )}
        </button>
      </div>

      {/* Render 3-Tab Content Panel */}
      {activeKit && (
        <div className="flex-1 flex flex-col bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden min-h-[300px]">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-900/60">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'summary'
                  ? 'border-b-2 border-cyan-400 text-cyan-300 bg-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Summary</span>
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'flashcards'
                  ? 'border-b-2 border-indigo-400 text-indigo-300 bg-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Flashcards ({activeKit.flashcards.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'quiz'
                  ? 'border-b-2 border-emerald-400 text-emerald-300 bg-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Quiz ({activeKit.quiz.length}Q)</span>
            </button>
          </div>

          {/* Active Tab Panel Body */}
          <div className="p-4 flex-1 overflow-y-auto">
            {/* TAB 1: SUMMARY */}
            {activeTab === 'summary' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{activeKit.title}</span>
                  </h3>
                  <button
                    onClick={handleCopySummary}
                    className="text-[11px] font-medium text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 transition"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2.5">
                  {activeKit.summary.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: FLASHCARDS */}
            {activeTab === 'flashcards' && activeKit.flashcards.length > 0 && (
              <div className="flex flex-col h-full space-y-4 justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Card {cardIndex + 1} of {activeKit.flashcards.length}
                  </span>
                  <span className="text-emerald-400 font-medium">
                    {Object.values(knownCards).filter(Boolean).length} Mastered
                  </span>
                </div>

                {/* 3D Flip Card */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="cursor-pointer min-h-[170px] bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-indigo-900/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner hover:border-indigo-500/60 transition group select-none"
                >
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-2">
                    {isFlipped ? 'Answer (Click to Flip)' : 'Question (Click to Reveal)'}
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-white leading-relaxed max-w-sm">
                    {isFlipped
                      ? activeKit.flashcards[cardIndex]?.answer
                      : activeKit.flashcards[cardIndex]?.question}
                  </p>
                  <span className="text-[10px] text-slate-500 mt-4 group-hover:text-indigo-300 transition">
                    🔄 Click anywhere on the card to flip
                  </span>
                </div>

                {/* Flashcard Navigation & Assessment */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={handleCardPrev}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkCard(false)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition"
                    >
                      Need Review
                    </button>
                    <button
                      onClick={() => handleMarkCard(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold transition"
                    >
                      Mastered (+XP)
                    </button>
                  </div>

                  <button
                    onClick={handleCardNext}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: QUIZ (10 Questions) */}
            {activeTab === 'quiz' && activeKit.quiz.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-200">
                    Self-Checking Practice Quiz ({activeKit.quiz.length} Questions)
                  </span>
                  {quizSubmitted && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        quizScore >= 7
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      Score: {quizScore} / {activeKit.quiz.length} ({Math.round((quizScore / activeKit.quiz.length) * 100)}%)
                    </span>
                  )}
                </div>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {activeKit.quiz.map((q, qIdx) => {
                    const studentChoice = selectedAnswers[qIdx];
                    return (
                      <div
                        key={qIdx}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-bold text-cyan-400 shrink-0">
                            Q{qIdx + 1}.
                          </span>
                          <p className="text-xs font-medium text-slate-200 leading-snug">
                            {q.question}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-1.5 pl-5">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = studentChoice === opt;
                            const isCorrect = q.correctAnswer.trim() === opt.trim();

                            let buttonStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800';
                            if (quizSubmitted) {
                              if (isCorrect) {
                                buttonStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-semibold';
                              } else if (isSelected && !isCorrect) {
                                buttonStyle = 'bg-rose-500/20 border-rose-500/60 text-rose-200 font-semibold';
                              }
                            } else if (isSelected) {
                              buttonStyle = 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-semibold';
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectQuizOption(qIdx, opt)}
                                className={`text-left p-2 rounded-lg text-xs border transition flex items-center justify-between ${buttonStyle}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && isCorrect && (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                )}
                                {quizSubmitted && isSelected && !isCorrect && (
                                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quiz Action CTA */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {Object.keys(selectedAnswers).length} of {activeKit.quiz.length} Answered
                  </span>
                  {!quizSubmitted ? (
                    <button
                      onClick={handleSubmitQuiz}
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-lg shadow-emerald-600/20"
                    >
                      Submit & Check Answers (+150 XP)
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                    >
                      Retake Quiz
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer hint */}
      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Powered by Google AI Studio Gemini engine</span>
        <span className="text-cyan-400 font-semibold">+75 XP per kit</span>
      </div>
    </div>
  );
};
