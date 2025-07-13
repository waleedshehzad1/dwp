import { describe, it, expect } from 'vitest';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';

describe('InvalidPurchaseException', () => {
  it('should extend Error class', () => {
    const exception = new InvalidPurchaseException('Test message');
    
    expect(exception).toBeInstanceOf(Error);
    expect(exception).toBeInstanceOf(InvalidPurchaseException);
  });

  it('should set the correct message', () => {
    const message = 'Invalid purchase request';
    const exception = new InvalidPurchaseException(message);
    
    expect(exception.message).toBe(message);
  });

  it('should be throwable and catchable', () => {
    const message = 'Test exception';
    
    expect(() => {
      throw new InvalidPurchaseException(message);
    }).toThrow(InvalidPurchaseException);
    
    expect(() => {
      throw new InvalidPurchaseException(message);
    }).toThrow(message);
  });

  it('should work without a message', () => {
    const exception = new InvalidPurchaseException();
    
    expect(exception).toBeInstanceOf(InvalidPurchaseException);
    expect(exception.message).toBe('');
  });

  it('should have correct name property', () => {
    const exception = new InvalidPurchaseException('Test');
    
    expect(exception.name).toBe('InvalidPurchaseException');
  });
});
