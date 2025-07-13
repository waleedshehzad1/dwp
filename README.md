# Cinema Tickets JavaScript

A robust ticket purchasing service implementation for a cinema booking system, built with TypeScript-like patterns in JavaScript using ES6+ features.

## Overview

This project implements a `TicketService` that handles cinema ticket purchases with comprehensive business rule validation, payment processing, and seat reservation functionality.

## Features

- ✅ **Type Safety**: Comprehensive input validation and type checking
- ✅ **Business Rules**: Full implementation of all cinema ticket business rules
- ✅ **Error Handling**: Detailed error messages with appropriate exception types
- ✅ **Immutable Objects**: TicketTypeRequest remains immutable as required
- ✅ **Dependency Injection**: Clean architecture with injectable services
- ✅ **Comprehensive Testing**: 100% test coverage with edge cases
- ✅ **Documentation**: Full JSDoc documentation for all methods

## Business Rules Implemented

1. **Ticket Types**: Support for INFANT (£0), CHILD (£15), and ADULT (£25) tickets
2. **Purchase Limits**: Maximum 25 tickets per transaction
3. **Adult Dependency**: Child and Infant tickets require Adult ticket purchases
4. **Seat Allocation**: Infants don't require seats (sit on adult laps)
5. **Infant Limits**: Number of infants cannot exceed number of adults
6. **Account Validation**: Only accounts with ID > 0 are valid

## Architecture

### Core Classes

- **`TicketService`**: Main service class handling ticket purchases
- **`TicketTypeRequest`**: Immutable value object for ticket requests
- **`InvalidPurchaseException`**: Custom exception for business rule violations

### Third-Party Services

- **`TicketPaymentService`**: External payment processing (cannot be modified)
- **`SeatReservationService`**: External seat booking (cannot be modified)

## Installation

```bash
npm install
```

## Usage

```javascript
import TicketService from './src/pairtest/TicketService.js';
import TicketTypeRequest from './src/pairtest/lib/TicketTypeRequest.js';

const ticketService = new TicketService();

// Purchase tickets
const adultTickets = new TicketTypeRequest('ADULT', 2);
const childTickets = new TicketTypeRequest('CHILD', 1);
const infantTickets = new TicketTypeRequest('INFANT', 1);

try {
  ticketService.purchaseTickets(123, adultTickets, childTickets, infantTickets);
  console.log('Tickets purchased successfully!');
} catch (error) {
  console.error('Purchase failed:', error.message);
}
```

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

The test suite includes:

- **Input Validation Tests**: Account ID and ticket request validation
- **Business Rule Tests**: All cinema business rules with edge cases
- **Payment Calculation Tests**: Accurate pricing calculations
- **Seat Reservation Tests**: Correct seat allocation logic
- **Integration Tests**: Third-party service interactions
- **Error Handling Tests**: Exception scenarios and error messages

## Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## API Documentation

### TicketService

#### `purchaseTickets(accountId, ...ticketTypeRequests)`

Purchases tickets for the specified account.

**Parameters:**
- `accountId` (number): Account ID (must be > 0)
- `ticketTypeRequests` (...TicketTypeRequest): Variable number of ticket requests

**Throws:**
- `TypeError`: Invalid input parameter types
- `InvalidPurchaseException`: Business rule violations

**Example:**
```javascript
const service = new TicketService();
const adultTicket = new TicketTypeRequest('ADULT', 2);
service.purchaseTickets(123, adultTicket);
```

### TicketTypeRequest

#### `constructor(type, noOfTickets)`

Creates an immutable ticket request.

**Parameters:**
- `type` (string): Ticket type ('ADULT', 'CHILD', or 'INFANT')
- `noOfTickets` (number): Number of tickets (must be positive integer)

**Methods:**
- `getTicketType()`: Returns the ticket type
- `getNoOfTickets()`: Returns the number of tickets

## Error Handling

The service provides detailed error messages for various scenarios:

```javascript
// Invalid account ID
ticketService.purchaseTickets(0, adultTicket);
// throws: InvalidPurchaseException('Invalid account ID: must be greater than 0')

// Child ticket without adult
ticketService.purchaseTickets(1, new TicketTypeRequest('CHILD', 1));
// throws: InvalidPurchaseException('Child and Infant tickets cannot be purchased without Adult tickets')

// Too many tickets
ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 26));
// throws: InvalidPurchaseException('Cannot purchase more than 25 tickets at once')
```

## Implementation Details

### Validation Strategy

1. **Type Validation**: Strict type checking for all inputs
2. **Range Validation**: Business rule boundary checking
3. **Logical Validation**: Cross-ticket-type rule validation
4. **Integration Validation**: Service dependency validation

### Calculation Logic

- **Payment**: `(adults × £25) + (children × £15) + (infants × £0)`
- **Seats**: `adults + children` (infants don't require seats)

### Error Recovery

The service follows a fail-fast approach:
- Validates all inputs before processing
- Throws specific exceptions with clear error messages
- Maintains transaction integrity (no partial processing)

## Development Principles

- **SOLID Principles**: Single responsibility, dependency injection
- **Clean Code**: Readable, maintainable, well-documented code
- **Test-Driven Development**: Comprehensive test coverage
- **Error Handling**: Graceful failure with informative messages
- **Type Safety**: Runtime type validation and checking

## Future Enhancements

Potential improvements (not implemented due to constraints):

1. **TypeScript**: Full static type checking
2. **Logging**: Structured logging for audit trails
3. **Metrics**: Performance and business metrics collection
4. **Caching**: Service response caching for performance
5. **Retry Logic**: Resilient third-party service integration
6. **Configuration**: Externalized business rule configuration

## License

This project is part of a coding exercise and is not licensed for production use.
