import { describe, it, expect, vi } from 'vitest';
import { Observable } from '../src/core/Observable';
import { of } from '../src/observable/of';
import { concat } from '../src/observable/concat';
import { concatWith } from '../src/operators/concatWith';
import { concatAll } from '../src/operators/concatAll';

describe('Step 10: Concat Operators', () => {
  describe('concat()', () => {
    it('should concat two observables sequentially', () => {
      const results: any[] = [];

      const a$ = of(1, 2, 3);
      const b$ = of('a', 'b', 'c');

      concat(a$, b$).subscribe({
        next: (v) => results.push(v),
      });

      // Should contain all values in order
      expect(results).toEqual([1, 2, 3, 'a', 'b', 'c']);
    });

    it('should maintain strict order (no interleaving)', () => {
      const results: number[] = [];
      const emissions: string[] = [];

      const a$ = new Observable<number>((subscriber) => {
        emissions.push('a1');
        subscriber.next(1);
        emissions.push('a2');
        subscriber.next(2);
        subscriber.complete();
      });

      const b$ = new Observable<number>((subscriber) => {
        emissions.push('b1');
        subscriber.next(3);
        emissions.push('b2');
        subscriber.next(4);
        subscriber.complete();
      });

      concat(a$, b$).subscribe({
        next: (v) => results.push(v),
      });

      // a$ must complete before b$ starts
      expect(emissions).toEqual(['a1', 'a2', 'b1', 'b2']);
      expect(results).toEqual([1, 2, 3, 4]);
    });

    it('should complete only when all observables complete', () => {
      let completed = false;

      const a$ = of(1, 2, 3);
      const b$ = of('a', 'b', 'c');

      concat(a$, b$).subscribe({
        complete: () => {
          completed = true;
        },
      });

      expect(completed).toBe(true);
    });

    it('should concat three observables', () => {
      const results: any[] = [];

      const a$ = of(1, 2);
      const b$ = of('a', 'b');
      const c$ = of(true, false);

      concat(a$, b$, c$).subscribe({
        next: (v) => results.push(v),
      });

      expect(results).toEqual([1, 2, 'a', 'b', true, false]);
    });

    it('should handle single observable', () => {
      const results: number[] = [];

      concat(of(1, 2, 3)).subscribe({
        next: (v) => results.push(v),
      });

      expect(results).toEqual([1, 2, 3]);
    });

    it('should handle empty array of observables', () => {
      const results: any[] = [];
      let completed = false;

      concat().subscribe({
        next: (v) => results.push(v),
        complete: () => {
          completed = true;
        },
      });

      expect(results).toEqual([]);
      expect(completed).toBe(true);
    });

    it('should propagate errors and stop sequence', () => {
      const results: any[] = [];
      let errorReceived: any;

      const error$ = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.error(new Error('Test error'));
      });

      const other$ = of(2, 3, 4);

      concat(error$, other$).subscribe({
        next: (v) => results.push(v),
        error: (err) => {
          errorReceived = err;
        },
      });

      expect(results).toEqual([1]);
      expect(errorReceived).toBeInstanceOf(Error);
      expect(errorReceived.message).toBe('Test error');
    });

    it('should not subscribe to next observable if previous errors', () => {
      const secondSubscribed = vi.fn();

      const error$ = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.error(new Error('Test error'));
      });

      const other$ = new Observable((subscriber) => {
        secondSubscribed();
        subscriber.next(2);
        subscriber.complete();
      });

      concat(error$, other$).subscribe({
        error: () => {},
      });

      // Second observable should never be subscribed to
      expect(secondSubscribed).not.toHaveBeenCalled();
    });

    it('should unsubscribe from current observable when unsubscribed', () => {
      const unsubscribeFn = vi.fn();

      const obs$ = new Observable((subscriber) => {
        subscriber.next(1);
        return unsubscribeFn;
      });

      const subscription = concat(obs$, of(2, 3)).subscribe({});
      subscription.unsubscribe();

      expect(unsubscribeFn).toHaveBeenCalled();
    });

    it('should handle empty observables', () => {
      const results: any[] = [];
      let completed = false;

      const empty1$ = new Observable((subscriber) => subscriber.complete());
      const empty2$ = new Observable((subscriber) => subscriber.complete());

      concat(empty1$, empty2$).subscribe({
        next: (v) => results.push(v),
        complete: () => {
          completed = true;
        },
      });

      expect(results).toEqual([]);
      expect(completed).toBe(true);
    });

    it('should wait for async observables to complete', (done) => {
      const results: string[] = [];

      const fast$ = of('fast');
      const slow$ = new Observable<string>((subscriber) => {
        setTimeout(() => {
          subscriber.next('slow');
          subscriber.complete();
        }, 10);
      });

      concat(fast$, slow$).subscribe({
        next: (v) => results.push(v),
        complete: () => {
          expect(results).toEqual(['fast', 'slow']);
          done();
        },
      });

      // Fast completes but slow should wait
      expect(results).toEqual(['fast']);
    });
  });

  describe('concatWith()', () => {
    it('should concat source with other observables', () => {
      const results: any[] = [];

      const source$ = of(1, 2, 3);
      const other$ = of('a', 'b', 'c');

      source$.pipe(concatWith(other$)).subscribe({
        next: (v) => results.push(v),
      });

      expect(results).toEqual([1, 2, 3, 'a', 'b', 'c']);
    });

    it('should concat with multiple observables', () => {
      const results: any[] = [];

      of(1, 2)
        .pipe(concatWith(of('a', 'b'), of(true, false)))
        .subscribe({
          next: (v) => results.push(v),
        });

      expect(results).toEqual([1, 2, 'a', 'b', true, false]);
    });

    it('should maintain sequential order', () => {
      const results: number[] = [];

      of(1, 2)
        .pipe(concatWith(of(3, 4), of(5, 6)))
        .subscribe({
          next: (v) => results.push(v),
        });

      expect(results).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should complete when all complete', () => {
      let completed = false;

      of(1, 2, 3)
        .pipe(concatWith(of('a', 'b', 'c')))
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
        .pipe(concatWith(error$))
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
        .pipe(concatWith())
        .subscribe({
          next: (v) => results.push(v),
        });

      expect(results).toEqual([1, 2, 3]);
    });
  });

  describe('concatAll()', () => {
    it('should flatten higher-order observable sequentially', () => {
      const results: any[] = [];

      const outer$ = of(of(1, 2, 3), of('a', 'b', 'c'));

      outer$.pipe(concatAll()).subscribe({
        next: (v) => results.push(v),
      });

      expect(results).toEqual([1, 2, 3, 'a', 'b', 'c']);
    });

    it('should subscribe to inner observables sequentially', () => {
      const subscriptions: string[] = [];
      const results: number[] = [];

      const inner1$ = new Observable<number>((subscriber) => {
        subscriptions.push('inner1-start');
        subscriber.next(1);
        subscriber.next(2);
        subscriber.complete();
        subscriptions.push('inner1-complete');
      });

      const inner2$ = new Observable<number>((subscriber) => {
        subscriptions.push('inner2-start');
        subscriber.next(3);
        subscriber.next(4);
        subscriber.complete();
        subscriptions.push('inner2-complete');
      });

      const outer$ = of(inner1$, inner2$);

      outer$.pipe(concatAll()).subscribe({
        next: (v) => results.push(v),
      });

      // inner2 should not start until inner1 completes
      expect(subscriptions).toEqual([
        'inner1-start',
        'inner1-complete',
        'inner2-start',
        'inner2-complete',
      ]);
      expect(results).toEqual([1, 2, 3, 4]);
    });

    it('should complete when outer and all inners complete', () => {
      let completed = false;

      const outer$ = of(of(1, 2), of(3, 4));

      outer$.pipe(concatAll()).subscribe({
        complete: () => {
          completed = true;
        },
      });

      expect(completed).toBe(true);
    });

    it('should queue inner observables and process sequentially', (done) => {
      const results: string[] = [];
      const timings: string[] = [];

      const fast$ = new Observable<string>((subscriber) => {
        timings.push('fast-start');
        subscriber.next('fast');
        subscriber.complete();
        timings.push('fast-complete');
      });

      const slow$ = new Observable<string>((subscriber) => {
        timings.push('slow-start');
        setTimeout(() => {
          subscriber.next('slow');
          subscriber.complete();
          timings.push('slow-complete');
        }, 10);
      });

      const outer$ = of(fast$, slow$);

      outer$.pipe(concatAll()).subscribe({
        next: (v) => results.push(v),
        complete: () => {
          expect(results).toEqual(['fast', 'slow']);
          expect(timings).toEqual([
            'fast-start',
            'fast-complete',
            'slow-start',
            'slow-complete',
          ]);
          done();
        },
      });
    });

    it('should propagate errors from inner observables', () => {
      const results: any[] = [];
      let errorReceived: any;

      const error$ = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.error(new Error('Inner error'));
      });

      const outer$ = of(of(0), error$, of(2));

      outer$.pipe(concatAll()).subscribe({
        next: (v) => results.push(v),
        error: (err) => {
          errorReceived = err;
        },
      });

      // Should emit from first, then error from second
      expect(results).toEqual([0, 1]);
      expect(errorReceived).toBeInstanceOf(Error);
      expect(errorReceived.message).toBe('Inner error');
    });

    it('should propagate errors from outer observable', () => {
      let errorReceived: any;

      const outer$ = new Observable<Observable<number>>((subscriber) => {
        subscriber.next(of(1, 2));
        subscriber.error(new Error('Outer error'));
      });

      outer$.pipe(concatAll()).subscribe({
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

      outer$.pipe(concatAll()).subscribe({
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

      outer$.pipe(concatAll()).subscribe({
        next: (v) => results.push(v),
        complete: () => {
          completed = true;
        },
      });

      expect(results).toEqual([]);
      expect(completed).toBe(true);
    });

    it('should unsubscribe from current inner observable', () => {
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

      const subscription = outer$.pipe(concatAll()).subscribe({});
      subscription.unsubscribe();

      // Should unsubscribe from first (currently active)
      expect(unsubscribe1).toHaveBeenCalled();
      // Second was never subscribed to
      expect(unsubscribe2).not.toHaveBeenCalled();
    });

    it('should handle three levels of nesting', () => {
      const results: number[] = [];

      const inner$ = of(1, 2);
      const middle$ = of(inner$, inner$);
      const outer$ = of(middle$);

      outer$.pipe(concatAll(), concatAll()).subscribe({
        next: (v) => results.push(v),
      });

      // Sequential flattening: first inner completes, then second inner
      expect(results).toEqual([1, 2, 1, 2]);
    });
  });

  describe('Integration: Combining concat operators', () => {
    it('should work with map to create sequential requests', () => {
      const results: string[] = [];
      const order: string[] = [];

      const ids = of(1, 2, 3);

      // Simulate fetching data for each id
      const fetchData = (id: number) =>
        new Observable<string>((subscriber) => {
          order.push(`fetch-${id}`);
          subscriber.next(`data-${id}`);
          subscriber.complete();
        });

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
          concatAll()
        )
        .subscribe({
          next: (v) => results.push(v),
        });

      // Should fetch sequentially: 1, then 2, then 3
      expect(order).toEqual(['fetch-1', 'fetch-2', 'fetch-3']);
      expect(results).toEqual(['data-1', 'data-2', 'data-3']);
    });

    it('should concat results from multiple sources sequentially', () => {
      const results: any[] = [];

      const numbers$ = of(1, 2, 3);
      const letters$ = of('a', 'b', 'c');
      const booleans$ = of(true, false);

      concat(numbers$, letters$, booleans$).subscribe({
        next: (v) => results.push(v),
      });

      expect(results).toEqual([1, 2, 3, 'a', 'b', 'c', true, false]);
    });
  });
});
