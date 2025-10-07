import { Observable } from "../core/Observable";
import { OperatorFunction } from "../core/pipe";

/**
 * map() - Transform each value emitted by the source Observable
 *
 * Applies a projection function to each value emitted by the source Observable,
 * and emits the resulting values as an Observable.
 *
 * This is one of the most commonly used operators in RxJS.
 *
 * Marble diagram:
 * source:  --1--2--3--|
 * map(x => x * 10)
 * result:  --10-20-30-|
 *
 * Think of it like Array.map() but for Observables:
 * [1, 2, 3].map(x => x * 2) => [2, 4, 6]
 * of(1, 2, 3).pipe(map(x => x * 2)) => emits 2, 4, 6
 *
 * Usage:
 * of(1, 2, 3).pipe(
 *   map(x => x * 10)
 * ).subscribe(console.log);
 * // Output: 10, 20, 30
 */

/**
 * TODO: Implement the map() operator
 *
 * @param project - A function to apply to each value emitted by the source Observable
 * @returns An OperatorFunction that applies the projection to each value
 *
 * Implementation guide:
 * 1. Return an OperatorFunction (a function that takes an Observable and returns an Observable)
 * 2. Inside, return a new Observable
 * 3. Subscribe to the source Observable
 * 4. In the next handler:
 *    a. Apply the project function to the value
 *    b. Emit the transformed value to the destination subscriber
 * 5. Forward error and complete notifications unchanged
 * 6. Return the subscription for cleanup
 *
 * Key points:
 * - The map operator creates a new Observable
 * - Each source value is transformed by the project function
 * - Errors and completion propagate through unchanged
 * - The subscription to source is returned for proper cleanup
 * - Should handle errors thrown by the project function
 *
 * Pattern:
 * export function map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R> {
 *   return (source: Observable<T>) => {
 *     return new Observable<R>(subscriber => {
 *       return source.subscribe({
 *         next: value => {
 *           // Apply project function and emit result
 *         },
 *         error: err => subscriber.error(err),
 *         complete: () => subscriber.complete()
 *       });
 *     });
 *   };
 * }
 */

/**
 * BONUS: The RxJS map operator also provides an index parameter.
 * The index starts at 0 and increments with each emission.
 *
 * Example:
 * of('a', 'b', 'c').pipe(
 *   map((value, index) => `${index}: ${value}`)
 * ).subscribe(console.log);
 * // Output: "0: a", "1: b", "2: c"
 *
 * For the bonus, you'll need to track the index as values arrive.
 */

export function map<T, R>(
  project: (value: T, index: number) => R
): OperatorFunction<T, R> {
  return (source: Observable<T>) =>
    new Observable((s) => {
      let idx = 0;
      return source.subscribe({
        next: (v) => {
          try {
            s.next(project(v, idx++));
          } catch (err) {
            s.error(err);
          }
        },
        error: (e) => s.error(e),
        complete: () => s.complete(),
      }).unsubscribe;
    });
}
