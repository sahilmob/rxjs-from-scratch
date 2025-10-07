import { Observable } from "../core/Observable";
import { OperatorFunction } from "../core/pipe";

/**
 * take() - Emit only the first N values, then complete
 *
 * Takes the first count values from the source, then completes.
 * This is useful when you only want a limited number of emissions.
 *
 * Marble diagram:
 * source:  --1--2--3--4--5--6--|
 * take(3)
 * result:  --1--2--3|
 *
 * Usage:
 * of(1, 2, 3, 4, 5).pipe(
 *   take(3)
 * ).subscribe(console.log);
 * // Output: 1, 2, 3 (then completes)
 */

/**
 * TODO: Implement the take() operator
 *
 * @param count - The maximum number of values to emit
 * @returns An OperatorFunction that emits only the first count values
 *
 * Implementation guide:
 * 1. Return an OperatorFunction (standard pattern)
 * 2. Inside, return a new Observable
 * 3. Create a counter to track how many values have been emitted
 * 4. Subscribe to the source Observable
 * 5. In the next handler:
 *    a. If counter < count, emit the value and increment counter
 *    b. If counter reaches count after emitting, complete immediately
 *    c. If counter >= count, do nothing (shouldn't happen if we complete properly)
 * 6. Forward error notifications
 * 7. Complete handler: forward completion if source completes before count reached
 * 8. Return the subscription for cleanup
 *
 * Key points:
 * - This is a STATEFUL operator (tracks count)
 * - Completes EARLY (before source completes)
 * - After emitting N values, complete and unsubscribe from source
 * - If count is 0 or negative, complete immediately without emitting
 * - If source has fewer than count values, emit all and complete when source completes
 *
 * Pattern:
 * export function take<T>(count: number): OperatorFunction<T, T> {
 *   return (source: Observable<T>) => {
 *     return new Observable<T>(subscriber => {
 *       if (count <= 0) {
 *         subscriber.complete();
 *         return;
 *       }
 *
 *       let seen = 0;
 *       return source.subscribe({
 *         next: value => {
 *           if (seen < count) {
 *             subscriber.next(value);
 *             seen++;
 *             if (seen >= count) {
 *               subscriber.complete();
 *             }
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
 * Common use cases for take:
 * - Get first N items from a stream
 * - Limit API calls or event handlers
 * - Sample initial values
 * - Take first response in race conditions
 *
 * Examples:
 * // Take first 3 values
 * of(1, 2, 3, 4, 5).pipe(take(3))
 * // => 1, 2, 3
 *
 * // Take first click
 * fromEvent(button, 'click').pipe(take(1))
 * // => First click only, then completes
 *
 * // Take first 5 interval emissions
 * interval(1000).pipe(take(5))
 * // => 0, 1, 2, 3, 4 (then stops)
 */

export function take<T>(count: number): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable(
      (s) =>
        source.subscribe({
          next: (v) => {
            if (count <= 0) {
              s.complete();
            } else {
              s.next(v);
              count--;
            }
          },
          error: (e) => s.error(e),
          complete: () => s.complete(),
        }).unsubscribe
    );
}
