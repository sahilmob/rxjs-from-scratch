import { Observable } from "../core/Observable";
import { OperatorFunction } from "../core/pipe";

/**
 * skip() - Skip the first N values, then emit the rest
 *
 * Ignores the first count values from the source, then emits all subsequent values.
 * This is the opposite of take() - while take emits first N, skip ignores first N.
 *
 * Marble diagram:
 * source:  --1--2--3--4--5--6--|
 * skip(3)
 * result:  ---------4--5--6--|
 *
 * Usage:
 * of(1, 2, 3, 4, 5).pipe(
 *   skip(3)
 * ).subscribe(console.log);
 * // Output: 4, 5 (skipped 1, 2, 3)
 */

/**
 * TODO: Implement the skip() operator
 *
 * @param count - The number of values to skip
 * @returns An OperatorFunction that skips the first count values
 *
 * Implementation guide:
 * 1. Return an OperatorFunction (standard pattern)
 * 2. Inside, return a new Observable
 * 3. Create a counter to track how many values have been skipped
 * 4. Subscribe to the source Observable
 * 5. In the next handler:
 *    a. If counter < count, increment counter and don't emit (skip the value)
 *    b. If counter >= count, emit the value
 * 6. Forward error and complete notifications unchanged
 * 7. Return the subscription for cleanup
 *
 * Key points:
 * - This is a STATEFUL operator (tracks skip count)
 * - Does NOT complete early (emits until source completes)
 * - If count is 0 or negative, emit all values (skip nothing)
 * - If source has fewer than count values, emit nothing
 *
 * Pattern:
 * export function skip<T>(count: number): OperatorFunction<T, T> {
 *   return (source: Observable<T>) => {
 *     return new Observable<T>(subscriber => {
 *       let skipped = 0;
 *       return source.subscribe({
 *         next: value => {
 *           if (skipped < count) {
 *             skipped++;
 *           } else {
 *             subscriber.next(value);
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
 * Common use cases for skip:
 * - Skip initial/setup emissions
 * - Ignore first N responses
 * - Skip header rows in data streams
 * - Ignore warm-up values
 *
 * Examples:
 * // Skip first 2 values
 * of(1, 2, 3, 4, 5).pipe(skip(2))
 * // => 3, 4, 5
 *
 * // Skip first 3 clicks
 * fromEvent(button, 'click').pipe(skip(3))
 * // => 4th click and onwards
 *
 * // Combine with take
 * of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).pipe(
 *   skip(2),  // Skip first 2: now 3-10
 *   take(3)   // Take first 3: get 3, 4, 5
 * )
 * // => 3, 4, 5
 */

export function skip<T>(count: number): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable(
      (s) =>
        source.subscribe({
          next: (v) => (count > 0 ? count-- : s.next(v)),
          error: (e) => s.error(e),
          complete: () => s.complete(),
        }).unsubscribe
    );
}
