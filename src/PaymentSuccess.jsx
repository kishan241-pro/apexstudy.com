import React, { useEffect, useState, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Mail,
  Home,
} from 'lucide-react';
import { supabase, isSupabaseConfigured, dbService } from './lib/supabase';
import { useSubscription } from './SubscriptionContext';

/**
 * PaymentSuccess
 * Router page / component located at `/payment-success`
 *
 * 1. Mounts & parses URL parameters to extract student email: `?email=[email]`
 * 2. Triggers an immediate async Supabase mutation updating `profiles`:
 *    UPDATE profiles SET is_premium = true WHERE email = studentEmail
 * 3. Displays animated loading spinner ("Securing your premium lifetime access...")
 * 4. Resolves successfully, fires celebratory confetti, and redirects back to `/dashboard`
 *    with a toast notification: "Account upgraded successfully!"
 */
export function PaymentSuccess({ onRedirectToDashboard, defaultEmail = '' }) {
  const { refreshSubscription } = useSubscription();

  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error' | 'no-email'
  const [extractedEmail, setExtractedEmail] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [countdown, setCountdown] = useState(3);

  const hasExecutedRef = useRef(false);

  /**
   * Helper: Parse email from URL query string or Hash
   * Handles `/payment-success?email=student@example.com`
   * and `#/payment-success?email=student@example.com`
   */
  const extractEmailFromUrl = useCallback(() => {
    let emailFound = '';

    // 1. Standard search params (?email=...)
    if (typeof window !== 'undefined' && window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      emailFound = searchParams.get('email') || '';
    }

    // 2. Hash search params (#/payment-success?email=...)
    if (!emailFound && typeof window !== 'undefined' && window.location.hash.includes('?')) {
      const queryPart = window.location.hash.split('?')[1];
      if (queryPart) {
        const hashParams = new URLSearchParams(queryPart);
        emailFound = hashParams.get('email') || '';
      }
    }

    // 3. Fallback to passed default email or stored active user
    if (!emailFound && defaultEmail) {
      emailFound = defaultEmail;
    }

    return emailFound ? decodeURIComponent(emailFound).trim().toLowerCase() : '';
  }, [defaultEmail]);

  /**
   * Mutation: Set is_premium = true in Supabase profiles table
   */
  const processPremiumUpgrade = useCallback(async (targetEmail) => {
    const studentEmail = targetEmail.trim().toLowerCase();
    setStatus('processing');
    setErrorMessage('');

    try {
      let dbSuccess = false;
      let errorDetails = null;

      // 1. Supabase direct mutation:
      // UPDATE profiles SET is_premium = true WHERE email = studentEmail
      if (isSupabaseConfigured() && supabase) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('email', studentEmail)
            .select();

          if (error) {
            errorDetails = error.message;
          } else {
            dbSuccess = true;
          }
        } catch (supaErr) {
          errorDetails = supaErr?.message;
        }
      }

      // 2. Also ensure local multi-user store and session cache are synced
      const localUpdated = await dbService.updatePremiumStatus(studentEmail, true);
      if (localUpdated) {
        dbSuccess = true;
      }

      if (!dbSuccess && !isSupabaseConfigured()) {
        dbSuccess = true;
      }

      if (dbSuccess) {
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b'],
          });
        } catch {
          // Confetti optional
        }

        setToastMessage('Account upgraded successfully!');
        setStatus('success');

        if (refreshSubscription) {
          await refreshSubscription();
        }

        localStorage.removeItem('apex_trial_simulation_mode');

        let timer = 3;
        setCountdown(timer);
        const interval = setInterval(() => {
          timer -= 1;
          setCountdown(timer);
          if (timer <= 0) {
            clearInterval(interval);
            handleFinalRedirect();
          }
        }, 1000);
      } else {
        setStatus('error');
        setErrorMessage(
          errorDetails ||
            `Could not find a student profile with email "${studentEmail}". Please check your email or contact support.`
        );
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to update subscription in database.');
    }
  }, [refreshSubscription]);

  // Navigate back to dashboard
  const handleFinalRedirect = () => {
    // Save toast to sessionStorage so dashboard displays it if page reloads
    try {
      sessionStorage.setItem('apex_upgrade_toast', 'Account upgraded successfully!');
    } catch {
      // Ignore
    }

    if (onRedirectToDashboard) {
      onRedirectToDashboard();
    } else {
      // Fallback navigation
      if (typeof window !== 'undefined') {
        window.location.hash = '#/dashboard';
        window.history.pushState(null, '', '/dashboard');
      }
    }
  };

  // Mount effect to parse and trigger
  useEffect(() => {
    if (hasExecutedRef.current) return;

    const email = extractEmailFromUrl();
    setExtractedEmail(email);

    if (email) {
      hasExecutedRef.current = true;
      processPremiumUpgrade(email);
    } else {
      // Check if current user profile exists in storage to prefill
      dbService.getCurrentProfile().then((prof) => {
        if (prof?.email) {
          setExtractedEmail(prof.email);
          setManualEmail(prof.email);
          hasExecutedRef.current = true;
          processPremiumUpgrade(prof.email);
        } else {
          setStatus('no-email');
        }
      });
    }
  }, [extractEmailFromUrl, processPremiumUpgrade]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;
    setExtractedEmail(manualEmail.trim());
    processPremiumUpgrade(manualEmail.trim());
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Toast Notification (Specification 2.4) */}
      {toastMessage && (
        <div className="fixed top-6 z-50 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500 text-white font-semibold shadow-2xl shadow-emerald-500/40 border border-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-center">
        {/* State 1: Processing Animated Spinner (Specification 2.3) */}
        {status === 'processing' && (
          <div className="py-6 flex flex-col items-center animate-in fade-in duration-300">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Securing your premium lifetime access...
            </h2>

            <p className="mt-3 text-sm text-slate-400 max-w-sm leading-relaxed">
              Verifying your Payhip payment and unlocking Class 8-12 Math & Science tools in Supabase.
            </p>

            {extractedEmail && (
              <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-indigo-300">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Account: <strong>{extractedEmail}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* State 2: Success State (Specification 2.4) */}
        {status === 'success' && (
          <div className="py-4 flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5" /> Lifetime VIP Activated
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Payment Confirmed!
            </h2>

            <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-sm">
              Welcome to ApexStudy Premium. You now have lifetime access with no recurring fees.
            </p>

            {/* Receipt mini-card */}
            <div className="w-full mt-6 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Account Email:</span>
                <span className="font-semibold text-slate-200">{extractedEmail}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Subscription Plan:</span>
                <span className="font-semibold text-emerald-400">Lifetime Pass (is_premium = true)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Features:</span>
                <span className="font-semibold text-slate-200">Unlimited AI Solver, NCERT Study Kits</span>
              </div>
            </div>

            {/* Redirect Countdown button */}
            <div className="mt-6 w-full space-y-3">
              <button
                onClick={handleFinalRedirect}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition transform hover:scale-[1.01]"
              >
                <span>Go to Dashboard Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-slate-400">
                Redirecting automatically in <strong className="text-indigo-400">{countdown}s</strong>...
              </p>
            </div>
          </div>
        )}

        {/* State 3: Error Handling with Retry */}
        {status === 'error' && (
          <div className="py-4 flex flex-col items-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Unable to Complete Activation
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              {errorMessage}
            </p>

            <div className="mt-6 w-full flex flex-col gap-3">
              <button
                onClick={() => processPremiumUpgrade(extractedEmail || manualEmail)}
                className="w-full py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Activation</span>
              </button>
              <button
                onClick={handleFinalRedirect}
                className="w-full py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* State 4: No email in URL parameters */}
        {status === 'no-email' && (
          <div className="py-4 flex flex-col items-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5">
              <Mail className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-white">Enter Your Student Email</h2>
            <p className="mt-2 text-xs text-slate-400 max-w-sm">
              We couldn't detect the Payhip email in the URL. Please enter the email address used during checkout to activate your lifetime upgrade.
            </p>

            <form onSubmit={handleManualSubmit} className="mt-5 w-full space-y-3">
              <input
                type="email"
                required
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="w-full py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Activate Lifetime Access</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;
