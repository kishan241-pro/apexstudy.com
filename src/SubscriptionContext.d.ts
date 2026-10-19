import { ReactNode } from 'react';
import { UserProfile } from './types';

export interface SubscriptionContextValue {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isPremium: boolean;
  isTrialExpired: boolean;
  isTrialActive: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  daysUsed: number;
  trialDurationDays: number;
  hasAccess: boolean;
  trialEndDate: string | null;
  simulatedMode: string;
  refreshSubscription: () => Promise<void>;
  upgradeToPremium: (email?: string) => Promise<boolean>;
  setTrialSimulation: (mode: 'real' | 'active_trial' | 'expired_trial' | 'premium') => void;
}

export interface SubscriptionProviderProps {
  children: ReactNode;
  currentUser?: UserProfile | null;
  onProfileUpdated?: (profile: UserProfile | Partial<UserProfile>) => void;
}

export declare const SubscriptionContext: React.Context<SubscriptionContextValue | null>;

export declare function SubscriptionProvider(props: SubscriptionProviderProps): React.JSX.Element;

export declare function useSubscription(): SubscriptionContextValue;

export default SubscriptionContext;
