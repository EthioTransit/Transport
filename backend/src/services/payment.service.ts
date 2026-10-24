import { Payment, IPayment } from '../models/Payment';
import { Booking } from '../models/Booking';
import { Seat } from '../models/Seat';
import { Trip } from '../models/Trip';
import { User } from '../models/User';
import { PaymentStatus, BookingStatus, SeatStatus, NotificationType, UserRole } from '../types';
import { TicketService } from './ticket.service';
import { NotificationService } from './notification.service';
import { AuditService } from './audit.service';
import { ChapaService } from './chapa.service';
import { PersistenceService } from './persistence.service';
import { BRAND_CONFIG } from '../config/brand';
import { ENV } from '../config/env';
import { hasTripDeparted } from '../utils/time.utils';

export interface PaymentProviderResult {
  transactionReference: string;
  providerReference?: string;
  status: PaymentStatus;
  rawResponse?: any;
}

export interface IPaymentProvider {
  createPayment(amount: number, currency: string, metadata: any): Promise<{ checkoutUrl?: string; reference: string }>;
  verifyPayment(transactionReference: string, simulateResult?: string): Promise<PaymentProviderResult>;
}

export class MockPaymentProvider implements IPaymentProvider {
  async createPayment(amount: number, currency: string, metadata: any) {
    const reference = `TX-MOCK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      reference,
      checkoutUrl: `/checkout/mock-gateway?ref=${reference}&amount=${amount}`,
    };
  }

  async verifyPayment(transactionReference: string, simulateResult: string = 'SUCCESS'): Promise<PaymentProviderResult> {
    if (simulateResult === 'FAILED') {
      return {
        transactionReference,
        status: PaymentStatus.FAILED,
        providerReference: `MOCK-FAIL-${Date.now()}`,
      };
    }
    return {
      transactionReference,
      status: PaymentStatus.PAID,
      providerReference: `MOCK-AUTH-${Date.now()}`,
    };
  }
}

export class PaymentService {
  private static mockProvider: IPaymentProvider = new MockPaymentProvider();

  static async initiatePayment(params: {
    bookingId: string;
    userId: string;
    providerName?: 'mock' | 'telebirr' | 'chapa' | 'cbe_birr';
    paymentMethod?: string;
  }) {
    const booking = await Booking.findById(params.bookingId).populate('trip');
    if (!booking) throw new Error('Booking not found');

    const trip = booking.trip as any;
    if (trip && hasTripDeparted(trip.departureDate, trip.departureTime)) {
      throw new Error('Cannot process payment: This journey has already departed.');
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      throw new Error('This booking is already paid and confirmed.');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new Error('Cannot pay for a cancelled booking.');
    }

    if (new Date() > new Date(booking.expiresAt)) {
      throw new Error('Booking reservation has expired. Please select your seats again.');
    }

    const user = await User.findById(params.userId);
    const primaryPassenger = booking.passengers && booking.passengers.length > 0 ? booking.passengers[0] : null;

    const firstName = user?.firstName || primaryPassenger?.name?.split(' ')[0] || 'Passenger';
    const lastName = user?.lastName || primaryPassenger?.name?.split(' ').slice(1).join(' ') || 'Customer';
    const email = user?.email || 'passenger@ethiotransit.et';
    const rawPhone = primaryPassenger?.phone || user?.phone || '0911000000';
    const phone = rawPhone.replace(/\s+/g, '');

    const selectedProvider = params.providerName || 'chapa';
    let reference = '';
    let checkoutUrl = '';

    if (selectedProvider === 'chapa') {
      const txRef = `ET-CHP-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const returnUrl = `${ENV.CLIENT_URL}/verify-payment?ref=${txRef}`;
      const callbackUrl = `${ENV.API_BASE_URL || 'http://localhost:5000/api'}/payments/chapa/webhook`;

      const chapaSession = await ChapaService.initializePayment({
        amount: booking.total,
        currency: BRAND_CONFIG.currency,
        email,
        firstName,
        lastName,
        phone,
        txRef,
        callbackUrl,
        returnUrl,
        customization: {
          title: 'EthioTransit',
          description: `Booking ${booking.bookingReference}`.replace(/[^a-zA-Z0-9\-_.\s]/g, '').slice(0, 50),
        },
      });

      reference = txRef;
      checkoutUrl = chapaSession.checkoutUrl;
    } else {
      const mockResult = await this.mockProvider.createPayment(booking.total, BRAND_CONFIG.currency, {
        bookingId: booking._id,
        user: params.userId,
      });
      reference = mockResult.reference;
      checkoutUrl = mockResult.checkoutUrl || '';
    }

    const payment = await Payment.create({
      booking: booking._id,
      user: params.userId,
      provider: selectedProvider,
      transactionReference: reference,
      amount: booking.total,
      currency: BRAND_CONFIG.currency,
      status: PaymentStatus.PENDING,
      paymentMethod: params.paymentMethod || (selectedProvider === 'chapa' ? 'Chapa Gateway' : 'Mock Payment'),
      metadata: { checkoutUrl },
    });

