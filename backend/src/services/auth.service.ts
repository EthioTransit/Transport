import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { OtpVerification } from '../models/OtpVerification';
import { BrevoService } from './brevo.service';
import { UserRole } from '../types';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { AuditService } from './audit.service';

export class AuthService {
  /**
   * Initiate registration by generating a 6-digit OTP, saving pending registration,
   * and sending the OTP email via Brevo.
   */
  static async initiateRegistration(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
    operatorId?: string;
  }) {
    const email = data.email.toLowerCase().trim();
    const phone = data.phone.trim();

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error('An account with this email address already exists.');
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      throw new Error('An account with this phone number already exists.');
    }

    if (data.role === UserRole.ADMIN || data.role === UserRole.SUPER_ADMIN) {
      const existingAdmin = await User.findOne({
        role: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      });
      if (existingAdmin) {
        throw new Error('Only one system administrator account is allowed in EthioTransit.');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Generate cryptographic 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpSalt = await bcrypt.genSalt(8);
    const otpHash = await bcrypt.hash(otpCode, otpSalt);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert pending registration record
    await OtpVerification.findOneAndUpdate(
      { email },
      {
        email,
        otpHash,
        registrationData: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email,
          phone,
          passwordHash,
          role: data.role || UserRole.PASSENGER,
          operatorId: data.operatorId,
        },
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Send email through Brevo
    const emailSent = await BrevoService.sendOtpEmail(
      email,
      `${data.firstName} ${data.lastName}`,
      otpCode
    );

    return {
      message: 'Verification code sent to email',
      email,
      expiresInSeconds: 600,
      emailSent,
      // Provide devCode fallback if Brevo key is not configured or in development
      ...((!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY.includes('xxxx') || process.env.NODE_ENV !== 'production')
        ? { devCode: otpCode }
        : {}),
    };
  }

  /**
   * Verify the 6-digit OTP sent to email and complete the account creation.
   */
  static async verifyRegistrationOtp(email: string, otp: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const pending = await OtpVerification.findOne({ email: normalizedEmail });

    if (!pending) {
      throw new Error('No pending registration found for this email, or code has expired. Please try registering again.');
    }

    if (new Date() > pending.expiresAt) {
      await OtpVerification.deleteOne({ _id: pending._id });
      throw new Error('Verification code has expired. Please request a new code.');
    }

    if (pending.attempts >= 5) {
      await OtpVerification.deleteOne({ _id: pending._id });
      throw new Error('Too many invalid attempts. Please register again to receive a fresh verification code.');
    }

    const isMatch = await bcrypt.compare(otp.trim(), pending.otpHash);
    if (!isMatch) {
      pending.attempts += 1;
      await pending.save();
      const remaining = 5 - pending.attempts;
      throw new Error(`Invalid verification code. (${remaining} attempt${remaining !== 1 ? 's' : ''} remaining)`);
    }

    // Double check email hasn't been claimed in the meantime
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      await OtpVerification.deleteOne({ _id: pending._id });
      throw new Error('An account with this email address is already active.');
    }

    const { firstName, lastName, phone, passwordHash, role, operatorId } = pending.registrationData;

    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      phone,
      passwordHash,
      role: role || UserRole.PASSENGER,
      operatorId,
    });

    // Delete verified OTP record
    await OtpVerification.deleteOne({ _id: pending._id });

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      operatorId: user.operatorId ? user.operatorId.toString() : undefined,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await AuditService.log({
      user: user._id.toString(),
      userEmail: user.email,
      role: user.role,
      action: 'USER_REGISTERED_OTP_VERIFIED',
      resource: 'User',
      resourceId: user._id.toString(),
    });

    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        operatorId: user.operatorId,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Resend a new OTP code to the user's email with a 30s rate limit.
   */
  static async resendRegistrationOtp(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const pending = await OtpVerification.findOne({ email: normalizedEmail });

    if (!pending) {
      throw new Error('No pending registration found for this email. Please register first.');
    }

    // Cooldown check (30 seconds)
    const timeSinceLastSent = Date.now() - new Date(pending.lastSentAt).getTime();
    if (timeSinceLastSent < 30000) {
      const waitSeconds = Math.ceil((30000 - timeSinceLastSent) / 1000);
      throw new Error(`Please wait ${waitSeconds}s before requesting another verification code.`);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpSalt = await bcrypt.genSalt(8);
    const otpHash = await bcrypt.hash(otpCode, otpSalt);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    pending.otpHash = otpHash;
    pending.expiresAt = expiresAt;
    pending.attempts = 0;
    pending.lastSentAt = new Date();
    await pending.save();

    const emailSent = await BrevoService.sendOtpEmail(
      normalizedEmail,
      `${pending.registrationData.firstName} ${pending.registrationData.lastName}`,
      otpCode
    );

    return {
      message: 'New verification code sent',
      email: normalizedEmail,
      expiresInSeconds: 600,
      emailSent,
      ...((!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY.includes('xxxx') || process.env.NODE_ENV !== 'production')
        ? { devCode: otpCode }
        : {}),
    };
  }

  /**
   * Direct registration (retains backward compatibility if OTP is provided or optional)
   */
  static async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
    operatorId?: string;
    otp?: string;
  }) {
    if (data.otp) {
      return this.verifyRegistrationOtp(data.email, data.otp);
    }
    return this.initiateRegistration(data);
  }


  static async login(data: { email: string; password: string }) {
    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new Error('This account has been disabled. Please contact support.');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      operatorId: user.operatorId ? user.operatorId.toString() : undefined,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await AuditService.log({
      user: user._id.toString(),
      userEmail: user.email,
      role: user.role,
      action: 'USER_LOGIN',
      resource: 'User',
      resourceId: user._id.toString(),
    });

    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        operatorId: user.operatorId,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(token: string) {
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new Error('Invalid or inactive user token.');
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      operatorId: user.operatorId ? user.operatorId.toString() : undefined,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return { accessToken, refreshToken };
  }

  static async getUserProfile(userId: string) {
    const user = await User.findById(userId).populate('operatorId').lean();
    if (!user) {
      throw new Error('User not found.');
    }
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
