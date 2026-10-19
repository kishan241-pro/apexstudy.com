import React, { useState } from 'react';
import {
  Lock,
  Sparkles,
  Zap,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Calculator,
  Atom,
  Clock,
  Star,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useSubscription } from './SubscriptionContext';

// Payhip checkout URL configured for student lifetime access
export const PAYHIP_CHECKOUT_URL =
  (import.meta.env && import.meta.env.VITE_PAYHIP_CHECKOUT_URL) ||
  'https://payhip.com/b/zZVWn';

/**
 * PaywallOverlay
 * Blocks the dashboard layout when a user's 7-day free trial has expired and is_premium is false.
 * Displays "Your 7-Day Free Trial Has Expired!", high-converting SaaS pricing and proof,
 * and a prominent CTA linking directly to Payhip checkout.
 */
export function PaywallOverlay({
  checkoutUrl = PAYHIP_CHECKOUT_URL,
  userEmail,
  onSimulateSuccess,
}) {
  const { setTrialSimulation, upgradeToPremium } = useSubscription();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSimulatingUpgrade, setIsSimulatingUpgrade] = useState(false);

  // Append user email to Payhip checkout URL if available for frictionless checkout
  const effectiveCheckoutUrl = userEmail
    ? `${checkoutUrl}${checkoutUrl.includes('?') ? '&' : '?'}email=${encodeURIComponent(userEmail)}`
    : checkoutUrl;

  const handlePayhipRedirect = () => {
    setIsRedirecting(true);
    // Link out to Payhip checkout URL
    window.location.href = effectiveCheckoutUrl;
  };

  const handleDirectSimulation = async () => {
    setIsSimulatingUpgrade(true);
    try {
      // Simulate direct Payhip success redirect or mutation
      if (onSimulateSuccess) {
        onSimulateSuccess();
      } else {
        await upgradeToPremium(userEmail);
        setTrialSimulation('premium');
      }
    } finally {
      setIsSimulatingUpgrade(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300"
    >
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950/80 to-slate-950 pointer-events-none" />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl shadow-indigo-950/80 p-6 sm:p-8 md:p-10 text-slate-100 overflow-hidden my-auto">
        {/* Decorative corner accent badge */}
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-36 h-36 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Lock Icon and Header Tag */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/25 ring-4 ring-rose-500/20 animate-pulse">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-indigo-600 border-2 border-slate-900 rounded-full p-1.5 shadow">
              <Clock className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold tracking-wide uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            Trial Status: Expired
          </div>

          <h2
            id="paywall-title"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight"
          >
            Your 7-Day Free Trial Has Expired!
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed">
            You've unlocked great progress in your Class 8-12 Math & Science journey.
            Upgrade now to secure lifetime uninterrupted access to our AI tutor, NCERT chapter kits, and daily study quests.
          </p>
        </div>

        {/* Pricing Card Section */}
        <div className="mt-6 sm:mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-800/40 border border-indigo-500/20 relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Lifetime Pass
                </span>
                <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> Best Value for 2026-27 Exams
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Class 8-12 Math & Science Mastery
              </h3>
              <p className="text-xs text-slate-400">One-time payment • Never pay monthly • Lifetime updates</p>
            </div>

            <div className="text-right flex flex-col items-center sm:items-end">
              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 line-through text-sm sm:text-base">$29.99</span>
                <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  $9.99
                </span>
              </div>
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full mt-0.5">
                Save 67% Today
              </span>
            </div>
          </div>

          {/* High-Converting Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Unlimited Handwritten Note & Equation Solvers</strong> with high-resolution visual processing</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Instant NCERT Chapter Study Kits</strong> (Summary, 10-Q Quizzes, Flashcards)</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>24/7 AI Personal Tutor</strong> with step-by-step math derivations</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Daily 5 Adaptive Study Quests</strong> tailored for 95%+ Board & School marks</span>
            </div>
          </div>
        </div>

        {/* Primary CTA Button to Payhip */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handlePayhipRedirect}
            disabled={isRedirecting}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-base sm:text-lg shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            {isRedirecting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Redirecting to Payhip Secure Checkout...</span>
              </>
            ) : (
              <>
                <span>Upgrade Now on Payhip — Just $9.99</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 256-Bit SSL Encrypted
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Instant Activation via Webhook-Less Redirect
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" /> 30-Day Money-Back Guarantee
            </span>
          </div>
        </div>

        {/* Enterprise Support Footer */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
          Need school group access or have questions? Contact our student concierge at <span className="text-indigo-400 font-semibold">support@apexstudy.io</span>
        </div>
      </div>
    </div>
  );
}

export default PaywallOverlay;
