import { describe, it, expect } from 'vitest';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';

describe('TicketTypeRequest', () => {
  describe('Constructor validation', () => {
    it('should create a valid TicketTypeRequest for ADULT type', () => {
      const request = new TicketTypeRequest('ADULT', 1);
      
      expect(request.getTicketType()).toBe('ADULT');
      expect(request.getNoOfTickets()).toBe(1);
    });

    it('should create a valid TicketTypeRequest for CHILD type', () => {
      const request = new TicketTypeRequest('CHILD', 5);
      
      expect(request.getTicketType()).toBe('CHILD');
      expect(request.getNoOfTickets()).toBe(5);
    });

    it('should create a valid TicketTypeRequest for INFANT type', () => {
      const request = new TicketTypeRequest('INFANT', 2);
      
      expect(request.getTicketType()).toBe('INFANT');
      expect(request.getNoOfTickets()).toBe(2);
    });

    it('should throw TypeError for invalid ticket type', () => {
      expect(() => new TicketTypeRequest('INVALID', 1))
        .toThrow(TypeError);
      expect(() => new TicketTypeRequest('invalid', 1))
        .toThrow(TypeError);
      expect(() => new TicketTypeRequest('', 1))
        .toThrow(TypeError);
      expect(() => new TicketTypeRequest(null, 1))
        .toThrow(TypeError);
      expect(() => new TicketTypeRequest(undefined, 1))
        .toThrow(TypeError);
    });

    it('should throw TypeError for non-integer ticket count', () => {
      expect(() => new TicketTypeRequest('ADULT', 'invalid'))
        .toThrow(TypeError);
      expect(() => new TicketTypeRequest('ADULT', 1.5))
        .toThrow(TypeError);
      expect(() => new TicketTypeRequest('ADULT', null))
        .toThrow(TypeError);
      expect(() => new TicketTypeRequest('ADULT', undefined))
        .toThrow(TypeError);
      expect(() => new TicketTypeRequest('ADULT', {}))
        .toThrow(TypeError);
    });

    it('should allow zero and negative ticket counts (business validation happens elsewhere)', () => {
      // TicketTypeRequest should only validate types, business logic is in TicketService
      const zeroRequest = new TicketTypeRequest('ADULT', 0);
      const negativeRequest = new TicketTypeRequest('ADULT', -1);
      
      expect(zeroRequest.getNoOfTickets()).toBe(0);
      expect(negativeRequest.getNoOfTickets()).toBe(-1);
    });
  });

  describe('Immutability', () => {
    it('should not allow modification of ticket type after creation', () => {
      const request = new TicketTypeRequest('ADULT', 1);
      
      // Try to modify private fields (should not be possible)
      expect(() => {
        request.type = 'CHILD';
      }).not.toThrow(); // Won't throw but won't change the value
      
      expect(request.getTicketType()).toBe('ADULT'); // Should remain unchanged
    });

    it('should not allow modification of ticket count after creation', () => {
      const request = new TicketTypeRequest('ADULT', 1);
      
      // Try to modify private fields (should not be possible)
      expect(() => {
        request.noOfTickets = 5;
      }).not.toThrow(); // Won't throw but won't change the value
      
      expect(request.getNoOfTickets()).toBe(1); // Should remain unchanged
    });

    it('should not expose private fields directly', () => {
      const request = new TicketTypeRequest('ADULT', 1);
      
      // Private fields should not be accessible
      expect(request.type).toBeUndefined();
      expect(request.noOfTickets).toBeUndefined();
      expect(request._type).toBeUndefined();
      expect(request._noOfTickets).toBeUndefined();
    });
  });

  describe('Getters', () => {
    it('should return correct ticket type through getter', () => {
      const adultRequest = new TicketTypeRequest('ADULT', 1);
      const childRequest = new TicketTypeRequest('CHILD', 2);
      const infantRequest = new TicketTypeRequest('INFANT', 3);
      
      expect(adultRequest.getTicketType()).toBe('ADULT');
      expect(childRequest.getTicketType()).toBe('CHILD');
      expect(infantRequest.getTicketType()).toBe('INFANT');
    });

    it('should return correct number of tickets through getter', () => {
      const request1 = new TicketTypeRequest('ADULT', 1);
      const request2 = new TicketTypeRequest('CHILD', 10);
      const request3 = new TicketTypeRequest('INFANT', 25);
      
      expect(request1.getNoOfTickets()).toBe(1);
      expect(request2.getNoOfTickets()).toBe(10);
      expect(request3.getNoOfTickets()).toBe(25);
    });
  });

  describe('Edge cases', () => {
    it('should handle maximum integer value for ticket count', () => {
      const maxTickets = Number.MAX_SAFE_INTEGER;
      const request = new TicketTypeRequest('ADULT', maxTickets);
      
      expect(request.getNoOfTickets()).toBe(maxTickets);
    });

    it('should handle large but reasonable ticket counts', () => {
      const request = new TicketTypeRequest('ADULT', 1000);
      
      expect(request.getNoOfTickets()).toBe(1000);
      expect(request.getTicketType()).toBe('ADULT');
    });
  });
});
