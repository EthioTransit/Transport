import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { UserRole } from '../types';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { AuditService } from './audit.service';

export class AuthService {
  static async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
    operatorId?: string;
  }) {
    const existingEmail = await User.findOne({ email: data.email.toLowerCase() });
    if (existingEmail) {
      throw new Error('An account with this email address already exists.');
    }

    const existingPhone = await User.findOne({ phone: data.phone });
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

    const user = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      passwordHash,
      role: data.role || UserRole.PASSENGER,
      operatorId: data.operatorId,
    });

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
      action: 'USER_REGISTERED',
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
