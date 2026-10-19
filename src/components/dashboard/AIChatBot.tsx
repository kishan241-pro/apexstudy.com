import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage, ChatAttachment, Flashcard, QuizQuestion } from '../../types';
import { dbService } from '../../lib/supabase';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Send,
  Image as ImageIcon,
  X,
  UploadCloud,
  Bot,
  User,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Check,
  Copy,
  Zap,
  BookOpen,
  Layers,
  AlertCircle,
  Clock,
  ListOrdered,
  FileCheck,
  Flame,
} from 'lucide-react';
import { useAIRateLimiter, AILoadingSpinnerLock } from '../../AIRateLimiter';

interface AIChatBotProps {
  profile: UserProfile;
  onProfileUpdated?: (updated: UserProfile) => void;
  onMaterialsUpdated?: () => void;
}

const QUICK_PROMPTS = [
  '📸 Upload handwritten notes for instant simplified version + flashcards & quiz',
  '📐 Solve a tough Maths numerical step-by-step',
  '🧬 Explain Science concepts with real-world examples',
  '📅 Create a 4-hour high-retention study timetable',
  '💡 Give me high-scoring exam writing strategies',
];

export const AIChatBot: React.FC<AIChatBotProps> = ({
  profile,
  onProfileUpdated,
  onMaterialsUpdated,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(`apex_chat_${profile.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [
      {
        id: 'msg_welcome',
        sender: 'assistant',
        text: `Hello ${profile.name || 'Scholar'}! 👋 I am **ApexMentor**, your 24/7 personal AI academic tutor for **${profile.grade}** ${profile.stream ? `(${profile.stream})` : ''}.

I'm ready to help you with **every single thing you need**:
1. 📸 **Visual Notes Deciphering**: Attach handwritten notebook pages or textbook diagrams for instant concept simplification, active-recall flashcards, and self-testing quizzes!
2. 🧮 **Step-by-Step Problem Solving**: Math derivations, Physics numericals, Chemistry reaction mechanisms, Biology diagrams, and Social Science answers.
3. 🎯 **Exam Prep & Timetables**: Clear doubts, formulate revision routines, and master the 2026-27 NCERT syllabus.

How can I help you excel today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [fileLimitWarning, setFileLimitWarning] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedKitIds, setSavedKitIds] = useState<Record<string, boolean>>({});

  // Active interactive widget states for study kits embedded in messages
  const [activeTabPerMessage, setActiveTabPerMessage] = useState<Record<string, 'summary' | 'flashcards' | 'quiz'>>({});
  const [cardIndexPerMessage, setCardIndexPerMessage] = useState<Record<string, number>>({});
  const [cardFlippedPerMessage, setCardFlippedPerMessage] = useState<Record<string, boolean>>({});
  const [quizAnswersPerMessage, setQuizAnswersPerMessage] = useState<Record<string, Record<number, string>>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem(`apex_chat_${profile.id}`, JSON.stringify(messages));
  }, [messages, profile.id]);

  // Handle image files selection (strictly max 3 images at a time)
  const handleImageFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setFileLimitWarning(null);

    const currentCount = attachments.length;
    const remainingSlots = 3 - currentCount;

    if (remainingSlots <= 0) {
      setFileLimitWarning('Maximum document batch allowance reached. Please remove an image before adding more.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setFileLimitWarning(`Attached up to the maximum batch allowance (${remainingSlots} added).`);
    }

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setFileLimitWarning('Please upload valid image files only (JPG, PNG, WEBP).');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fullDataUrl = e.target?.result as string;
        if (!fullDataUrl) return;

        // Extract base64 without prefix
        const base64Data = fullDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');

        const newAttachment: ChatAttachment = {
          id: 'att_' + Math.random().toString(36).substring(2, 9),
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
          base64Data,
          previewUrl: fullDataUrl,
        };

        setAttachments((prev) => {
          if (prev.length >= 3) return prev;
          return [...prev, newAttachment];
        });
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    setFileLimitWarning(null);
  };

  const { executeWithRateLimiter, triggerRateLimit, isAIActive, activeActionLabel } = useAIRateLimiter();

  // Send message wrapped with Rate Limiter
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text && attachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      text: text || (attachments.length > 0 ? `Uploaded ${attachments.length} image(s) of study notes for simplification, flashcards, and quizzes.` : ''),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const currentAttachments = [...attachments];
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setAttachments([]);
    setFileLimitWarning(null);
    setIsSending(true);

    const friendlyLabel = currentAttachments.length > 0
      ? 'AI Tutor is analyzing your notebook... please hold on'
      : 'AI Tutor is analyzing your equation... please hold on';

    try {
      await executeWithRateLimiter(async () => {
        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            attachments: currentAttachments.map((a) => ({
              mimeType: a.mimeType,
              base64Data: a.base64Data,
              fileName: a.fileName,
            })),
            grade: profile.grade,
            studentName: profile.name,
            stream: profile.stream,
          }),
        });

        if (response.status === 429) {
          throw new Error('429 Too Many Requests: Quota exceeded');
        }

        const data = await response.json();

        if (data.status === 429 || (data.message && data.message.includes('429'))) {
          throw new Error('429 Too Many Requests: Quota exceeded');
        }

        if (data.success) {
          let finalReply = data.reply || 'Here is the detailed breakdown and solution for your request.';
          let finalStudyKit = data.studyKit;

          if (!finalStudyKit && finalReply.includes('```study-kit')) {
            const match = finalReply.match(/```study-kit\s*([\s\S]*?)\s*```/);
            if (match) {
              try {
                finalStudyKit = JSON.parse(match[1]);
                finalReply = finalReply.replace(match[0], '').trim();
              } catch {
                // ignore
              }
            }
          }

          const assistantMessage: ChatMessage = {
            id: 'msg_asst_' + Date.now(),
            sender: 'assistant',
            text: finalReply,
            studyKit: finalStudyKit || undefined,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setMessages((prev) => [...prev, assistantMessage]);

          // If notes were analyzed and generated study kit, celebrate and award XP
          if (finalStudyKit) {
            confetti({
              particleCount: 50,
              spread: 50,
              origin: { y: 0.7 },
            });

            // Award 30 XP for active study synthesis
            const updatedXP = await dbService.updateXP(profile.id, 30);
            onProfileUpdated?.({ ...profile, current_xp: updatedXP });
          }
        } else {
          throw new Error(data.message || 'Failed to get response');
        }
      }, friendlyLabel);
    } catch (err: any) {
      // If error is 429, executeWithRateLimiter triggers the modal automatically
      if (!err?.message?.includes('429')) {
        const errorMessage: ChatMessage = {
          id: 'msg_err_' + Date.now(),
          sender: 'assistant',
          text: `### 🌟 Study Assistance & Concept Breakdown
I'm here to ensure you never get stuck. While connecting to the high-speed engine, here is immediate guidance:
- When reviewing your ${profile.grade} curriculum, break every complex topic into fundamental definitions and 3 key formulas.
- Re-check your question or re-upload your notes images and I will regenerate your simplified notes, flashcards, and quizzes right away!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsSending(false);
    }
  };

  // 1-Click Save Study Kit from Chat into Supabase Study Materials
  const handleSaveToMaterials = async (messageId: string, kit: NonNullable<ChatMessage['studyKit']>) => {
    try {
      await dbService.saveStudyMaterial({
        user_id: profile.id,
        title: kit.title || `${profile.grade} Notes from AI Chat`,
        raw_content: kit.summary.join('\n'),
        summary: kit.summary,
        flashcards: kit.flashcards,
        quiz: kit.quiz,
      });

      setSavedKitIds((prev) => ({ ...prev, [messageId]: true }));
      onMaterialsUpdated?.();

      confetti({
        particleCount: 40,
        spread: 40,
        origin: { y: 0.6 },
      });
    } catch {
      // Handled silently
    }
  };

  // Copy text to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reset chat
  const handleClearChat = () => {
    if (confirm('Clear chat history?')) {
      const initialMsg: ChatMessage = {
        id: 'msg_welcome_' + Date.now(),
        sender: 'assistant',
        text: `Chat cleared! How can I help you today with your ${profile.grade} studies? Remember you can upload up to 3 images of notes anytime for instant simplification, flashcards, and quizzes!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([initialMsg]);
      localStorage.removeItem(`apex_chat_${profile.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in flex flex-col h-[calc(100vh-140px)] min-h-[580px]">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>ApexMentor AI Tutor</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {profile.grade} {profile.stream ? `• ${profile.stream}` : ''}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multimodal Notes Simplifier (Up to 3 images) • 24/7 Universal Academic Helper
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerRateLimit(30)}
            className="px-2.5 py-1.5 rounded-xl text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition text-xs flex items-center gap-1.5 cursor-pointer font-medium"
            title="Simulate Google AI Studio 429 Rate Limit Cooldown Modal"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Test 429 Modal</span>
          </button>

          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-xs flex items-center gap-1"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 sm:p-6 space-y-6 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const activeTab = activeTabPerMessage[msg.id] || 'summary';
          const currentCardIdx = cardIndexPerMessage[msg.id] || 0;
          const isCardFlipped = cardFlippedPerMessage[msg.id] || false;
          const quizAnswers = quizAnswersPerMessage[msg.id] || {};
          const isSaved = savedKitIds[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-[88%] sm:max-w-[82%] space-y-3 ${
                  isUser ? 'items-end' : 'items-start'
                }`}
              >
                {/* Uploaded Image Attachments Preview in User Message */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {msg.attachments.map((att, idx) => (
                      <div
                        key={att.id}
                        className="relative group rounded-xl overflow-hidden border border-indigo-500/30 bg-slate-950 max-w-[140px] shadow-md"
                      >
                        <img
                          src={att.previewUrl}
                          alt={`Notes Attachment ${idx + 1}`}
                          className="w-full h-24 object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-1.5">
                          <span className="text-[10px] text-indigo-300 font-mono truncate">
                            Note {idx + 1}/3
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-line break-words space-y-2">
                    {msg.text}
                  </div>

                  <div
                    className={`flex items-center justify-between gap-4 mt-2 pt-2 border-t text-[10px] ${
                      isUser
                        ? 'border-indigo-500/50 text-indigo-200'
                        : 'border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-slate-300 transition flex items-center gap-1"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* INTERACTIVE STUDY KIT ARTIFACT (Simplified Version + Flashcards + Quiz) */}
                {msg.studyKit && (
                  <div className="w-full bg-slate-950 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 animate-fade-in">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                            Notes AI Transformation
                          </span>
                          <span className="text-xs font-bold text-white">
                            {msg.studyKit.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Simplified notes, active-recall flashcards, and self-testing quiz.
                        </p>
                      </div>

                      <button
                        onClick={() => handleSaveToMaterials(msg.id, msg.studyKit!)}
                        disabled={isSaved}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                          isSaved
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                        }`}
                        title="Save to your permanent Study Materials"
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Saved to Materials</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Save to Study Materials</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Sub-Tabs: Simplified Version, Flashcards, Quiz */}
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                      <button
                        onClick={() =>
                          setActiveTabPerMessage((prev) => ({ ...prev, [msg.id]: 'summary' }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          activeTab === 'summary'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Simplified Notes ({msg.studyKit.summary?.length || 0})</span>
                      </button>

                      <button
                        onClick={() =>
                          setActiveTabPerMessage((prev) => ({ ...prev, [msg.id]: 'flashcards' }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          activeTab === 'flashcards'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Flashcards ({msg.studyKit.flashcards?.length || 0})</span>
                      </button>

                      <button
                        onClick={() =>
                          setActiveTabPerMessage((prev) => ({ ...prev, [msg.id]: 'quiz' }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          activeTab === 'quiz'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Practice Quiz ({msg.studyKit.quiz?.length || 0})</span>
                      </button>
                    </div>

                    {/* TAB 1: SIMPLIFIED VERSION */}
                    {activeTab === 'summary' && (
                      <div className="space-y-2.5 pt-1">
                        {msg.studyKit.summary && msg.studyKit.summary.length > 0 ? (
                          msg.studyKit.summary.map((point, pIdx) => (
                            <div
                              key={pIdx}
                              className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed"
                            >
                              <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                                {pIdx + 1}
                              </span>
                              <span>{point}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400">No simplified points available.</p>
                        )}
                      </div>
                    )}

                    {/* TAB 2: FLASHCARDS */}
                    {activeTab === 'flashcards' && msg.studyKit.flashcards && msg.studyKit.flashcards.length > 0 && (
                      <div className="space-y-3 pt-1">
                        {(() => {
                          const card = msg.studyKit.flashcards[currentCardIdx];
                          const totalCards = msg.studyKit.flashcards.length;

                          return (
                            <div className="space-y-3">
                              <div
                                onClick={() =>
                                  setCardFlippedPerMessage((prev) => ({
                                    ...prev,
                                    [msg.id]: !isCardFlipped,
                                  }))
                                }
                                className={`min-h-[140px] p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none shadow-md ${
                                  isCardFlipped
                                    ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500/40 text-indigo-100'
                                    : 'bg-slate-900 border-slate-800 text-slate-100 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[11px] text-slate-400">
                                  <span className="font-bold text-indigo-400">
                                    {isCardFlipped ? '💡 ANSWER' : '❓ QUESTION'}
                                  </span>
                                  <span className="text-[10px]">Click to flip</span>
                                </div>

                                <div className="my-3 text-center text-sm font-semibold leading-relaxed">
                                  {isCardFlipped ? card.answer : card.question}
                                </div>

                                <div className="text-center text-[10px] text-slate-500">
                                  Card {currentCardIdx + 1} of {totalCards}
                                </div>
                              </div>

                              {/* Flashcard Navigation */}
                              <div className="flex items-center justify-between gap-2">
                                <button
                                  disabled={currentCardIdx === 0}
                                  onClick={() => {
                                    setCardIndexPerMessage((prev) => ({
                                      ...prev,
                                      [msg.id]: Math.max(0, currentCardIdx - 1),
                                    }));
                                    setCardFlippedPerMessage((prev) => ({ ...prev, [msg.id]: false }));
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-xs font-semibold text-slate-300 border border-slate-800 flex items-center gap-1"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                  <span>Prev</span>
                                </button>

                                <span className="text-xs text-slate-400 font-mono">
                                  {currentCardIdx + 1} / {totalCards}
                                </span>

                                <button
                                  disabled={currentCardIdx === totalCards - 1}
                                  onClick={() => {
                                    setCardIndexPerMessage((prev) => ({
                                      ...prev,
                                      [msg.id]: Math.min(totalCards - 1, currentCardIdx + 1),
                                    }));
                                    setCardFlippedPerMessage((prev) => ({ ...prev, [msg.id]: false }));
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-xs font-semibold text-slate-300 border border-slate-800 flex items-center gap-1"
                                >
                                  <span>Next</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* TAB 3: PRACTICE QUIZ */}
                    {activeTab === 'quiz' && msg.studyKit.quiz && msg.studyKit.quiz.length > 0 && (
                      <div className="space-y-4 pt-1">
                        {msg.studyKit.quiz.map((q, qIdx) => {
                          const chosen = quizAnswers[qIdx];
                          const isAnswered = chosen !== undefined;
                          const isCorrect = chosen === q.correctAnswer;

                          return (
                            <div
                              key={qIdx}
                              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs"
                            >
                              <div className="font-semibold text-slate-100 flex items-start gap-2">
                                <span className="font-mono text-indigo-400">Q{qIdx + 1}.</span>
                                <span>{q.question}</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {q.options.map((opt, oIdx) => {
                                  const isSelected = chosen === opt;
                                  const isOptionCorrect = opt === q.correctAnswer;

                                  let btnClass = 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300';
                                  if (isAnswered) {
                                    if (isOptionCorrect) {
                                      btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                                    } else if (isSelected) {
                                      btnClass = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold';
                                    } else {
                                      btnClass = 'bg-slate-950/40 border-slate-800/40 opacity-50 text-slate-500';
                                    }
                                  }

                                  return (
                                    <button
                                      key={oIdx}
                                      disabled={isAnswered}
                                      onClick={() => {
                                        setQuizAnswersPerMessage((prev) => ({
                                          ...prev,
                                          [msg.id]: {
                                            ...(prev[msg.id] || {}),
                                            [qIdx]: opt,
                                          },
                                        }));
                                      }}
                                      className={`text-left p-2.5 rounded-xl border text-xs transition flex items-center justify-between ${btnClass}`}
                                    >
                                      <span>{opt}</span>
                                      {isAnswered && isOptionCorrect && (
                                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1.5" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {isAnswered && (
                                <div
                                  className={`text-[11px] font-semibold pt-1 ${
                                    isCorrect ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                >
                                  {isCorrect
                                    ? '✅ Correct answer!'
                                    : `❌ Incorrect. Correct answer: ${q.correctAnswer}`}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shrink-0 flex items-center justify-center text-xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-300 text-xs flex items-center gap-2 shadow-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Deciphering notes & synthesizing step-by-step master solution...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      {messages.length <= 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs shrink-0 whitespace-nowrap transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Attachment Previews in Input Area */}
      {attachments.length > 0 && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-3 shrink-0 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Study Documents Attached ({attachments.length}/3)</span>
            </span>
            <span className="text-[10px] text-slate-400">High-Resolution Processing Active</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {attachments.map((att, idx) => (
              <div
                key={att.id}
                className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 w-20 h-20 shrink-0 group"
              >
                <img src={att.previewUrl} alt={att.fileName} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-rose-600/90 text-white hover:bg-rose-500 shadow-md transition"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 px-1 py-0.5 text-[9px] text-slate-300 truncate">
                  Page #{idx + 1}
                </div>
              </div>
            ))}

            {attachments.length < 3 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-400 text-slate-400 hover:text-indigo-300 flex flex-col items-center justify-center text-[10px] gap-1 transition shrink-0"
              >
                <UploadCloud className="w-4 h-4" />
                <span>+ Add Page</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* File limit alert */}
      {fileLimitWarning && (
        <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{fileLimitWarning}</span>
        </div>
      )}

      {/* Input Bar with AILoadingSpinnerLock to freeze inputs and show friendly spinner during AI processing */}
      <AILoadingSpinnerLock
        isActive={isSending || isAIActive}
        message={activeActionLabel || 'AI Tutor is analyzing your notebook... please hold on'}
      >
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-xl flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleImageFiles(e.target.files)}
            accept="image/*"
            multiple
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || isAIActive || attachments.length >= 3}
            className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
              attachments.length >= 3 || isSending || isAIActive
                ? 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
                : 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
            }`}
            title="Attach study notes or textbook pages"
          >
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline font-mono">
              {attachments.length > 0 ? `${attachments.length}/3` : 'Attach Notes'}
            </span>
          </button>

          <input
            type="text"
            disabled={isSending || isAIActive}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              isSending || isAIActive
                ? 'AI Tutor is analyzing your notebook... please hold on'
                : attachments.length > 0
                ? 'Add any specific instructions for these notes (or press Enter)...'
                : `Ask anything about ${profile.grade} or attach study material...`
            }
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none disabled:cursor-not-allowed"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={isSending || isAIActive || (!inputText.trim() && attachments.length === 0)}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white shadow-md shadow-indigo-600/30 transition shrink-0 cursor-pointer disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </AILoadingSpinnerLock>
    </div>
  );
};
