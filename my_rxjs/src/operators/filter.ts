import { Observable } from "../core/Observable";
import { OperatorFunction } from "../core/pipe";

/**
 * filter() - Emit only values that pass a predicate test
 *
 * Filter items emitted by the source Observable by only emitting those that
 * satisfy a specified predicate function.
 *
 * Think of it like Array.filter() but for Observables:
 * [1, 2, 3, 4, 5].filter(x => x > 2) => [3, 4, 5]
 * of(1, 2, 3, 4, 5).pipe(filter(x => x > 2)) => emits 3, 4, 5
 *
 * Marble diagram:
 * source:  --1--2--3--4--5--|
 * filter(x => x > 2)
 * result:  -----3--4--5--|
 *
 * Usage:
 * of(1, 2, 3, 4, 5).pipe(
 *   filter(x => x % 2 === 0)
 * ).subscribe(console.log);
 * // Output: 2, 4
 */

/**
 * TODO: Implement the filter() operator
 *
 * @param predicate - A function to test each value. Returns true to keep, false to filter out.
 * @returns An OperatorFunction that emits only values that pass the predicate
 *
 * Implementation guide:
 * 1. Return an OperatorFunction (same pattern as map)
 * 2. Inside, return a new Observable
 * 3. Subscribe to the source Observable
 * 4. In the next handler:
 *    a. Call the predicate function with the value (and index)
 *    b. If predicate returns true, emit the value
 *    c. If predicate returns false, skip the value (don't emit)
 * 5. Forward error and complete notifications unchanged
 * 6. Return the subscription for cleanup
 *
 * Key points:
 * - Very similar to map, but conditionally emits instead of transforming
 * - The predicate may throw errors (handle with try-catch)
 * - Values that don't pass the predicate are simply not emitted
 * - The output type is the same as input type (T => T, not T => R)
 * - Like map, the predicate receives both value and index
 *
 * Pattern:
 * export function filter<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, T> {
 *   return (source: Observable<T>) => {
 *     return new Observable<T>(subscriber => {
 *       let index = 0;
 *       return source.subscribe({
 *         next: value => {
 *           try {
 *             if (predicate(value, index++)) {
 *               subscriber.next(value);
 *             }
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
 * BONUS: Like map, the filter predicate also receives an index parameter.
 *
 * Example:
 * of('a', 'b', 'c', 'd').pipe(
 *   filter((value, index) => index % 2 === 0)
 * ).subscribe(console.log);
 * // Output: "a", "c" (indices 0 and 2)
 */

export function filter<T>(
  predicate: (value: T, index: number) => boolean
): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable((s) => {
      let idx = 0;
      return source.subscribe({
        next: (v) => {
          try {
            if (predicate(v, idx++)) {
              s.next(v);
            }
          } catch (err) {
            s.error(err);
          }
        },
        error: (e) => s.error(e),
        complete: () => s.complete(),
      }).unsubscribe;
    });
}
