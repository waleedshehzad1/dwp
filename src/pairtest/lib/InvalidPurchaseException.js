/**
 * Custom exception for invalid ticket purchase requests
 */
export default class InvalidPurchaseException extends Error {
  constructor(message = '') {
    super(message);
    this.name = 'InvalidPurchaseException';
    
    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidPurchaseException);
    }
  }
}
