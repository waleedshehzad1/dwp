import { describe, it, beforeEach, expect, vi } from 'vitest';
import TicketService from '../src/pairtest/TicketService.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';

describe('TicketService', () => {
  let ticketService;
  let mockPaymentService;
  let mockSeatReservationService;

  beforeEach(() => {
    mockPaymentService = {
      makePayment: vi.fn()
    };
    mockSeatReservationService = {
      reserveSeat: vi.fn()
    };
    ticketService = new TicketService(mockPaymentService, mockSeatReservationService);
  });

  describe('Account ID validation', () => {
    it('should throw TypeError for non-integer account ID', () => {
      const adultTicket = new TicketTypeRequest('ADULT', 1);
      
      expect(() => ticketService.purchaseTickets('invalid', adultTicket))
        .toThrow(TypeError);
      expect(() => ticketService.purchaseTickets(1.5, adultTicket))
        .toThrow(TypeError);
      expect(() => ticketService.purchaseTickets(null, adultTicket))
        .toThrow(TypeError);
    });

    it('should throw InvalidPurchaseException for account ID less than 1', () => {
      const adultTicket = new TicketTypeRequest('ADULT', 1);
      
      expect(() => ticketService.purchaseTickets(0, adultTicket))
        .toThrow(InvalidPurchaseException);
      expect(() => ticketService.purchaseTickets(-1, adultTicket))
        .toThrow(InvalidPurchaseException);
    });

    it('should accept valid account IDs', () => {
      const adultTicket = new TicketTypeRequest('ADULT', 1);
      
      expect(() => ticketService.purchaseTickets(1, adultTicket)).not.toThrow();
      expect(() => ticketService.purchaseTickets(999, adultTicket)).not.toThrow();
    });
  });

  describe('Ticket request validation', () => {
    it('should throw InvalidPurchaseException when no ticket requests provided', () => {
      expect(() => ticketService.purchaseTickets(1))
        .toThrow(InvalidPurchaseException);
    });

    it('should throw TypeError for invalid ticket request types', () => {
      expect(() => ticketService.purchaseTickets(1, 'invalid'))
        .toThrow(TypeError);
      expect(() => ticketService.purchaseTickets(1, {}))
        .toThrow(TypeError);
      expect(() => ticketService.purchaseTickets(1, null))
        .toThrow(TypeError);
    });

    it('should throw InvalidPurchaseException for zero or negative ticket quantities', () => {
      const zeroTicket = new TicketTypeRequest('ADULT', 0);
      const negativeTicket = new TicketTypeRequest('ADULT', -1);
      
      expect(() => ticketService.purchaseTickets(1, zeroTicket))
        .toThrow(InvalidPurchaseException);
      expect(() => ticketService.purchaseTickets(1, negativeTicket))
        .toThrow(InvalidPurchaseException);
    });
  });

  describe('Business rule validation', () => {
    it('should throw InvalidPurchaseException when purchasing more than 25 tickets', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 26);
      
      expect(() => ticketService.purchaseTickets(1, adultTickets))
        .toThrow(InvalidPurchaseException);
    });

    it('should allow purchasing exactly 25 tickets', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 25);
      
      expect(() => ticketService.purchaseTickets(1, adultTickets)).not.toThrow();
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 625); // 25 * 25
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(1, 25);
    });

    it('should throw InvalidPurchaseException when purchasing child tickets without adult tickets', () => {
      const childTicket = new TicketTypeRequest('CHILD', 1);
      
      expect(() => ticketService.purchaseTickets(1, childTicket))
        .toThrow(InvalidPurchaseException);
    });

    it('should throw InvalidPurchaseException when purchasing infant tickets without adult tickets', () => {
      const infantTicket = new TicketTypeRequest('INFANT', 1);
      
      expect(() => ticketService.purchaseTickets(1, infantTicket))
        .toThrow(InvalidPurchaseException);
    });

    it('should throw InvalidPurchaseException when infants exceed adults', () => {
      const adultTicket = new TicketTypeRequest('ADULT', 1);
      const infantTickets = new TicketTypeRequest('INFANT', 2);
      
      expect(() => ticketService.purchaseTickets(1, adultTicket, infantTickets))
        .toThrow(InvalidPurchaseException);
    });

    it('should allow equal number of infants and adults', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 2);
      const infantTickets = new TicketTypeRequest('INFANT', 2);
      
      expect(() => ticketService.purchaseTickets(1, adultTickets, infantTickets))
        .not.toThrow();
    });
  });

  describe('Payment calculation', () => {
    it('should calculate correct payment for adult tickets only', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 3);
      
      ticketService.purchaseTickets(1, adultTickets);
      
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 75); // 3 * 25
    });

    it('should calculate correct payment for child tickets with adult', () => {
      const adultTicket = new TicketTypeRequest('ADULT', 1);
      const childTickets = new TicketTypeRequest('CHILD', 2);
      
      ticketService.purchaseTickets(1, adultTicket, childTickets);
      
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 55); // (1 * 25) + (2 * 15)
    });

    it('should calculate correct payment for mixed ticket types', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 2);
      const childTickets = new TicketTypeRequest('CHILD', 1);
      const infantTickets = new TicketTypeRequest('INFANT', 2);
      
      ticketService.purchaseTickets(1, adultTickets, childTickets, infantTickets);
      
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 65); // (2 * 25) + (1 * 15) + (2 * 0)
    });

    it('should not charge for infant tickets', () => {
      const adultTicket = new TicketTypeRequest('ADULT', 1);
      const infantTicket = new TicketTypeRequest('INFANT', 1);
      
      ticketService.purchaseTickets(1, adultTicket, infantTicket);
      
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 25); // Only adult ticket
    });
  });

  describe('Seat reservation calculation', () => {
    it('should reserve correct number of seats for adults only', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 3);
      
      ticketService.purchaseTickets(1, adultTickets);
      
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(1, 3);
    });

    it('should reserve seats for adults and children but not infants', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 2);
      const childTickets = new TicketTypeRequest('CHILD', 1);
      const infantTickets = new TicketTypeRequest('INFANT', 2);
      
      ticketService.purchaseTickets(1, adultTickets, childTickets, infantTickets);
      
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(1, 3); // 2 adults + 1 child
    });

    it('should not reserve seats for infants', () => {
      const adultTicket = new TicketTypeRequest('ADULT', 1);
      const infantTicket = new TicketTypeRequest('INFANT', 1);
      
      ticketService.purchaseTickets(1, adultTicket, infantTicket);
      
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(1, 1); // Only adult seat
    });
  });

  describe('Multiple ticket requests aggregation', () => {
    it('should aggregate multiple requests of the same type', () => {
      const adultTickets1 = new TicketTypeRequest('ADULT', 2);
      const adultTickets2 = new TicketTypeRequest('ADULT', 1);
      
      ticketService.purchaseTickets(1, adultTickets1, adultTickets2);
      
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 75); // 3 * 25
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(1, 3);
    });

    it('should handle complex mixed requests', () => {
      const adultTickets1 = new TicketTypeRequest('ADULT', 1);
      const childTickets1 = new TicketTypeRequest('CHILD', 1);
      const adultTickets2 = new TicketTypeRequest('ADULT', 1);
      const infantTickets = new TicketTypeRequest('INFANT', 1);
      const childTickets2 = new TicketTypeRequest('CHILD', 1);
      
      ticketService.purchaseTickets(1, adultTickets1, childTickets1, adultTickets2, infantTickets, childTickets2);
      
      // Total: 2 adults, 2 children, 1 infant
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 80); // (2 * 25) + (2 * 15)
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(1, 4); // 2 adults + 2 children
    });
  });

  describe('Integration with third-party services', () => {
    it('should call payment service with correct parameters', () => {
      const adultTicket = new TicketTypeRequest('ADULT', 1);
      const accountId = 123;
      
      ticketService.purchaseTickets(accountId, adultTicket);
      
      expect(mockPaymentService.makePayment).toHaveBeenCalledTimes(1);
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(accountId, 25);
    });

    it('should call seat reservation service with correct parameters', () => {
      const adultTicket = new TicketTypeRequest('ADULT', 1);
      const accountId = 123;
      
      ticketService.purchaseTickets(accountId, adultTicket);
      
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledTimes(1);
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, 1);
    });

    it('should call services in correct order', () => {
      const adultTicket = new TicketTypeRequest('ADULT', 1);
      const callOrder = [];
      
      mockPaymentService.makePayment.mockImplementation(() => {
        callOrder.push('payment');
      });
      
      mockSeatReservationService.reserveSeat.mockImplementation(() => {
        callOrder.push('reservation');
      });
      
      ticketService.purchaseTickets(1, adultTicket);
      
      expect(callOrder).toEqual(['payment', 'reservation']);
    });
  });

  describe('Edge cases', () => {
    it('should handle minimum valid purchase', () => {
      const adultTicket = new TicketTypeRequest('ADULT', 1);
      
      expect(() => ticketService.purchaseTickets(1, adultTicket)).not.toThrow();
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 25);
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(1, 1);
    });

    it('should handle maximum valid purchase', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 25);
      
      expect(() => ticketService.purchaseTickets(1, adultTickets)).not.toThrow();
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 625);
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(1, 25);
    });

    it('should handle large account ID', () => {
      const adultTicket = new TicketTypeRequest('ADULT', 1);
      const largeAccountId = Number.MAX_SAFE_INTEGER;
      
      expect(() => ticketService.purchaseTickets(largeAccountId, adultTicket)).not.toThrow();
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(largeAccountId, 25);
    });
  });
});
