import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useSubscription } from './SubscriptionContext';
import { PAYHIP_CHECKOUT_URL } from './PaywallOverlay';

/**
 * TrialBanner
 * Displays trial countdown ("X days left in your free trial")
 * and instant upgrade link + developer simulation switcher.
 */
export function TrialBanner({ onOpenPaywall }) {
  const {
    isPremium,
    isTrialActive,
    isTrialExpired,
    daysRemaining,
    hoursRemaining,
    daysUsed,
    trialDurationDays,
    simulatedMode,
    setTrialSimulation,
    profile,
  } = useSubscription();

  const [showSimMenu, setShowSimMenu] = useState(false);

  // If already lifetime premium, render sleek VIP badge
  if (isPremium) {
    return (
      <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-4 h-4 fill-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Lifetime VIP Membership Active</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                Full Access Unlocked
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Unlimited handwritten equation solvers, NCERT study kits, and priority AI processing unlocked.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl">
            Verified Account
          </span>
        </div>
      </div>
    );
  }

  // Active trial banner
  return (
    <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-900 border border-indigo-500/40 shadow-lg shadow-indigo-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
          <Clock className="w-5 h-5" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white text-sm sm:text-base">
              7-Day Free Trial: {daysRemaining} Day{daysRemaining === 1 ? '' : 's'} Remaining
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Day {daysUsed + 1} of {trialDurationDays}
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-0.5">
            You have full access to AI equation solvers, NCERT quizzes, and daily tasks. Upgrade to lock in lifetime access for $9.99 before your trial ends!
          </p>

          {/* Mini progress tracker */}
          <div className="w-48 sm:w-64 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-gradient-to-r from-amber-400 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round(((daysUsed + 1) / trialDurationDays) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
        {/* Upgrade Button linking to Payhip / opening Paywall */}
        <button
          onClick={() => {
            if (onOpenPaywall) {
              onOpenPaywall();
            } else {
              window.open(PAYHIP_CHECKOUT_URL, '_blank');
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transition transform hover:scale-[1.02] cursor-pointer"
        >
          <span>Upgrade to Lifetime VIP</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default TrialBanner;
