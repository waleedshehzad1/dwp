import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

/**
 * Service for purchasing cinema tickets with business rule validation
 * and integration with payment and seat reservation services.
 */
export default class TicketService {
  // Ticket pricing constants
  static #TICKET_PRICES = {
    ADULT: 25,
    CHILD: 15,
    INFANT: 0
  };

  // Business rule constants
  static #MAX_TICKETS_PER_PURCHASE = 25;
  static #MIN_VALID_ACCOUNT_ID = 1;

  #paymentService;
  #seatReservationService;

  /**
   * Creates a new TicketService instance
   * @param {TicketPaymentService} paymentService - Payment service dependency
   * @param {SeatReservationService} seatReservationService - Seat reservation service dependency
   */
  constructor(paymentService = new TicketPaymentService(), seatReservationService = new SeatReservationService()) {
    this.#paymentService = paymentService;
    this.#seatReservationService = seatReservationService;
  }

  /**
   * Purchases tickets for the given account
   * @param {number} accountId - The account ID making the purchase (must be > 0)
   * @param {...TicketTypeRequest} ticketTypeRequests - Variable number of ticket requests
   * @throws {InvalidPurchaseException} When purchase request violates business rules
   * @throws {TypeError} When input parameters are invalid types
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    this.#validateAccountId(accountId);
    this.#validateTicketRequests(ticketTypeRequests);

    const ticketCounts = this.#aggregateTicketCounts(ticketTypeRequests);
    this.#validateBusinessRules(ticketCounts);

    const totalAmount = this.#calculateTotalAmount(ticketCounts);
    const totalSeats = this.#calculateTotalSeats(ticketCounts);

    // Process payment and seat reservation
    this.#paymentService.makePayment(accountId, totalAmount);
    this.#seatReservationService.reserveSeat(accountId, totalSeats);
  }

  /**
   * Validates the account ID
   * @param {number} accountId - The account ID to validate
   * @private
   */
  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId)) {
      throw new TypeError('accountId must be an integer');
    }

    if (accountId < TicketService.#MIN_VALID_ACCOUNT_ID) {
      throw new InvalidPurchaseException('Invalid account ID: must be greater than 0');
    }
  }

  /**
   * Validates the ticket type requests array
   * @param {TicketTypeRequest[]} ticketTypeRequests - Array of ticket requests to validate
   * @private
   */
  #validateTicketRequests(ticketTypeRequests) {
    if (!Array.isArray(ticketTypeRequests) || ticketTypeRequests.length === 0) {
      throw new InvalidPurchaseException('At least one ticket request is required');
    }

    // Validate each request is a TicketTypeRequest instance
    for (const request of ticketTypeRequests) {
      if (!(request instanceof TicketTypeRequest)) {
        throw new TypeError('All ticket requests must be instances of TicketTypeRequest');
      }

      if (request.getNoOfTickets() <= 0) {
        throw new InvalidPurchaseException('Number of tickets must be greater than 0');
      }
    }
  }

  /**
   * Aggregates ticket counts by type from multiple requests
   * @param {TicketTypeRequest[]} ticketTypeRequests - Array of ticket requests
   * @returns {Object} Object with ticket counts by type
   * @private
   */
  #aggregateTicketCounts(ticketTypeRequests) {
    const counts = { ADULT: 0, CHILD: 0, INFANT: 0 };

    for (const request of ticketTypeRequests) {
      const type = request.getTicketType();
      const quantity = request.getNoOfTickets();
      counts[type] += quantity;
    }

    return counts;
  }

  /**
   * Validates business rules for the ticket purchase
   * @param {Object} ticketCounts - Object containing ticket counts by type
   * @private
   */
  #validateBusinessRules(ticketCounts) {
    const totalTickets = ticketCounts.ADULT + ticketCounts.CHILD + ticketCounts.INFANT;

    // Rule: Maximum 25 tickets per purchase
    if (totalTickets > TicketService.#MAX_TICKETS_PER_PURCHASE) {
      throw new InvalidPurchaseException(`Cannot purchase more than ${TicketService.#MAX_TICKETS_PER_PURCHASE} tickets at once`);
    }

    // Rule: At least one ticket must be purchased
    if (totalTickets === 0) {
      throw new InvalidPurchaseException('At least one ticket must be purchased');
    }

    // Rule: Child and Infant tickets cannot be purchased without Adult tickets
    if ((ticketCounts.CHILD > 0 || ticketCounts.INFANT > 0) && ticketCounts.ADULT === 0) {
      throw new InvalidPurchaseException('Child and Infant tickets cannot be purchased without Adult tickets');
    }

    // Rule: Infants must not exceed adults (each infant sits on an adult's lap)
    if (ticketCounts.INFANT > ticketCounts.ADULT) {
      throw new InvalidPurchaseException('Number of Infant tickets cannot exceed number of Adult tickets');
    }
  }

  /**
   * Calculates the total amount to pay for tickets
   * @param {Object} ticketCounts - Object containing ticket counts by type
   * @returns {number} Total amount in pounds
   * @private
   */
  #calculateTotalAmount(ticketCounts) {
    return (
      ticketCounts.ADULT * TicketService.#TICKET_PRICES.ADULT +
      ticketCounts.CHILD * TicketService.#TICKET_PRICES.CHILD +
      ticketCounts.INFANT * TicketService.#TICKET_PRICES.INFANT
    );
  }

  /**
   * Calculates the total number of seats to reserve
   * Note: Infants don't require seats as they sit on adults' laps
   * @param {Object} ticketCounts - Object containing ticket counts by type
   * @returns {number} Total number of seats to reserve
   * @private
   */
  #calculateTotalSeats(ticketCounts) {
    return ticketCounts.ADULT + ticketCounts.CHILD;
  }
}
