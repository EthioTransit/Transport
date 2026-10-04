import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response.utils';

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const search = req.query.search as string | undefined;
      const role = req.query.role as string | undefined;
      const users = await UserService.getAllUsers({ search, role });
      return sendSuccess(res, users);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await UserService.getUserById(req.params.id);
      return sendSuccess(res, user);
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const userContext = req.user
        ? { id: req.user.userId, email: req.user.email, role: req.user.role }
        : undefined;
      const user = await UserService.updateUser(req.params.id, req.body, userContext);
      return sendSuccess(res, user, 'User updated successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async toggleStatus(req: Request, res: Response) {
    try {
      const { isActive } = req.body;
      const userContext = req.user
        ? { id: req.user.userId, email: req.user.email, role: req.user.role }
        : undefined;
      const user = await UserService.toggleStatus(req.params.id, Boolean(isActive), userContext);
      return sendSuccess(res, user, `User status updated to ${isActive ? 'Active' : 'Suspended'}`);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}
