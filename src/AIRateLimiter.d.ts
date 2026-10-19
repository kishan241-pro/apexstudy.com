import { ReactNode } from 'react';

export interface AIRateLimiterContextValue {
  isAIActive: boolean;
  activeActionLabel: string;
  isRateLimited: boolean;
  cooldownRemaining: number;
  totalCooldownSeconds: number;
  rateLimitMessage: string;
  pendingRequestsCount: number;
  triggerRateLimit: (seconds?: number, customMessage?: string) => void;
  executeWithRateLimiter: <T>(asyncFn: () => Promise<T>, label?: string) => Promise<T>;
  setIsAIActive: (active: boolean, label?: string) => void;
  dismissRateLimitModal: () => void;
}

export interface AIRateLimiterProviderProps {
  children: ReactNode;
}

export interface AILoadingSpinnerLockProps {
  isActive?: boolean;
  message?: string;
  children: ReactNode;
}

export interface AIRateLimitModalProps {
  message: string;
  remainingSeconds: number;
  totalSeconds?: number;
  onDismiss: () => void;
}

export declare const AIRateLimiterContext: React.Context<AIRateLimiterContextValue | null>;

export declare function AIRateLimiterProvider(props: AIRateLimiterProviderProps): React.JSX.Element;

export declare function useAIRateLimiter(): AIRateLimiterContextValue;

export declare function AILoadingSpinnerLock(props: AILoadingSpinnerLockProps): React.JSX.Element;

export declare function AIRateLimitModal(props: AIRateLimitModalProps): React.JSX.Element;

export default AIRateLimiterProvider;
