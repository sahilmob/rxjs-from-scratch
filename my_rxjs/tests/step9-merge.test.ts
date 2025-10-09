import { describe, it, expect, vi } from 'vitest';
import { Observable } from '../src/core/Observable';
import { of } from '../src/observable/of';
import { merge } from '../src/observable/merge';
import { mergeWith } from '../src/operators/mergeWith';
import { mergeAll } from '../src/operators/mergeAll';

describe('Step 9: Merge Operators', () => {
  describe('merge()', () => {
    it('should merge two observables concurrently', () => {
      const results: any[] = [];

      const a$ = of(1, 2, 3);
      const b$ = of('a', 'b', 'c');

      merge(a$, b$).subscribe({
        next: (v) => results.push(v),
      });

      // Should contain all values from both observables
      expect(results).toHaveLength(6);
      expect(results).toContain(1);
      expect(results).toContain(2);
      expect(results).toContain(3);
      expect(results).toContain('a');
      expect(results).toContain('b');
      expect(results).toContain('c');
    });

    it('should complete only when all observables complete', () => {
      const results: string[] = [];
      let completed = false;

      const a$ = of(1, 2, 3);
      const b$ = of('a', 'b', 'c');

      merge(a$, b$).subscribe({
        next: (v) => results.push(String(v)),
        complete: () => {
          completed = true;
        },
      });

      expect(completed).toBe(true);
      expect(results).toHaveLength(6);
    });

    it('should merge three observables', () => {
      const results: any[] = [];

      const a$ = of(1, 2);
      const b$ = of('a', 'b');
      const c$ = of(true, false);

      merge(a$, b$, c$).subscribe({
        next: (v) => results.push(v),
      });

      expect(results).toHaveLength(6);
      expect(results).toContain(1);
      expect(results).toContain('a');
      expect(results).toContain(true);
    });

    it('should handle single observable', () => {
      const results: number[] = [];

      merge(of(1, 2, 3)).subscribe({
        next: (v) => results.push(v),
      });

      expect(results).toEqual([1, 2, 3]);
    });

    it('should handle empty array of observables', () => {
      const results: any[] = [];
      let completed = false;

      merge().subscribe({
        next: (v) => results.push(v),
        complete: () => {
          completed = true;
        },
      });

      expect(results).toEqual([]);
      expect(completed).toBe(true);
    });

    it('should propagate errors from any observable', () => {
      const error$ = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.error(new Error('Test error'));
      });

      const other$ = of(2, 3, 4);

      let errorReceived: any;

      merge(error$, other$).subscribe({
        error: (err) => {
          errorReceived = err;
        },
      });

      expect(errorReceived).toBeInstanceOf(Error);
      expect(errorReceived.message).toBe('Test error');
    });

    it('should stop emitting after error', () => {
      const results: number[] = [];
      let errorReceived: any;

      const error$ = new Observable<number>((subscriber) => {
        subscriber.next(1);
        subscriber.error(new Error('Test error'));
        subscriber.next(2); // Should not emit
      });

      const other$ = of(3, 4);

      merge(error$, other$).subscribe({
        next: (v) => results.push(v),
        error: (err) => {
          errorReceived = err;
        },
      });

      expect(results).toContain(1);
      expect(results).not.toContain(2);
      expect(errorReceived).toBeInstanceOf(Error);
    });

    it('should unsubscribe from all observables when unsubscribed', () => {
      const unsubscribe1 = vi.fn();
      const unsubscribe2 = vi.fn();

      const obs1$ = new Observable((subscriber) => {
        subscriber.next(1);
        return unsubscribe1;
      });

      const obs2$ = new Observable((subscriber) => {
        subscriber.next(2);
        return unsubscribe2;
      });

      const subscription = merge(obs1$, obs2$).subscribe({});
      subscription.unsubscribe();

      expect(unsubscribe1).toHaveBeenCalled();
      expect(unsubscribe2).toHaveBeenCalled();
    });

    it('should handle observables that complete at different times', () => {
      const results: string[] = [];
      let completed = false;

      const fast$ = of('fast');
      const slow$ = new Observable<string>((subscriber) => {
        setTimeout(() => {
          subscriber.next('slow');
          subscriber.complete();
        }, 10);
      });

      merge(fast$, slow$).subscribe({
        next: (v) => results.push(v),
        complete: () => {
          completed = true;
        },
      });

      // Fast completes immediately
      expect(results).toContain('fast');

      // Wait for slow to complete
      setTimeout(() => {
        expect(results).toContain('slow');
        expect(completed).toBe(true);
      }, 20);
    });

    it('should handle empty observables', () => {
      const results: any[] = [];
      let completed = false;

      const empty1$ = new Observable((subscriber) => subscriber.complete());
      const empty2$ = new Observable((subscriber) => subscriber.complete());

      merge(empty1$, empty2$).subscribe({
        next: (v) => results.push(v),
        complete: () => {
          completed = true;
        },
      });

      expect(results).toEqual([]);
      expect(completed).toBe(true);
    });
  });

  describe('mergeWith()', () => {
    it('should merge source with other observables', () => {
      const results: any[] = [];

      const source$ = of(1, 2, 3);
      const other$ = of('a', 'b', 'c');

      source$.pipe(mergeWith(other$)).subscribe({
        next: (v) => results.push(v),
      });

      expect(results).toHaveLength(6);
      expect(results).toContain(1);
      expect(results).toContain('a');
    });

    it('should merge with multiple observables', () => {
      const results: any[] = [];

      of(1, 2)
        .pipe(mergeWith(of('a', 'b'), of(true, false)))
        .subscribe({
          next: (v) => results.push(v),
        });

      expect(results).toHaveLength(6);
      expect(results).toContain(1);
      expect(results).toContain('a');
      expect(results).toContain(true);
    });

    it('should complete when all complete', () => {
      let completed = false;

      of(1, 2, 3)
        .pipe(mergeWith(of('a', 'b', 'c')))
        .subscribe({
          complete: () => {
            completed = true;
          },
        });

      expect(completed).toBe(true);
    });

    it('should propagate errors', () => {
      let errorReceived: any;

      const error$ = new Observable((subscriber) => {
        subscriber.error(new Error('Test error'));
      });

      of(1, 2, 3)
        .pipe(mergeWith(error$))
        .subscribe({
          error: (err) => {
            errorReceived = err;
          },
        });

      expect(errorReceived).toBeInstanceOf(Error);
    });

    it('should work with no additional observables', () => {
      const results: number[] = [];

      of(1, 2, 3)
        .pipe(mergeWith())
        .subscribe({
          next: (v) => results.push(v),
        });

      expect(results).toEqual([1, 2, 3]);
    });
  });

  describe('mergeAll()', () => {
    it('should flatten higher-order observable', () => {
      const results: any[] = [];

      const outer$ = of(of(1, 2, 3), of('a', 'b', 'c'));

      outer$.pipe(mergeAll()).subscribe({
        next: (v) => results.push(v),
      });

      expect(results).toHaveLength(6);
      expect(results).toContain(1);
      expect(results).toContain('a');
    });

    it('should subscribe to inner observables concurrently', () => {
      const results: number[] = [];
      const subscriptions: string[] = [];

      const inner1$ = new Observable<number>((subscriber) => {
        subscriptions.push('inner1-subscribed');
        subscriber.next(1);
        subscriber.next(2);
        subscriber.complete();
      });

      const inner2$ = new Observable<number>((subscriber) => {
        subscriptions.push('inner2-subscribed');
        subscriber.next(3);
        subscriber.next(4);
        subscriber.complete();
      });

      const outer$ = of(inner1$, inner2$);

      outer$.pipe(mergeAll()).subscribe({
        next: (v) => results.push(v),
      });

      // Both inner observables should be subscribed to
      expect(subscriptions).toContain('inner1-subscribed');
      expect(subscriptions).toContain('inner2-subscribed');
      expect(results).toHaveLength(4);
    });

    it('should complete when outer and all inners complete', () => {
      let completed = false;

      const outer$ = of(of(1, 2), of(3, 4));

      outer$.pipe(mergeAll()).subscribe({
        complete: () => {
          completed = true;
        },
      });

      expect(completed).toBe(true);
    });

    it('should not complete until all inners complete', () => {
      const results: string[] = [];
      let completed = false;

      const fast$ = of('fast');
      const slow$ = new Observable<string>((subscriber) => {
        setTimeout(() => {
          subscriber.next('slow');
          subscriber.complete();
        }, 10);
      });

      const outer$ = of(fast$, slow$);

      outer$.pipe(mergeAll()).subscribe({
        next: (v) => results.push(v),
        complete: () => {
          completed = true;
        },
      });

      // Fast completes but overall should not complete yet
      expect(results).toContain('fast');
      expect(completed).toBe(false);

      setTimeout(() => {
        expect(results).toContain('slow');
        expect(completed).toBe(true);
      }, 20);
    });

    it('should propagate errors from inner observables', () => {
      let errorReceived: any;

      const error$ = new Observable((subscriber) => {
        subscriber.error(new Error('Inner error'));
      });

      const outer$ = of(of(1, 2), error$);

      outer$.pipe(mergeAll()).subscribe({
        error: (err) => {
          errorReceived = err;
        },
      });

      expect(errorReceived).toBeInstanceOf(Error);
      expect(errorReceived.message).toBe('Inner error');
    });

    it('should propagate errors from outer observable', () => {
      let errorReceived: any;

      const outer$ = new Observable<Observable<number>>((subscriber) => {
        subscriber.next(of(1, 2));
        subscriber.error(new Error('Outer error'));
      });

      outer$.pipe(mergeAll()).subscribe({
        error: (err) => {
          errorReceived = err;
        },
      });

      expect(errorReceived).toBeInstanceOf(Error);
      expect(errorReceived.message).toBe('Outer error');
    });

    it('should handle empty outer observable', () => {
      const results: any[] = [];
      let completed = false;

      const outer$ = new Observable<Observable<number>>((subscriber) => {
        subscriber.complete();
      });

      outer$.pipe(mergeAll()).subscribe({
        next: (v) => results.push(v),
        complete: () => {
          completed = true;
        },
      });

      expect(results).toEqual([]);
      expect(completed).toBe(true);
    });

    it('should handle empty inner observables', () => {
      const results: any[] = [];
      let completed = false;

      const empty1$ = new Observable((subscriber) => subscriber.complete());
      const empty2$ = new Observable((subscriber) => subscriber.complete());

      const outer$ = of(empty1$, empty2$);

      outer$.pipe(mergeAll()).subscribe({
        next: (v) => results.push(v),
        complete: () => {
          completed = true;
        },
      });

      expect(results).toEqual([]);
      expect(completed).toBe(true);
    });

    it('should unsubscribe from all inner observables', () => {
      const unsubscribe1 = vi.fn();
      const unsubscribe2 = vi.fn();

      const inner1$ = new Observable((subscriber) => {
        subscriber.next(1);
        return unsubscribe1;
      });

      const inner2$ = new Observable((subscriber) => {
        subscriber.next(2);
        return unsubscribe2;
      });

      const outer$ = of(inner1$, inner2$);

      const subscription = outer$.pipe(mergeAll()).subscribe({});
      subscription.unsubscribe();

      expect(unsubscribe1).toHaveBeenCalled();
      expect(unsubscribe2).toHaveBeenCalled();
    });

    it('should handle three levels of nesting', () => {
      const results: number[] = [];

      const inner$ = of(1, 2);
      const middle$ = of(inner$, inner$);
      const outer$ = of(middle$);

      outer$.pipe(mergeAll(), mergeAll()).subscribe({
        next: (v) => results.push(v),
      });

      // Two inner observables, each emitting 1, 2
      expect(results).toEqual([1, 2, 1, 2]);
    });
  });

  describe('Integration: Combining merge operators', () => {
    it('should work with map to create concurrent requests', () => {
      const results: string[] = [];

      const ids = of(1, 2, 3);

      // Simulate fetching data for each id
      const fetchData = (id: number) =>
        of(`data-${id}`);

      ids
        .pipe(
          (source) =>
            new Observable((subscriber) => {
              return source.subscribe({
                next: (id) => subscriber.next(fetchData(id)),
                error: (err) => subscriber.error(err),
                complete: () => subscriber.complete(),
              });
            }),
          mergeAll()
        )
        .subscribe({
          next: (v) => results.push(v),
        });

      expect(results).toHaveLength(3);
      expect(results).toContain('data-1');
      expect(results).toContain('data-2');
      expect(results).toContain('data-3');
    });

    it('should merge results from multiple sources', () => {
      const results: any[] = [];

      const numbers$ = of(1, 2, 3);
      const letters$ = of('a', 'b', 'c');
      const booleans$ = of(true, false);

      merge(numbers$, letters$, booleans$).subscribe({
        next: (v) => results.push(v),
      });

      expect(results).toHaveLength(8);
      expect(results.filter((v) => typeof v === 'number')).toHaveLength(3);
      expect(results.filter((v) => typeof v === 'string')).toHaveLength(3);
      expect(results.filter((v) => typeof v === 'boolean')).toHaveLength(2);
    });
  });
});
