/**
 * Immutable Object.
 */

export default class TicketTypeRequest {
  #type;

  #noOfTickets;

  static #VALID_TYPES = ['ADULT', 'CHILD', 'INFANT'];

  constructor(type, noOfTickets) {
    if (!TicketTypeRequest.#VALID_TYPES.includes(type)) {
      throw new TypeError(`type must be ${TicketTypeRequest.#VALID_TYPES.slice(0, -1).join(', ')}, or ${TicketTypeRequest.#VALID_TYPES.slice(-1)}`);
    }

    if (!Number.isInteger(noOfTickets)) {
      throw new TypeError('noOfTickets must be an integer');
    }

    this.#type = type;
    this.#noOfTickets = noOfTickets;
  }

  getNoOfTickets() {
    return this.#noOfTickets;
  }

  getTicketType() {
    return this.#type;
  }
}
