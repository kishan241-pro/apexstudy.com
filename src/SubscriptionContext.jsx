import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured, dbService } from './lib/supabase';

// Create the global Subscription Context
export const SubscriptionContext = createContext(null);

const TRIAL_DURATION_DAYS = 7;
const SIMULATION_KEY = 'apex_trial_simulation_mode';

/**
 * SubscriptionProvider
 * Fetches 'created_at' and 'is_premium' from Supabase 'profiles' table,
 * calculates 7-day trial expiration, and provides global subscription states.
 */
export function SubscriptionProvider({ children, currentUser, onProfileUpdated }) {
  const [profile, setProfile] = useState(currentUser || null);
  const [loading, setLoading] = useState(!currentUser);
  const [error, setError] = useState(null);
  const [simulatedMode, setSimulatedMode] = useState(() => {
    return localStorage.getItem(SIMULATION_KEY) || 'real'; // 'real' | 'active_trial' | 'expired_trial' | 'premium'
  });

  // Sync profile when currentUser prop changes
  useEffect(() => {
    if (currentUser) {
      setProfile((prev) => ({
        ...prev,
        ...currentUser,
      }));
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Fetch 'created_at' and 'is_premium' from Supabase profiles table
   */
  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check current active user ID
      const activeId = profile?.id || localStorage.getItem('apex_active_user_id');

      if (!activeId) {
        setLoading(false);
        return;
      }

      let profileData = null;

      // 1. Primary Query: Direct Supabase profiles table
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error: supaError } = await supabase
            .from('profiles')
            .select('id, email, name, created_at, is_premium')
            .eq('id', activeId)
            .single();

          if (!supaError && data) {
            profileData = data;
          }
        } catch {
          // Handled by fallback
        }
      }

      // 2. Secondary Fallback: dbService local multi-user engine
      if (!profileData) {
        const fallbackProfile = await dbService.getCurrentProfile();
        if (fallbackProfile) {
          profileData = {
            id: fallbackProfile.id,
            email: fallbackProfile.email,
            name: fallbackProfile.name,
            created_at: fallbackProfile.created_at,
            is_premium: fallbackProfile.is_premium ?? false,
          };
        }
      }

      if (profileData) {
        setProfile((prev) => ({
          ...prev,
          ...profileData,
          is_premium: Boolean(profileData.is_premium),
        }));

        if (onProfileUpdated && typeof onProfileUpdated === 'function') {
          onProfileUpdated(profileData);
        }
      }
    } catch (err) {
      setError(err?.message || 'Failed to check subscription status');
    } finally {
      setLoading(false);
    }
  }, [profile?.id, onProfileUpdated]);

  // Initial load
  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  /**
   * Calculate Trial Metrics
   * 1. created_at and is_premium
   * 2. difference between current date and created_at in days
   * 3. difference > 7 && !is_premium => isTrialExpired = true
   */
  const subscriptionState = useMemo(() => {
    // Check for developer simulation override
    if (simulatedMode === 'expired_trial') {
      return {
        isPremium: false,
        isTrialExpired: true,
        isTrialActive: false,
        daysRemaining: 0,
        hoursRemaining: 0,
        daysUsed: 8,
        trialDurationDays: TRIAL_DURATION_DAYS,
        hasAccess: false,
        trialEndDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    if (simulatedMode === 'active_trial') {
      return {
        isPremium: false,
        isTrialExpired: false,
        isTrialActive: true,
        daysRemaining: 4,
        hoursRemaining: 96,
        daysUsed: 3,
        trialDurationDays: TRIAL_DURATION_DAYS,
        hasAccess: true,
        trialEndDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    if (simulatedMode === 'premium') {
      return {
        isPremium: true,
        isTrialExpired: false,
        isTrialActive: false,
        daysRemaining: 0,
        hoursRemaining: 0,
        daysUsed: 0,
        trialDurationDays: TRIAL_DURATION_DAYS,
        hasAccess: true,
        trialEndDate: null,
      };
    }

    // Real date calculation
    const isPremium = Boolean(profile?.is_premium);
    const createdAtRaw = profile?.created_at || new Date().toISOString();
    const createdDate = new Date(createdAtRaw);
    const currentDate = new Date();

    const diffInMilliseconds = currentDate.getTime() - createdDate.getTime();
    const diffInHours = Math.max(0, diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);

    const trialDurationHours = TRIAL_DURATION_DAYS * 24;
    const hoursRemaining = Math.max(0, Math.ceil(trialDurationHours - diffInHours));
    const daysRemaining = Math.max(0, Math.ceil(TRIAL_DURATION_DAYS - diffInDays));
    const daysUsed = Math.min(TRIAL_DURATION_DAYS, Math.max(0, Math.floor(diffInDays)));

    // Expiration Condition: Difference > 7 days AND is_premium is false
    const isTrialExpired = diffInDays > TRIAL_DURATION_DAYS && !isPremium;
    const isTrialActive = !isPremium && !isTrialExpired;
    const hasAccess = isPremium || !isTrialExpired;

    const trialEndDate = new Date(createdDate.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    return {
      isPremium,
      isTrialExpired,
      isTrialActive,
      daysRemaining,
      hoursRemaining,
      daysUsed,
      trialDurationDays: TRIAL_DURATION_DAYS,
      hasAccess,
      trialEndDate,
    };
  }, [profile?.is_premium, profile?.created_at, simulatedMode]);

  /**
   * Set simulation mode for testing
   */
  const setTrialSimulation = useCallback((mode) => {
    localStorage.setItem(SIMULATION_KEY, mode);
    setSimulatedMode(mode);
  }, []);

  /**
   * Direct Upgrade to Premium (triggers Supabase update)
   */
  const upgradeToPremium = useCallback(async (targetEmail) => {
    const emailToUse = targetEmail || profile?.email;
    if (!emailToUse) return false;

    try {
      setLoading(true);
      const success = await dbService.updatePremiumStatus(emailToUse, true);

      // Re-fetch current profile
      const updated = await dbService.getCurrentProfile();
      if (updated) {
        setProfile(updated);
        if (onProfileUpdated) onProfileUpdated(updated);
      }
      return success;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, [profile?.email, onProfileUpdated]);

  const value = useMemo(() => ({
    // States
    profile,
    loading,
    error,
    isPremium: subscriptionState.isPremium,
    isTrialExpired: subscriptionState.isTrialExpired,
    isTrialActive: subscriptionState.isTrialActive,
    daysRemaining: subscriptionState.daysRemaining,
    hoursRemaining: subscriptionState.hoursRemaining,
    daysUsed: subscriptionState.daysUsed,
    trialDurationDays: subscriptionState.trialDurationDays,
    hasAccess: subscriptionState.hasAccess,
    trialEndDate: subscriptionState.trialEndDate,
    simulatedMode,

    // Actions
    refreshSubscription: fetchSubscriptionStatus,
    upgradeToPremium,
    setTrialSimulation,
  }), [
    profile,
    loading,
    error,
    subscriptionState,
    simulatedMode,
    fetchSubscriptionStatus,
    upgradeToPremium,
    setTrialSimulation,
  ]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/**
 * Custom Hook: useSubscription
 */
export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export default SubscriptionContext;
