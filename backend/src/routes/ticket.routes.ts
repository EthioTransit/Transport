import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/my', authenticate, TicketController.getMyTickets);
router.get('/booking/:bookingId', TicketController.getTicketsByBooking);
router.get('/lookup/:query', TicketController.lookupTicket);
router.get('/:id', TicketController.getTicketById);




export default router;
