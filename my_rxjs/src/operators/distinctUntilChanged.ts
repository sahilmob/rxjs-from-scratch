import { Observable } from "../core/Observable";
import { OperatorFunction } from "../core/pipe";

/**
 * distinctUntilChanged() - Emit only when value changes from previous
 *
 * Only emits when the current value is different from the previous value.
 * Filters out consecutive duplicate values.
 *
 * Different from distinct() which checks against all previous values.
 * This only compares with the immediately previous emission.
 *
 * Marble diagram:
 * source:  --1--2--2--3--3--3--4--4--|
 * distinctUntilChanged()
 * result:  --1--2-----3--------4-----|
 *
 * Usage:
 * of(1, 2, 2, 3, 3, 3, 4, 4).pipe(
 *   distinctUntilChanged()
 * ).subscribe(console.log);
 * // Output: 1, 2, 3, 4 (consecutive duplicates removed)
 */

/**
 * TODO: Implement the distinctUntilChanged() operator
 *
 * @param compare - Optional comparison function (returns true if values are equal)
 * @returns An OperatorFunction that emits only when value changes
 *
 * Implementation guide:
 * 1. Return an OperatorFunction (standard pattern)
 * 2. Inside, return a new Observable
 * 3. Create variables to track:
 *    a. The previous value
 *    b. Whether we've seen any value yet (hasValue flag)
 * 4. Subscribe to the source Observable
 * 5. In the next handler:
 *    a. If this is the first value (no previous value):
 *       - Mark hasValue = true
 *       - Store as previous value
 *       - Emit the value
 *    b. If not first value:
 *       - Compare with previous value (using compare function or ===)
 *       - If different:
 *         * Update previous value
 *         * Emit the value
 *       - If same:
 *         * Do nothing (skip)
 * 6. Forward error and complete notifications
 * 7. Return the subscription for cleanup
 *
 * Key points:
 * - This is a STATEFUL operator (tracks previous value)
 * - Only keeps ONE previous value (not all values like distinct)
 * - Memory efficient (constant O(1) memory)
 * - Optional custom compare function
 * - Does NOT complete early
 * - Always emits first value (nothing to compare against)
 *
 * Pattern:
 * export function distinctUntilChanged<T>(
 *   compare?: (prev: T, curr: T) => boolean
 * ): OperatorFunction<T, T> {
 *   return (source: Observable<T>) => {
 *     return new Observable<T>(subscriber => {
 *       let hasValue = false;
 *       let previous: T;
 *
 *       return source.subscribe({
 *         next: value => {
 *           if (!hasValue) {
 *             // First value - always emit
 *             hasValue = true;
 *             previous = value;
 *             subscriber.next(value);
 *           } else {
 *             // Compare with previous
 *             const isEqual = compare ? compare(previous, value) : previous === value;
 *
 *             if (!isEqual) {
 *               previous = value;
 *               subscriber.next(value);
 *             }
 *             // If equal, skip (don't emit)
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
 * Common use cases for distinctUntilChanged:
 * - State management (only update when state actually changes)
 * - Form input debouncing
 * - Filtering sensor data (ignore noise/jitter)
 * - UI updates (only render when data changes)
 * - WebSocket message deduplication
 *
 * Examples:
 * // Basic distinctUntilChanged
 * of(1, 1, 2, 2, 2, 3, 3, 1, 1).pipe(
 *   distinctUntilChanged()
 * )
 * // => 1, 2, 3, 1 (note: last 1 emits because it's different from 3)
 *
 * // With objects (custom compare)
 * of(
 *   { id: 1, count: 5 },
 *   { id: 1, count: 5 },  // Same id
 *   { id: 2, count: 3 },
 *   { id: 2, count: 7 }   // Same id, different count
 * ).pipe(
 *   distinctUntilChanged((prev, curr) => prev.id === curr.id)
 * )
 * // => { id: 1, count: 5 }, { id: 2, count: 3 }
 *
 * // Form input - only emit when value changes
 * inputChanges$.pipe(
 *   map(event => event.target.value),
 *   distinctUntilChanged()
 * )
 * // Only emits when user types something different
 *
 * // State changes - compare by JSON
 * state$.pipe(
 *   distinctUntilChanged((a, b) =>
 *     JSON.stringify(a) === JSON.stringify(b)
 *   )
 * )
 * // Only emits when state object actually changes
 *
 * // Case-insensitive distinct
 * of('apple', 'APPLE', 'apple', 'banana').pipe(
 *   distinctUntilChanged((a, b) =>
 *     a.toLowerCase() === b.toLowerCase()
 *   )
 * )
 * // => 'apple', 'banana'
 */

/**
 * distinct() vs distinctUntilChanged():
 *
 * Input: 1, 2, 1, 3, 2, 4
 *
 * distinct():
 * - Output: 1, 2, 3, 4
 * - Removes ALL duplicates (checks entire history)
 * - Memory: O(n) - grows with unique values
 *
 * distinctUntilChanged():
 * - Output: 1, 2, 1, 3, 2, 4 (no consecutive dupes, so all pass)
 * - Only removes CONSECUTIVE duplicates
 * - Memory: O(1) - only tracks previous value
 *
 * Input: 1, 1, 2, 2, 1, 1
 *
 * distinct():
 * - Output: 1, 2
 *
 * distinctUntilChanged():
 * - Output: 1, 2, 1 (1 appears again because it's different from 2)
 */

export function distinctUntilChanged<T>(
  compare?: (prev: T, curr: T) => boolean
): OperatorFunction<T, T> {
  // TODO: Implement distinctUntilChanged operator
  return (source: Observable<T>) =>
    new Observable((s) => {
      let val: T;
      let hasValue = false;

      return source.subscribe({
        next: (v) => {
          if (!hasValue) {
            // First value - always emit
            hasValue = true;
            val = v;
            s.next(v);
          } else {
            // Compare with previous
            const isEqual = compare ? compare(val, v) : val === v;
            if (!isEqual) {
              val = v;
              s.next(v);
            }
          }
        },
        error: (e) => s.error(e),
        complete: () => s.complete(),
      }).unsubscribe;
    });
}