    booking.payment = payment._id;
    await booking.save();
    PersistenceService.queueSave();

    return {
      paymentId: payment._id,
      transactionReference: reference,
      amount: booking.total,
      currency: BRAND_CONFIG.currency,
      officialFare: booking.fare,
      serviceFee: booking.serviceFee,
      provider: payment.provider,
      checkoutUrl,
    };
  }

  /**
   * Verified server-side. Updates status, marks seats BOOKED, and issues tickets.
   */
  static async verifyPayment(params: {
    transactionReference: string;
    simulateResult?: 'SUCCESS' | 'FAILED';
  }) {
    const payment = await Payment.findOne({ transactionReference: params.transactionReference }).populate('booking');
    if (!payment) throw new Error('Payment transaction not found');

    if (payment.status === PaymentStatus.PAID) {
      const tickets = await TicketService.getTicketsByBooking(payment.booking._id.toString());
      return {
        payment,
        status: PaymentStatus.PAID,
        message: 'Payment already verified.',
        tickets,
        bookingReference: (payment.booking as any)?.bookingReference,
      };
    }

    let isPaid = false;
    let providerRef = '';
    let failureMsg = '';

    if (payment.provider === 'chapa') {
      const chapaResult = await ChapaService.verifyPayment(params.transactionReference);
      if (chapaResult.status === 'PAID') {
        isPaid = true;
        providerRef = chapaResult.providerReference || `CHP-AUTH-${Date.now()}`;
      } else if (chapaResult.status === 'PENDING') {
        return {
          payment,
          status: PaymentStatus.PENDING,
          message: 'Chapa payment is currently pending authorization.',
        };
      } else {
        failureMsg = chapaResult.message || 'Chapa payment failed or was declined.';
      }
    } else {
      const mockResult = await this.mockProvider.verifyPayment(
        params.transactionReference,
        params.simulateResult || 'SUCCESS'
      );
      if (mockResult.status === PaymentStatus.PAID) {
        isPaid = true;
        providerRef = mockResult.providerReference || `MOCK-${Date.now()}`;
      } else {
        failureMsg = 'Mock payment authorization declined.';
      }
    }

    payment.providerReference = providerRef;

    if (isPaid) {
      payment.status = PaymentStatus.PAID;
      payment.paidAt = new Date();
      await payment.save();

      // Confirm Booking
      const booking = await Booking.findById(payment.booking);
      if (!booking) {
        throw new Error('Associated booking not found for this payment transaction.');
      }

      booking.status = BookingStatus.CONFIRMED;
      await booking.save();

      // Mark Seats as permanently BOOKED across this trip and all trips of this vehicle
      const trip = await Trip.findById(booking.trip);
      const vehicleTrips = trip?.vehicle
        ? await Trip.find({ vehicle: trip.vehicle }).distinct('_id')
        : [booking.trip];

      await Seat.updateMany(
        { trip: { $in: vehicleTrips }, seatNumber: { $in: booking.seats } },
        {
          $set: { status: SeatStatus.BOOKED, booking: booking._id },
          $unset: { lockExpiresAt: '', guestLockId: '' },
        }
      );

      // Recalculate trip available seats on all vehicle trips
      for (const vtId of vehicleTrips) {
        const availableCount = await Seat.countDocuments({
          trip: vtId,
          status: SeatStatus.AVAILABLE,
          $or: [{ booking: { $exists: false } }, { booking: null }],
        });
        await Trip.findByIdAndUpdate(vtId, { availableSeatsCount: availableCount });
      }

      // Generate Digital Tickets with secure QR tokens
      const tickets = await TicketService.generateTicketsForBooking(booking._id.toString());

      // Send In-App Notification
      await NotificationService.create({
        userId: booking.user.toString(),
        title: 'Booking Confirmed & Digital Tickets Issued',
        message: `Your journey on reference ${booking.bookingReference} is confirmed. ${tickets.length} digital ticket(s) are ready for boarding.`,
        type: NotificationType.PAYMENT_SUCCESS,
        metadata: { bookingId: booking._id, reference: booking.bookingReference },
      });

      await AuditService.log({
        user: booking.user.toString(),
        role: UserRole.PASSENGER,
        action: 'PAYMENT_COMPLETED',
        resource: 'Payment',
        resourceId: payment._id.toString(),
        newValue: { amount: payment.amount, reference: payment.transactionReference, provider: payment.provider },
      });

      PersistenceService.queueSave();

      return {
        payment,
        status: PaymentStatus.PAID,
        message: 'Payment verified successfully! Tickets generated.',
        tickets,
        bookingReference: booking.bookingReference,
      };
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = failureMsg || 'Payment authorization failed.';
      await payment.save();
      PersistenceService.queueSave();

      return {
        payment,
        status: PaymentStatus.FAILED,
        message: failureMsg || 'Payment verification failed.',
      };
    }
  }

  static async getPayments(options: { limit?: number; page?: number } = {}) {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find()
        .populate('user', 'firstName lastName email phone')
        .populate('booking')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(),
    ]);

    return { payments, total, page, totalPages: Math.ceil(total / limit) };
  }
}
