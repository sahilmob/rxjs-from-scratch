import { Observable } from "../core/Observable";
import { OperatorFunction } from "../core/pipe";

/**
 * distinct() - Emit only unique values (no duplicates across entire stream)
 *
 * Tracks all values seen so far and only emits a value if it hasn't been
 * emitted before. This requires keeping a Set of all seen values in memory.
 *
 * Different from distinctUntilChanged which only checks the previous value.
 *
 * Marble diagram:
 * source:  --1--2--1--3--2--4--3--|
 * distinct()
 * result:  --1--2-----3-----4-----|
 *
 * Usage:
 * of(1, 2, 1, 3, 2, 4, 3).pipe(
 *   distinct()
 * ).subscribe(console.log);
 * // Output: 1, 2, 3, 4 (duplicates removed)
 */

/**
 * TODO: Implement the distinct() operator
 *
 * @param keySelector - Optional function to extract comparison key from value
 * @returns An OperatorFunction that emits only unique values
 *
 * Implementation guide:
 * 1. Return an OperatorFunction (standard pattern)
 * 2. Inside, return a new Observable
 * 3. Create a Set to track all values seen so far
 * 4. Subscribe to the source Observable
 * 5. In the next handler:
 *    a. If keySelector provided, extract key from value
 *    b. Check if value/key exists in Set
 *    c. If not seen before:
 *       - Add to Set
 *       - Emit the value
 *    d. If already seen, don't emit (skip it)
 * 6. Forward error and complete notifications
 * 7. Return the subscription for cleanup
 *
 * Key points:
 * - This is a STATEFUL operator (tracks all seen values)
 * - Memory grows over time (keeps Set of all unique values)
 * - Uses Set for O(1) lookup performance
 * - Optional keySelector for custom comparison
 * - Does NOT complete early (emits until source completes)
 *
 * Pattern:
 * export function distinct<T, K>(
 *   keySelector?: (value: T) => K
 * ): OperatorFunction<T, T> {
 *   return (source: Observable<T>) => {
 *     return new Observable<T>(subscriber => {
 *       const seen = new Set<K | T>();
 *
 *       return source.subscribe({
 *         next: value => {
 *           const key = keySelector ? keySelector(value) : value;
 *
 *           if (!seen.has(key)) {
 *             seen.add(key);
 *             subscriber.next(value);
 *           }
 *           // If already seen, do nothing (skip)
 *         },
 *         error: err => subscriber.error(err),
 *         complete: () => subscriber.complete()
 *       }).unsubscribe;
 *     });
 *   };
 * }
 */

/**
 * Common use cases for distinct:
 * - Remove duplicate IDs from a stream
 * - Unique user actions
 * - Deduplicate search results
 * - Unique values from sensor readings
 *
 * Examples:
 * // Basic distinct
 * of(1, 2, 1, 3, 2, 4, 3).pipe(distinct())
 * // => 1, 2, 3, 4
 *
 * // Distinct with objects (using keySelector)
 * of(
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' },
 *   { id: 1, name: 'Alice Again' }  // Same id
 * ).pipe(
 *   distinct(user => user.id)
 * )
 * // => { id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }
 *
 * // Distinct strings (case-insensitive)
 * of('apple', 'APPLE', 'banana', 'Apple').pipe(
 *   distinct(s => s.toLowerCase())
 * )
 * // => 'apple', 'banana'
 *
 * // WARNING: Memory considerations
 * // This will keep ALL unique values in memory!
 * interval(1000).pipe(
 *   map(() => Math.floor(Math.random() * 100)),
 *   distinct()
 * )
 * // Memory grows until all 100 numbers are seen
 */

/**
 * Memory Management Note:
 *
 * distinct() keeps a Set of ALL values seen, which can cause memory issues
 * with long-running streams. Consider:
 *
 * 1. Use distinctUntilChanged() if you only care about consecutive duplicates
 * 2. Implement a flush mechanism to clear the Set periodically
 * 3. Use time-windowed distinct (advanced - not in this implementation)
 * 4. Be careful with infinite streams
 */

export function distinct<T, K = T>(
  keySelector?: (value: T) => K
): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable((s) => {
      const seen = new Set();

      return source.subscribe({
        next: (v) => {
          const key = keySelector ? keySelector(v) : v;

          if (!seen.has(key)) {
            seen.add(key);
            s.next(v);
          }
        },
        error: (e) => s.error(e),
        complete: () => s.complete(),
      }).unsubscribe;
    });
}
