import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  Sparkles,
  Flame,
  BrainCircuit,
  Lock,
  RefreshCw,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

// Context for global AI rate-limiting and loading states
export const AIRateLimiterContext = createContext(null);

const DEFAULT_COOLDOWN_SECONDS = 30;

/**
 * AIRateLimiterProvider
 * Manages active AI request states and 429 rate limit cooldowns globally.
 */
export function AIRateLimiterProvider({ children }) {
  const [isAIActive, setIsAIActive] = useState(false);
  const [activeActionLabel, setActiveActionLabel] = useState(
    'AI Tutor is analyzing your notebook... please hold on'
  );
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [totalCooldownSeconds, setTotalCooldownSeconds] = useState(DEFAULT_COOLDOWN_SECONDS);
  const [rateLimitMessage, setRateLimitMessage] = useState(
    'Our AI systems are running hot! Please wait 30 seconds before submitting your next equation.'
  );

  // Active request counter to handle overlapping async calls gracefully
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Synchronize isAIActive with pending count
  useEffect(() => {
    setIsAIActive(pendingRequestsCount > 0);
  }, [pendingRequestsCount]);

  // Countdown timer for 429 cooldown
  useEffect(() => {
    if (!isRateLimited || cooldownRemaining <= 0) {
      if (isRateLimited && cooldownRemaining <= 0) {
        setIsRateLimited(false);
      }
      return;
    }

    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRateLimited(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRateLimited, cooldownRemaining]);

  /**
   * Trigger Rate Limit (Specification 3.3)
   * Opens the 429 rate limit modal and sets 30-second timer
   */
  const triggerRateLimit = useCallback((seconds = DEFAULT_COOLDOWN_SECONDS, customMessage) => {
    const duration = Math.max(5, seconds);
    setTotalCooldownSeconds(duration);
    setCooldownRemaining(duration);
    setIsRateLimited(true);
    if (customMessage) {
      setRateLimitMessage(customMessage);
    } else {
      setRateLimitMessage(
        `Our AI systems are running hot! Please wait ${duration} seconds before submitting your next equation.`
      );
    }
  }, []);

  /**
   * Helper to inspect if an error or response represents a 429 Rate Limit
   */
  const is429Error = useCallback((errorOrResponse) => {
    if (!errorOrResponse) return false;

    // Check HTTP status code
    if (errorOrResponse.status === 429) return true;

    // Check message string
    const str = (
      (errorOrResponse.message || '') +
      ' ' +
      (errorOrResponse.error || '') +
      ' ' +
      (typeof errorOrResponse === 'string' ? errorOrResponse : '')
    ).toLowerCase();

    return (
      str.includes('429') ||
      str.includes('too many requests') ||
      str.includes('resource_exhausted') ||
      str.includes('quota exceeded') ||
      str.includes('rate limit')
    );
  }, []);

  /**
   * Wrapper: executeWithRateLimiter
   * Wraps an async API call, locks inputs, catches 429, and triggers modal
   */
  const executeWithRateLimiter = useCallback(
    async (
      asyncFn,
      label = 'AI Tutor is analyzing your notebook... please hold on'
    ) => {
      if (isRateLimited) {
        throw new Error(
          `AI rate limit in progress. Please wait ${cooldownRemaining}s before trying again.`
        );
      }

      setActiveActionLabel(label);
      setPendingRequestsCount((prev) => prev + 1);

      try {
        const result = await asyncFn();

        // Inspect response if it was a fetch Response object
        if (result && typeof result.status === 'number' && result.status === 429) {
          triggerRateLimit(DEFAULT_COOLDOWN_SECONDS);
          throw new Error('429 Too Many Requests');
        }

        return result;
      } catch (err) {
        if (is429Error(err)) {
          triggerRateLimit(DEFAULT_COOLDOWN_SECONDS);
        }
        throw err;
      } finally {
        setPendingRequestsCount((prev) => Math.max(0, prev - 1));
      }
    },
    [isRateLimited, cooldownRemaining, is429Error, triggerRateLimit]
  );

  const contextValue = useMemo(
    () => ({
      isAIActive,
      activeActionLabel,
      isRateLimited,
      cooldownRemaining,
      totalCooldownSeconds,
      rateLimitMessage,
      pendingRequestsCount,
      triggerRateLimit,
      executeWithRateLimiter,
      setIsAIActive: (active, label) => {
        setIsAIActive(active);
        if (label) setActiveActionLabel(label);
      },
      dismissRateLimitModal: () => setIsRateLimited(false),
    }),
    [
      isAIActive,
      activeActionLabel,
      isRateLimited,
      cooldownRemaining,
      totalCooldownSeconds,
      rateLimitMessage,
      pendingRequestsCount,
      triggerRateLimit,
      executeWithRateLimiter,
    ]
  );

  return (
    <AIRateLimiterContext.Provider value={contextValue}>
      {children}

      {/* Global 429 Error Boundary Modal (Specification 3.3) */}
      {isRateLimited && (
        <AIRateLimitModal
          message={rateLimitMessage}
          remainingSeconds={cooldownRemaining}
          totalSeconds={totalCooldownSeconds}
          onDismiss={() => setIsRateLimited(false)}
        />
      )}
    </AIRateLimiterContext.Provider>
  );
}

/**
 * Custom Hook: useAIRateLimiter
 */
export function useAIRateLimiter() {
  const context = useContext(AIRateLimiterContext);
  if (!context) {
    throw new Error('useAIRateLimiter must be used within an AIRateLimiterProvider');
  }
  return context;
}

/**
 * AILoadingSpinnerLock
 * Specification 3.2: Friendly message spinner that locks input elements during ongoing API calls
 */
export function AILoadingSpinnerLock({
  isActive,
  message = 'AI Tutor is analyzing your notebook... please hold on',
  children,
}) {
  const { isAIActive: globalActive, activeActionLabel } = useAIRateLimiter();
  const active = isActive !== undefined ? isActive : globalActive;
  const displayMessage = message || activeActionLabel;

  return (
    <div className="relative w-full">
      {/* Target input elements / child components */}
      <div
        className={`transition-all duration-300 ${
          active ? 'opacity-50 pointer-events-none select-none filter blur-[0.5px]' : ''
        }`}
        aria-busy={active}
      >
        {children}
      </div>

      {/* Beautiful UI Loading Skeleton / Friendly Message Spinner Overlay */}
      {active && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-sm rounded-2xl p-6 text-center animate-in fade-in duration-200">
          <div className="relative mb-4">
            {/* Pulsing ring */}
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BrainCircuit className="w-7 h-7 text-indigo-400 animate-pulse" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>AI Studio Engine Processing</span>
          </div>

          <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {displayMessage}
          </h4>

          <p className="mt-1 text-xs text-slate-400 max-w-xs">
            Inputs are locked while your request is processed safely to maintain rate-limit stability.
          </p>

          {/* Animated skeleton lines */}
          <div className="w-48 max-w-full space-y-1.5 mt-4">
            <div className="h-1.5 bg-indigo-500/30 rounded-full animate-pulse" />
            <div className="h-1.5 bg-indigo-500/20 rounded-full animate-pulse delay-150" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * AIRateLimitModal
 * Specification 3.3: Elegant error boundary modal that gracefully catches 429 rate limit exceptions
 */
export function AIRateLimitModal({
  message,
  remainingSeconds,
  totalSeconds = 30,
  onDismiss,
}) {
  const percentComplete = Math.max(
    0,
    Math.min(100, Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100))
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-100 text-center overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Warning Flame Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4 animate-bounce">
          <Flame className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <AlertTriangle className="w-3.5 h-3.5" /> 429 Rate Limit Cooldown
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          AI Systems Running Hot!
        </h3>

        {/* The required exact prompt message */}
        <p className="mt-3 text-sm text-slate-300 leading-relaxed font-medium">
          {message ||
            'Our AI systems are running hot! Please wait 30 seconds before submitting your next equation.'}
        </p>

        {/* Live Circular/Bar Countdown */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" /> Cooldown Timer
            </span>
            <span className="text-amber-400 font-bold text-sm">
              {remainingSeconds}s remaining
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-rose-500 h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          <p className="mt-2.5 text-[11px] text-slate-400">
            {remainingSeconds > 0
              ? 'Inputs will automatically re-enable when the timer reaches zero.'
              : 'Cooldown completed! You may now submit your equation.'}
          </p>
        </div>

        {/* Student Advice */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-left text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Pro-tip for Class 8-12 Students:
          </div>
          <p className="text-slate-400 text-[11px]">
            Make sure your notebook photos have good lighting and sharp handwriting to get instant solutions on your very first submission.
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-5">
          {remainingSeconds === 0 ? (
            <button
              onClick={onDismiss}
              className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Resume Studying Now</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3 px-5 rounded-xl bg-slate-800 text-slate-500 font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              <span>Unlocking in {remainingSeconds}s...</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIRateLimiterProvider;
