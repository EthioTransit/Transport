import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { ChapaService } from '../services/chapa.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import { Booking } from '../models/Booking';

export class PaymentController {
  static async createPayment(req: Request, res: Response) {
    try {
      const { bookingId, provider, paymentMethod } = req.body;

      let userId = req.user?.userId;
      if (!userId && bookingId) {
        const booking = await Booking.findById(bookingId);
        if (booking && booking.user) {
          userId = booking.user.toString();
        }
      }

      if (!userId) return sendError(res, 'Authentication required to initiate payment', 401);

      const paymentIntent = await PaymentService.initiatePayment({
        bookingId,
        userId,
        providerName: provider,
        paymentMethod,
      });

      return sendSuccess(res, paymentIntent, 'Payment session initiated', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async verifyPayment(req: Request, res: Response) {
    try {
      const { transactionReference, simulateResult } = req.body;
      const result = await PaymentService.verifyPayment({
        transactionReference,
        simulateResult,
      });

      if (result.status === 'PAID') {
        return sendSuccess(res, result, result.message);
      } else if (result.status === 'PENDING') {
        return sendSuccess(res, result, result.message);
      } else {
        return sendError(res, result.message, 400, 'PAYMENT_FAILED');
      }
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async chapaWebhook(req: Request, res: Response) {
    try {
      const payload = req.body;
      const signature = req.headers['x-chapa-signature'] as string | undefined;

      const isValid = ChapaService.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        console.warn('[Chapa Webhook] Invalid webhook signature detected.');
        return res.status(401).json({ status: 'unauthorized', message: 'Invalid webhook signature' });
      }

      console.log('[Chapa Webhook] Received webhook payload:', payload);

      const txRef = payload.tx_ref || payload.trx_ref;
      if (!txRef) {
        return res.status(400).json({ status: 'failed', message: 'Missing tx_ref in webhook event' });
      }

      const result = await PaymentService.verifyPayment({
        transactionReference: txRef,
      });

      return res.status(200).json({
        status: 'success',
        message: 'Chapa webhook event successfully processed',
        data: result,
      });
    } catch (err: any) {
      console.error('[Chapa Webhook Error]:', err.message);
      return res.status(500).json({ status: 'error', message: err.message });
    }
  }

  static async getChapaStatus(req: Request, res: Response) {
    try {
      const isConfigured = ChapaService.isConfigured();
      const publicKey = ChapaService.getPublicKey();
      return sendSuccess(res, {
        isConfigured,
        mode: isConfigured ? 'live' : 'sandbox',
        publicKey: publicKey ? `${publicKey.slice(0, 10)}...` : null,
        provider: 'chapa',
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async getAllPayments(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const result = await PaymentService.getPayments({ limit, page });
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
