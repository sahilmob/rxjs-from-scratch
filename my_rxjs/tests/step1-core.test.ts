/**
 * Step 1: Observable & Subscriber Basics - Test Suite
 *
 * These tests verify the core Observable pattern implementation.
 * Your implementation should pass all these tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { Observable } from '../src/core/Observable';
import { Subscription } from '../src/core/Subscription';

describe('Step 1: Core Observable & Subscriber', () => {
  describe('Subscription', () => {
    it('should unsubscribe and set closed to true', () => {
      const subscription = new Subscription();
      expect(subscription.closed).toBe(false);

      subscription.unsubscribe();
      expect(subscription.closed).toBe(true);
    });

    it('should call teardown function on unsubscribe', () => {
      const teardown = vi.fn();
      const subscription = new Subscription(teardown);

      subscription.unsubscribe();
      expect(teardown).toHaveBeenCalledTimes(1);
    });

    it('should be idempotent (safe to call unsubscribe multiple times)', () => {
      const teardown = vi.fn();
      const subscription = new Subscription(teardown);

      subscription.unsubscribe();
      subscription.unsubscribe();
      subscription.unsubscribe();

      expect(teardown).toHaveBeenCalledTimes(1);
      expect(subscription.closed).toBe(true);
    });

    it('should execute added teardowns on unsubscribe', () => {
      const teardown1 = vi.fn();
      const teardown2 = vi.fn();
      const subscription = new Subscription();

      subscription.add(teardown1);
      subscription.add(teardown2);
      subscription.unsubscribe();

      expect(teardown1).toHaveBeenCalledTimes(1);
      expect(teardown2).toHaveBeenCalledTimes(1);
    });

    it('should execute teardown immediately if already closed', () => {
      const teardown = vi.fn();
      const subscription = new Subscription();

      subscription.unsubscribe();
      subscription.add(teardown);

      expect(teardown).toHaveBeenCalledTimes(1);
    });

    it('should handle nested subscriptions', () => {
      const parentTeardown = vi.fn();
      const childTeardown = vi.fn();

      const parent = new Subscription(parentTeardown);
      const child = new Subscription(childTeardown);

      parent.add(child);
      parent.unsubscribe();

      expect(parentTeardown).toHaveBeenCalledTimes(1);
      expect(childTeardown).toHaveBeenCalledTimes(1);
      expect(parent.closed).toBe(true);
      expect(child.closed).toBe(true);
    });
  });

  describe('Observable - Basic Creation', () => {
    it('should create an observable', () => {
      const observable = new Observable();
      expect(observable).toBeInstanceOf(Observable);
    });

    it('should call subscribe function when subscribed', () => {
      const subscribeFn = vi.fn();
      const observable = new Observable(subscribeFn);

      observable.subscribe();
      expect(subscribeFn).toHaveBeenCalledTimes(1);
    });

    it('should receive values via next', () => {
      const observable = new Observable<number>((subscriber) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.next(3);
        subscriber.complete();
      });

      const values: number[] = [];
      observable.subscribe({
        next: (value) => values.push(value),
      });

      expect(values).toEqual([1, 2, 3]);
    });

    it('should handle completion', () => {
      const observable = new Observable<number>((subscriber) => {
        subscriber.next(1);
        subscriber.complete();
      });

      const completeFn = vi.fn();
      observable.subscribe({
        complete: completeFn,
      });

      expect(completeFn).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', () => {
      const testError = new Error('Test error');
      const observable = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.error(testError);
      });

      const errorFn = vi.fn();
      observable.subscribe({
        error: errorFn,
      });

      expect(errorFn).toHaveBeenCalledWith(testError);
    });

    it('should stop emitting after complete', () => {
      const observable = new Observable<number>((subscriber) => {
        subscriber.next(1);
        subscriber.complete();
        subscriber.next(2); // This should be ignored
      });

      const values: number[] = [];
      observable.subscribe({
        next: (value) => values.push(value),
      });

      expect(values).toEqual([1]);
    });

    it('should stop emitting after error', () => {
      const observable = new Observable<number>((subscriber) => {
        subscriber.next(1);
        subscriber.error(new Error('oops'));
        subscriber.next(2); // This should be ignored
      });

      const values: number[] = [];
      observable.subscribe({
        next: (value) => values.push(value),
        error: () => {}, // Prevent error from propagating
      });

      expect(values).toEqual([1]);
    });
  });

  describe('Observable - Subscription & Cleanup', () => {
    it('should return a subscription', () => {
      const observable = new Observable();
      const subscription = observable.subscribe();

      expect(subscription).toBeInstanceOf(Subscription);
    });

    it('should execute teardown on unsubscribe', () => {
      const teardown = vi.fn();
      const observable = new Observable(() => {
        return teardown;
      });

      const subscription = observable.subscribe();
      subscription.unsubscribe();

      expect(teardown).toHaveBeenCalledTimes(1);
    });

    it('should stop receiving values after unsubscribe', () => {
      let emit: ((value: number) => void) | undefined;

      const observable = new Observable<number>((subscriber) => {
        emit = (value) => subscriber.next(value);
      });

      const values: number[] = [];
      const subscription = observable.subscribe({
        next: (value) => values.push(value),
      });

      emit!(1);
      emit!(2);
      subscription.unsubscribe();
      emit!(3); // Should not be received

      expect(values).toEqual([1, 2]);
    });

    it('should handle synchronous errors in subscribe function', () => {
      const observable = new Observable(() => {
        throw new Error('Sync error');
      });

      const errorFn = vi.fn();
      observable.subscribe({
        error: errorFn,
      });

      expect(errorFn).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Observable - Multiple Subscriptions', () => {
    it('should allow multiple independent subscriptions', () => {
      const observable = new Observable<number>((subscriber) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.complete();
      });

      const values1: number[] = [];
      const values2: number[] = [];

      observable.subscribe({
        next: (value) => values1.push(value),
      });

      observable.subscribe({
        next: (value) => values2.push(value),
      });

      expect(values1).toEqual([1, 2]);
      expect(values2).toEqual([1, 2]);
    });

    it('should execute subscribe function for each subscription', () => {
      const subscribeFn = vi.fn();
      const observable = new Observable(subscribeFn);

      observable.subscribe();
      observable.subscribe();
      observable.subscribe();

      expect(subscribeFn).toHaveBeenCalledTimes(3);
    });

    it('should have independent teardowns', () => {
      const teardown1 = vi.fn();
      const teardown2 = vi.fn();
      let teardownCount = 0;

      const observable = new Observable(() => {
        teardownCount++;
        return teardownCount === 1 ? teardown1 : teardown2;
      });

      const sub1 = observable.subscribe();
      const sub2 = observable.subscribe();

      sub1.unsubscribe();
      expect(teardown1).toHaveBeenCalledTimes(1);
      expect(teardown2).toHaveBeenCalledTimes(0);

      sub2.unsubscribe();
      expect(teardown1).toHaveBeenCalledTimes(1);
      expect(teardown2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Observer Variants', () => {
    it('should accept a next function as observer', () => {
      const observable = new Observable<number>((subscriber) => {
        subscriber.next(42);
        subscriber.complete();
      });

      const nextFn = vi.fn();
      observable.subscribe(nextFn);

      expect(nextFn).toHaveBeenCalledWith(42);
    });

    it('should accept partial observer', () => {
      const observable = new Observable<number>((subscriber) => {
        subscriber.next(1);
        subscriber.complete();
      });

      const nextFn = vi.fn();
      observable.subscribe({ next: nextFn });

      expect(nextFn).toHaveBeenCalledWith(1);
    });

    it('should handle observer with only complete', () => {
      const observable = new Observable((subscriber) => {
        subscriber.complete();
      });

      const completeFn = vi.fn();
      observable.subscribe({ complete: completeFn });

      expect(completeFn).toHaveBeenCalledTimes(1);
    });

    it('should handle empty observer', () => {
      const observable = new Observable<number>((subscriber) => {
        subscriber.next(1);
        subscriber.complete();
      });

      // Should not throw
      expect(() => observable.subscribe({})).not.toThrow();
      expect(() => observable.subscribe()).not.toThrow();
    });
  });
});
