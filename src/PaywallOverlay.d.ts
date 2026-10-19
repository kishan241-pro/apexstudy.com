import { ReactNode } from 'react';

export declare const PAYHIP_CHECKOUT_URL: string;

export interface PaywallOverlayProps {
  checkoutUrl?: string;
  userEmail?: string;
  onSimulateSuccess?: () => void;
}

export declare function PaywallOverlay(props: PaywallOverlayProps): React.JSX.Element;

export default PaywallOverlay;
