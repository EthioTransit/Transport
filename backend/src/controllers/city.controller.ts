import { Request, Response } from 'express';
import { CityService } from '../services/city.service';
import { sendSuccess, sendError } from '../utils/response.utils';

export class CityController {
  static async searchCities(req: Request, res: Response) {
    try {
      const q = req.query.q as string | undefined;
      const all = req.query.all === 'true';
      const cities = await CityService.searchCities(q, all);
      return sendSuccess(res, cities);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async getCityById(req: Request, res: Response) {
    try {
      const city = await CityService.getCityById(req.params.id);
      return sendSuccess(res, city);
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  static async createCity(req: Request, res: Response) {
    try {
      const userContext = req.user
        ? { id: req.user.userId, email: req.user.email, role: req.user.role }
        : undefined;
      const city = await CityService.createCity(req.body, userContext);
      return sendSuccess(res, city, 'City created successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async updateCity(req: Request, res: Response) {
    try {
      const userContext = req.user
        ? { id: req.user.userId, email: req.user.email, role: req.user.role }
        : undefined;
      const city = await CityService.updateCity(req.params.id, req.body, userContext);
      return sendSuccess(res, city, 'City updated successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async toggleStatus(req: Request, res: Response) {
    try {
      const userContext = req.user
        ? { id: req.user.userId, email: req.user.email, role: req.user.role }
        : undefined;
      const { status } = req.body;
      if (!['ACTIVE', 'INACTIVE'].includes(status)) {
        return sendError(res, 'Status must be ACTIVE or INACTIVE', 400);
      }
      const city = await CityService.updateCity(req.params.id, { status }, userContext);
      return sendSuccess(res, city, `City status updated to ${status}`);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getCityRoutes(req: Request, res: Response) {
    try {
      const routes = await CityService.getCityRoutes(req.params.id);
      return sendSuccess(res, routes);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
