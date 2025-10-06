import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from '../src/observable/of';
import { from } from '../src/observable/from';
import { fromEvent } from '../src/observable/fromEvent';

describe('Step 2: Observable Creation Functions', () => {
  describe('of()', () => {
    it('should emit all provided values synchronously', () => {
      const values: number[] = [];
      of(1, 2, 3).subscribe({
        next: (value) => values.push(value),
      });
      expect(values).toEqual([1, 2, 3]);
    });

    it('should complete after emitting all values', () => {
      const complete = vi.fn();
      of(1, 2, 3).subscribe({
        complete,
      });
      expect(complete).toHaveBeenCalledTimes(1);
    });

    it('should work with no arguments', () => {
      const next = vi.fn();
      const complete = vi.fn();
      of().subscribe({ next, complete });
      expect(next).not.toHaveBeenCalled();
      expect(complete).toHaveBeenCalledTimes(1);
    });

    it('should work with single value', () => {
      const values: number[] = [];
      of(42).subscribe({
        next: (value) => values.push(value),
      });
      expect(values).toEqual([42]);
    });

    it('should work with different types', () => {
      const values: any[] = [];
      of('hello', 123, true, { name: 'test' }).subscribe({
        next: (value) => values.push(value),
      });
      expect(values).toEqual(['hello', 123, true, { name: 'test' }]);
    });

    it('should handle errors thrown in observer', () => {
      const error = vi.fn();
      of(1, 2, 3).subscribe({
        next: (value) => {
          if (value === 2) throw new Error('Test error');
        },
        error,
      });
      expect(error).toHaveBeenCalled();
    });
  });

  describe('from()', () => {
    it('should convert an array to an observable', () => {
      const values: number[] = [];
      from([10, 20, 30]).subscribe({
        next: (value) => values.push(value),
      });
      expect(values).toEqual([10, 20, 30]);
    });

    it('should complete after emitting all array items', () => {
      const complete = vi.fn();
      from([1, 2, 3]).subscribe({ complete });
      expect(complete).toHaveBeenCalledTimes(1);
    });

    it('should work with empty array', () => {
      const next = vi.fn();
      const complete = vi.fn();
      from([]).subscribe({ next, complete });
      expect(next).not.toHaveBeenCalled();
      expect(complete).toHaveBeenCalledTimes(1);
    });

    it('should work with single element array', () => {
      const values: string[] = [];
      from(['only']).subscribe({
        next: (value) => values.push(value),
      });
      expect(values).toEqual(['only']);
    });

    it('should work with different types in array', () => {
      const values: any[] = [];
      from([1, 'two', { three: 3 }, [4]]).subscribe({
        next: (value) => values.push(value),
      });
      expect(values).toEqual([1, 'two', { three: 3 }, [4]]);
    });

    it('should work with iterables (bonus)', () => {
      const set = new Set([1, 2, 3]);
      const values: number[] = [];
      from(set).subscribe({
        next: (value) => values.push(value),
      });
      expect(values).toEqual([1, 2, 3]);
    });

    it('should work with strings as iterables (bonus)', () => {
      const values: string[] = [];
      from('abc').subscribe({
        next: (value) => values.push(value),
      });
      expect(values).toEqual(['a', 'b', 'c']);
    });
  });

  describe('fromEvent()', () => {
    let mockTarget: any;
    let listeners: Map<string, Function[]>;

    beforeEach(() => {
      listeners = new Map();
      mockTarget = {
        addEventListener: vi.fn((event: string, handler: Function) => {
          if (!listeners.has(event)) {
            listeners.set(event, []);
          }
          listeners.get(event)!.push(handler);
        }),
        removeEventListener: vi.fn((event: string, handler: Function) => {
          if (listeners.has(event)) {
            const handlers = listeners.get(event)!;
            const index = handlers.indexOf(handler);
            if (index > -1) {
              handlers.splice(index, 1);
            }
          }
        }),
        // Helper to simulate events
        dispatchEvent: (event: string, data: any) => {
          const handlers = listeners.get(event) || [];
          handlers.forEach((handler) => handler(data));
        },
      };
    });

    it('should create an observable from events', () => {
      const events: any[] = [];
      fromEvent(mockTarget, 'click').subscribe({
        next: (event) => events.push(event),
      });

      mockTarget.dispatchEvent('click', { type: 'click', x: 10 });
      mockTarget.dispatchEvent('click', { type: 'click', x: 20 });

      expect(events).toHaveLength(2);
      expect(events[0]).toEqual({ type: 'click', x: 10 });
      expect(events[1]).toEqual({ type: 'click', x: 20 });
    });

    it('should call addEventListener when subscribed', () => {
      fromEvent(mockTarget, 'click').subscribe(() => {});
      expect(mockTarget.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );
    });

    it('should remove event listener when unsubscribed', () => {
      const subscription = fromEvent(mockTarget, 'click').subscribe(() => {});
      subscription.unsubscribe();
      expect(mockTarget.removeEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );
    });

    it('should not receive events after unsubscription', () => {
      const events: any[] = [];
      const subscription = fromEvent(mockTarget, 'click').subscribe({
        next: (event) => events.push(event),
      });

      mockTarget.dispatchEvent('click', { type: 'click', x: 10 });
      subscription.unsubscribe();
      mockTarget.dispatchEvent('click', { type: 'click', x: 20 });

      expect(events).toHaveLength(1);
      expect(events[0].x).toBe(10);
    });

    it('should handle multiple subscribers independently', () => {
      const events1: any[] = [];
      const events2: any[] = [];

      const sub1 = fromEvent(mockTarget, 'click').subscribe({
        next: (event) => events1.push(event),
      });
      const sub2 = fromEvent(mockTarget, 'click').subscribe({
        next: (event) => events2.push(event),
      });

      mockTarget.dispatchEvent('click', { type: 'click', x: 10 });
      sub1.unsubscribe();
      mockTarget.dispatchEvent('click', { type: 'click', x: 20 });

      expect(events1).toHaveLength(1);
      expect(events2).toHaveLength(2);
    });

    it('should work with different event types', () => {
      const keyEvents: any[] = [];
      const mouseEvents: any[] = [];

      fromEvent(mockTarget, 'keydown').subscribe({
        next: (event) => keyEvents.push(event),
      });
      fromEvent(mockTarget, 'mousemove').subscribe({
        next: (event) => mouseEvents.push(event),
      });

      mockTarget.dispatchEvent('keydown', { type: 'keydown', key: 'a' });
      mockTarget.dispatchEvent('mousemove', { type: 'mousemove', x: 100 });

      expect(keyEvents).toHaveLength(1);
      expect(mouseEvents).toHaveLength(1);
      expect(keyEvents[0].key).toBe('a');
      expect(mouseEvents[0].x).toBe(100);
    });

    it('should not complete (runs indefinitely until unsubscribed)', () => {
      const complete = vi.fn();
      const subscription = fromEvent(mockTarget, 'click').subscribe({
        complete,
      });

      mockTarget.dispatchEvent('click', { type: 'click' });
      mockTarget.dispatchEvent('click', { type: 'click' });

      expect(complete).not.toHaveBeenCalled();
      subscription.unsubscribe();
      expect(complete).not.toHaveBeenCalled(); // Still shouldn't complete
    });
  });

  describe('Integration - Combining creation functions', () => {
    it('should allow chaining subscriptions', () => {
      const values: number[] = [];

      of(1).subscribe({
        next: (v1) => {
          values.push(v1);
          from([2, 3]).subscribe({
            next: (v2) => values.push(v2),
          });
        },
      });

      expect(values).toEqual([1, 2, 3]);
    });

    it('should work independently', () => {
      const results: string[] = [];

      of('a').subscribe({ next: (v) => results.push(`of:${v}`) });
      from(['b']).subscribe({ next: (v) => results.push(`from:${v}`) });

      expect(results).toEqual(['of:a', 'from:b']);
    });
  });
});
