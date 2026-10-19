import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { dbService } from './lib/supabase';
import { LandingAuth } from './components/auth/LandingAuth';
import { OnboardingQuestions } from './components/auth/OnboardingQuestions';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { SubscriptionProvider } from './SubscriptionContext';
import { PaymentSuccess } from './PaymentSuccess';
import { AIRateLimiterProvider } from './AIRateLimiter';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/payment-success' || hash.startsWith('#/payment-success') || path.includes('payment-success')) {
        return 'payment-success';
      }
    }
    return 'dashboard';
  });

  // Track URL changes for /payment-success route
  useEffect(() => {
    const handleLocationCheck = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/payment-success' || hash.startsWith('#/payment-success') || hash.includes('payment-success')) {
        setCurrentRoute('payment-success');
      } else {
        setCurrentRoute('dashboard');
      }
    };

    window.addEventListener('popstate', handleLocationCheck);
    window.addEventListener('hashchange', handleLocationCheck);
    return () => {
      window.removeEventListener('popstate', handleLocationCheck);
      window.removeEventListener('hashchange', handleLocationCheck);
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const profile = await dbService.getCurrentProfile();
        if (profile) {
          setCurrentUser(profile);
        }
      } catch {
        // Fallback to unauthenticated landing
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleAuthenticated = (profile: UserProfile) => {
    setCurrentUser(profile);
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setCurrentUser(profile);
  };

  const handleLogout = async () => {
    await dbService.logout();
    setCurrentUser(null);
  };

  const handleRedirectFromPaymentSuccess = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
      window.location.hash = '';
    }
    setCurrentRoute('dashboard');
    // Refresh user profile after payment update
    dbService.getCurrentProfile().then((prof) => {
      if (prof) setCurrentUser(prof);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Launching ApexStudy...
        </p>
      </div>
    );
  }

  return (
    <SubscriptionProvider
      currentUser={currentUser}
      onProfileUpdated={(updatedProfile: any) =>
        setCurrentUser((prev) => (prev ? { ...prev, ...updatedProfile } : null))
      }
    >
      <AIRateLimiterProvider>
        {/* SPECIFICATION 2: PAYHIP SUCCESS WEBHOOK-LESS REDIRECT ROUTE (/payment-success) */}
        {currentRoute === 'payment-success' ? (
          <PaymentSuccess
            onRedirectToDashboard={handleRedirectFromPaymentSuccess}
            defaultEmail={currentUser?.email || ''}
          />
        ) : !currentUser ? (
          /* 1. If not authenticated: Show clean Landing Page with Sign In option */
          <LandingAuth onAuthenticated={handleAuthenticated} />
        ) : !currentUser.onboarding_completed ? (
          /* 2. If authenticated but has not configured profile/stream: Show Onboarding */
          <OnboardingQuestions
            userId={currentUser.id}
            userEmail={currentUser.email}
            onComplete={handleOnboardingComplete}
          />
        ) : (
          /* 3. Authenticated and configured: Show Student Dashboard */
          <StudentDashboard
            initialProfile={currentUser}
            onLogout={handleLogout}
          />
        )}
      </AIRateLimiterProvider>
    </SubscriptionProvider>
  );
}
