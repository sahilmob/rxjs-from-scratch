import { Observable } from "../core/Observable";
import { OperatorFunction } from "../core/pipe";

/**
 * reduce() - Apply an accumulator function and emit only the final result
 *
 * Like Array.reduce() - accumulates values and emits only when the source completes.
 * This is useful when you want the final aggregated result, not intermediate values.
 *
 * Difference from scan:
 * - scan: emits after every source emission (intermediate values)
 * - reduce: emits only once when source completes (final value only)
 *
 * Think of it as:
 * - Array.reduce(): [1,2,3,4,5].reduce((acc, x) => acc + x, 0) => 15
 * - reduce operator: of(1,2,3,4,5).pipe(reduce((acc, x) => acc + x, 0)) => emits 15
 *
 * Marble diagram:
 * source:  --1--2--3--4--5--|
 * reduce((acc, x) => acc + x, 0)
 * result:  ------------------(15|)
 *
 * Usage:
 * of(1, 2, 3, 4, 5).pipe(
 *   reduce((acc, value) => acc + value, 0)
 * ).subscribe(console.log);
 * // Output: 15 (only when complete)
 */

/**
 * TODO: Implement the reduce() operator
 *
 * @param accumulator - Function that accumulates values: (acc, value, index) => newAcc
 * @param seed - Initial accumulated value
 * @returns An OperatorFunction that emits the final accumulated value on completion
 *
 * Implementation guide:
 * 1. Return an OperatorFunction (same pattern)
 * 2. Inside, return a new Observable
 * 3. Create a variable to hold the accumulated value (initialize with seed)
 * 4. Subscribe to the source Observable
 * 5. In the next handler:
 *    a. Call the accumulator function with (currentAcc, value, index)
 *    b. Store the result as the new accumulated value
 *    c. DO NOT emit yet (this is the key difference from scan)
 * 6. In the complete handler:
 *    a. Emit the final accumulated value
 *    b. Then call subscriber.complete()
 * 7. Forward error notifications unchanged
 * 8. Return the subscription for cleanup
 *
 * Key points:
 * - Like scan, this is STATEFUL
 * - Unlike scan, only emits ONCE on completion
 * - If source never completes, reduce never emits
 * - If source completes immediately (empty), still emits the seed value
 * - The accumulator function can throw errors (handle with try-catch)
 *
 * Pattern:
 * export function reduce<T, R>(
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
 *             // Don't emit here!
 *           } catch (err) {
 *             subscriber.error(err);
 *           }
 *         },
 *         error: err => subscriber.error(err),
 *         complete: () => {
 *           subscriber.next(acc);  // Emit final value
 *           subscriber.complete();
 *         }
 *       }).unsubscribe;
 *     });
 *   };
 * }
 */

/**
 * Scan vs Reduce comparison:
 *
 * of(1, 2, 3, 4, 5).pipe(scan((acc, x) => acc + x, 0))
 * // Emits: 1, 3, 6, 10, 15 (and completes)
 *
 * of(1, 2, 3, 4, 5).pipe(reduce((acc, x) => acc + x, 0))
 * // Emits: 15 (only when complete)
 *
 * Common use cases for reduce:
 * - Calculate sum/product/average of all values
 * - Find min/max value
 * - Build final array/object from stream
 * - Count total occurrences
 * - Any aggregation where you only need the final result
 */

export function reduce<T, R>(
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
          } catch (err) {
            s.error(err);
          }
        },
        error: (e) => s.error(e),
        complete: () => {
          s.next(seed);
          s.complete();
        },
      }).unsubscribe;
    });
}
