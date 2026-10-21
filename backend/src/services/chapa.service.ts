import crypto from 'crypto';
import { ENV } from '../config/env';

export interface ChapaInitializeData {
  amount: number;
  currency: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  txRef: string;
  callbackUrl?: string;
  returnUrl?: string;
  customization?: {
    title?: string;
    description?: string;
    logo?: string;
  };
}

export interface ChapaVerifyResult {
  success: boolean;
  status: 'PAID' | 'PENDING' | 'FAILED';
  providerReference?: string;
  raw?: any;
  message?: string;
}

export class ChapaService {
  /**
   * Check if live or test Chapa secret key is provided
   */
  static isConfigured(): boolean {
    const key = ENV.CHAPA_SECRET_KEY ? ENV.CHAPA_SECRET_KEY.trim() : '';
    return Boolean(key && !key.includes('your_chapa') && !key.includes('xxxxxxxx'));
  }

  static getPublicKey(): string {
    return ENV.CHAPA_PUBLIC_KEY ? ENV.CHAPA_PUBLIC_KEY.trim() : '';
  }

  static getApiUrl(): string {
    return (ENV.CHAPA_API_URL || 'https://api.chapa.co/v1').replace(/\/+$/, '');
  }

  /**
   * Initialize a payment session with Chapa.
   * If secret key is configured, calls Chapa API v1 and returns the official checkout_url.
   * Otherwise, generates a local interactive simulation link.
   */
  static async initializePayment(data: ChapaInitializeData): Promise<{
    checkoutUrl: string;
    txRef: string;
    isSimulated: boolean;
  }> {
    if (this.isConfigured()) {
      const secretKey = ENV.CHAPA_SECRET_KEY.trim();
      const endpoint = `${this.getApiUrl()}/transaction/initialize`;

      console.log(`[Chapa] Initializing payment session with official Chapa API for tx_ref: ${data.txRef}`);

      const payload = {
        amount: data.amount.toString(),
        currency: (data.currency || 'ETB').toUpperCase(),
        email: data.email || 'customer@ethiotransit.et',
        first_name: data.firstName || 'Passenger',
        last_name: data.lastName || 'Customer',
        phone_number: data.phone || '0911000000',
        tx_ref: data.txRef,
        callback_url: data.callbackUrl,
        return_url: data.returnUrl,
        customization: {
          title: data.customization?.title || 'EthioTransit Intercity Booking',
          description: data.customization?.description || 'Official Bus Travel Booking Ticket',
        },
      };

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const resData: any = await response.json().catch(() => ({}));

        if (response.ok && resData.status === 'success' && resData.data?.checkout_url) {
          console.log(`[Chapa] Payment session initialized successfully: ${resData.data.checkout_url}`);
          return {
            checkoutUrl: resData.data.checkout_url,
            txRef: data.txRef,
            isSimulated: false,
          };
        } else {
          console.error('[Chapa Error] Initialization failed:', resData);
          throw new Error(
            resData.message || 'Chapa initialization failed. Please verify your Chapa API credentials.'
          );
        }
      } catch (err: any) {
        console.error('[Chapa Connection Error]:', err.message);
        throw err;
      }
    }

    // Graceful fallback for local development / sandbox testing
    console.log(`[Chapa] No active CHAPA_SECRET_KEY in environment. Routing to interactive Chapa Sandbox.`);
    const sandboxParams = new URLSearchParams({
      ref: data.txRef,
      amount: data.amount.toString(),
      email: data.email,
      name: `${data.firstName} ${data.lastName}`.trim(),
      phone: data.phone,
    });

    return {
      checkoutUrl: `${ENV.CLIENT_URL}/checkout/chapa-sandbox?${sandboxParams.toString()}`,
      txRef: data.txRef,
      isSimulated: true,
    };
  }

  /**
   * Verify transaction with Chapa server
   */
  static async verifyPayment(txRef: string): Promise<ChapaVerifyResult> {
    if (this.isConfigured()) {
      const secretKey = ENV.CHAPA_SECRET_KEY.trim();
      const endpoint = `${this.getApiUrl()}/transaction/verify/${encodeURIComponent(txRef)}`;

      console.log(`[Chapa] Verifying transaction ${txRef} with official Chapa API...`);

      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${secretKey}`,
          },
        });

        const resData: any = await response.json().catch(() => ({}));

        if (response.ok && resData.status === 'success' && resData.data) {
          const chapaStatus = (resData.data.status || '').toLowerCase();

          if (chapaStatus === 'success') {
            console.log(`[Chapa] Transaction ${txRef} VERIFIED successfully. Reference: ${resData.data.reference}`);
            return {
              success: true,
              status: 'PAID',
              providerReference: resData.data.reference || resData.data.chapa_reference || txRef,
              raw: resData.data,
              message: 'Chapa payment verified successfully.',
            };
          } else if (chapaStatus === 'pending') {
            console.log(`[Chapa] Transaction ${txRef} is still PENDING.`);
            return {
              success: false,
              status: 'PENDING',
              raw: resData.data,
              message: 'Chapa payment is still pending confirmation.',
            };
          } else {
            console.warn(`[Chapa] Transaction ${txRef} failed with status: ${chapaStatus}`);
            return {
              success: false,
              status: 'FAILED',
              raw: resData.data,
              message: `Chapa payment status: ${chapaStatus}`,
            };
          }
        } else {
          console.error('[Chapa Error] Verification returned error:', resData);
          return {
            success: false,
            status: 'FAILED',
            raw: resData,
            message: resData.message || 'Chapa verification could not confirm payment.',
          };
        }
      } catch (err: any) {
        console.error('[Chapa Error] Network error during verification:', err.message);
        throw new Error(`Failed to verify payment with Chapa: ${err.message}`);
      }
    }

    // Local simulation verification
    console.log(`[Chapa Simulation] Approving transaction reference ${txRef}`);
    return {
      success: true,
      status: 'PAID',
      providerReference: `CHP-SIM-${Date.now()}`,
      message: 'Simulated Chapa transaction approved.',
    };
  }

  /**
   * Verify Chapa Webhook HMAC signature if webhook secret is configured
   */
  static verifyWebhookSignature(payload: any, signature?: string): boolean {
    const webhookSecret = ENV.CHAPA_WEBHOOK_SECRET ? ENV.CHAPA_WEBHOOK_SECRET.trim() : '';
    if (!webhookSecret) return true; // If no secret configured, accept webhook

    if (!signature) return false;

    try {
      const hash = crypto
        .createHmac('sha256', webhookSecret)
        .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
        .digest('hex');

      return hash === signature;
    } catch {
      return false;
    }
  }
}
