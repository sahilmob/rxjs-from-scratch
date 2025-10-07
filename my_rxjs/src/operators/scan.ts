import { Observable } from "../core/Observable";
import { OperatorFunction } from "../core/pipe";

/**
 * scan() - Apply an accumulator function over the source Observable
 *
 * Like Array.reduce(), but emits the accumulated value after each source emission.
 * This is useful for maintaining state over time.
 *
 * Think of it as "running total" or "accumulated state":
 * - Array.reduce(): [1,2,3,4,5].reduce((acc, x) => acc + x, 0) => 15 (final only)
 * - scan(): of(1,2,3,4,5).pipe(scan((acc, x) => acc + x, 0)) => emits 1, 3, 6, 10, 15
 *
 * Marble diagram:
 * source:  --1--2--3--4--5--|
 * scan((acc, x) => acc + x, 0)
 * result:  --1--3--6--10-15-|
 *
 * Usage:
 * of(1, 2, 3, 4, 5).pipe(
 *   scan((acc, value) => acc + value, 0)
 * ).subscribe(console.log);
 * // Output: 1, 3, 6, 10, 15
 */

/**
 * TODO: Implement the scan() operator
 *
 * @param accumulator - Function that accumulates values: (acc, value, index) => newAcc
 * @param seed - Initial accumulated value (optional in some implementations, required here for simplicity)
 * @returns An OperatorFunction that emits accumulated values
 *
 * Implementation guide:
 * 1. Return an OperatorFunction (same pattern as map/filter)
 * 2. Inside, return a new Observable
 * 3. Create a variable to hold the accumulated value (initialize with seed)
 * 4. Subscribe to the source Observable
 * 5. In the next handler:
 *    a. Call the accumulator function with (currentAcc, value, index)
 *    b. Store the result as the new accumulated value
 *    c. Emit the new accumulated value
 * 6. Forward error and complete notifications unchanged
 * 7. Return the subscription for cleanup
 *
 * Key points:
 * - Scan is STATEFUL - it maintains the accumulated value across emissions
 * - Emits after EVERY source emission (unlike reduce which only emits on complete)
 * - The accumulator function can throw errors (handle with try-catch)
 * - The seed value is the initial accumulator value
 * - Like map/filter, provides index parameter to accumulator
 *
 * Pattern:
 * export function scan<T, R>(
 *   accumulator: (acc: R, value: T, index: number) => R,
 *   seed: R
 * ): OperatorFunction<T, R> {
 *   return (source: Observable<T>) => {
 *     return new Observable<R>(subscriber => {
 *       let acc = seed;
 *       let index = 0;
 *       return source.subscribe({
 *         next: value => {
 *           try {
 *             acc = accumulator(acc, value, index++);
 *             subscriber.next(acc);
 *           } catch (err) {
 *             subscriber.error(err);
 *           }
 *         },
 *         error: err => subscriber.error(err),
 *         complete: () => subscriber.complete()
 *       }).unsubscribe;
 *     });
 *   };
 * }
 */

/**
 * Common use cases for scan:
 * - Running totals (sum, product, etc.)
 * - Building up collections (arrays, objects)
 * - State management (Redux-like patterns)
 * - Counting occurrences
 * - Finding min/max values over time
 *
 * Examples:
 * // Running sum
 * of(1, 2, 3).pipe(scan((acc, x) => acc + x, 0))
 * // => 1, 3, 6
 *
 * // Building an array
 * of(1, 2, 3).pipe(scan((acc, x) => [...acc, x], []))
 * // => [1], [1,2], [1,2,3]
 *
 * // State management
 * actions$.pipe(scan((state, action) => reducer(state, action), initialState))
 */

export function scan<T, R>(
  accumulator: (acc: R, value: T, index: number) => R,
  seed: R
): OperatorFunction<T, R> {
  return (source: Observable<T>) =>
    new Observable((s) => {
      let idx = 0;
      return source.subscribe({
        next: (v) => {
          try {
            seed = accumulator(seed, v, idx++);
            s.next(seed);
          } catch (error) {
            s.error(error);
          }
        },
        error: (e) => s.error(e),
        complete: () => s.complete(),
      }).unsubscribe;
    });
}
