import { Request, Response } from 'express';
import { TicketService } from '../services/ticket.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import { UserRole } from '../types';

export class TicketController {
  static async lookupTicket(req: Request, res: Response) {
    try {
      const tickets = await TicketService.lookupTickets(req.params.query);
      return sendSuccess(res, tickets);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async getTicketById(req: Request, res: Response) {
    try {
      const ticket = await TicketService.getTicketById(req.params.id);
      return sendSuccess(res, ticket);
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  static async getTicketsByBooking(req: Request, res: Response) {
    try {
      const tickets = await TicketService.getTicketsByBooking(req.params.bookingId);
      return sendSuccess(res, tickets);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async getMyTickets(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 401);
      const tickets = await TicketService.getUserTickets(req.user.userId);
      return sendSuccess(res, tickets);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
