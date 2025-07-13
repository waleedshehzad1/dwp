#!/usr/bin/env node
/**
 * Example usage of the TicketService
 * This file demonstrates various ticket purchasing scenarios
 */

import TicketService from './src/pairtest/TicketService.js';
import TicketTypeRequest from './src/pairtest/lib/TicketTypeRequest.js';
import InvalidPurchaseException from './src/pairtest/lib/InvalidPurchaseException.js';

const ticketService = new TicketService();

console.log('🎬 Cinema Ticket Service Examples\n');

// Example 1: Simple adult ticket purchase
console.log('Example 1: Simple adult ticket purchase');
try {
  const adultTickets = new TicketTypeRequest('ADULT', 2);
  ticketService.purchaseTickets(123, adultTickets);
  console.log('✅ Successfully purchased 2 adult tickets for £50\n');
} catch (error) {
  console.error('❌ Purchase failed:', error.message, '\n');
}

// Example 2: Family ticket purchase
console.log('Example 2: Family ticket purchase (2 adults, 1 child, 1 infant)');
try {
  const adultTickets = new TicketTypeRequest('ADULT', 2);
  const childTickets = new TicketTypeRequest('CHILD', 1);
  const infantTickets = new TicketTypeRequest('INFANT', 1);
  
  ticketService.purchaseTickets(456, adultTickets, childTickets, infantTickets);
  console.log('✅ Successfully purchased family tickets for £65 (3 seats reserved)\n');
} catch (error) {
  console.error('❌ Purchase failed:', error.message, '\n');
}

// Example 3: Multiple ticket requests of same type
console.log('Example 3: Multiple requests aggregation');
try {
  const adultTickets1 = new TicketTypeRequest('ADULT', 1);
  const adultTickets2 = new TicketTypeRequest('ADULT', 2);
  const childTickets = new TicketTypeRequest('CHILD', 1);
  
  ticketService.purchaseTickets(789, adultTickets1, adultTickets2, childTickets);
  console.log('✅ Successfully purchased 3 adult + 1 child tickets for £90 (4 seats)\n');
} catch (error) {
  console.error('❌ Purchase failed:', error.message, '\n');
}

// Example 4: Error case - Child ticket without adult
console.log('Example 4: Error case - Child ticket without adult');
try {
  const childTickets = new TicketTypeRequest('CHILD', 1);
  ticketService.purchaseTickets(111, childTickets);
  console.log('✅ Purchase successful\n');
} catch (error) {
  console.error('❌ Expected error:', error.message, '\n');
}

// Example 5: Error case - Too many tickets
console.log('Example 5: Error case - Too many tickets');
try {
  const adultTickets = new TicketTypeRequest('ADULT', 26);
  ticketService.purchaseTickets(222, adultTickets);
  console.log('✅ Purchase successful\n');
} catch (error) {
  console.error('❌ Expected error:', error.message, '\n');
}

// Example 6: Error case - Invalid account ID
console.log('Example 6: Error case - Invalid account ID');
try {
  const adultTickets = new TicketTypeRequest('ADULT', 1);
  ticketService.purchaseTickets(0, adultTickets);
  console.log('✅ Purchase successful\n');
} catch (error) {
  console.error('❌ Expected error:', error.message, '\n');
}

// Example 7: Error case - Too many infants
console.log('Example 7: Error case - Too many infants for adults');
try {
  const adultTickets = new TicketTypeRequest('ADULT', 1);
  const infantTickets = new TicketTypeRequest('INFANT', 2);
  ticketService.purchaseTickets(333, adultTickets, infantTickets);
  console.log('✅ Purchase successful\n');
} catch (error) {
  console.error('❌ Expected error:', error.message, '\n');
}

console.log('🎭 All examples completed!');
