import { Observable } from "../core/Observable";

/**
 * from() - Convert various types into an Observable
 *
 * Creates an Observable from:
 * - An array
 * - An array-like object
 * - A Promise
 * - An iterable object
 * - An Observable-like object
 *
 * For this step, we'll focus on arrays and iterables.
 *
 * Marble diagram:
 * from([1, 2, 3])
 * ---(1,2,3|)
 *
 * Usage:
 * from([10, 20, 30]).subscribe({
 *   next: (value) => console.log(value),
 *   complete: () => console.log('done')
 * });
 * // Output: 10, 20, 30, "done"
 */

/**
 * TODO: Implement the from() function
 *
 * @param input - An array or iterable to convert to an Observable
 * @returns An Observable that emits items from the input
 *
 * Implementation guide:
 * 1. Return a new Observable
 * 2. In the subscribe function:
 *    a. Check if input is an array (Array.isArray)
 *    b. If array: iterate and emit each value with subscriber.next()
 *    c. If iterable: check for Symbol.iterator and iterate
 *    d. After all values, call subscriber.complete()
 * 3. No teardown logic needed for simple arrays/iterables
 *
 * Key points:
 * - Emits synchronously for arrays and iterables
 * - Completes after emitting all items
 * - Handle the case where subscriber is stopped mid-iteration
 *
 * For now, just support arrays. Bonus: support iterables with Symbol.iterator
 */
export function from<T>(input: ArrayLike<T> | Iterable<T>): Observable<T> {
  const obs = new Observable((s) => {
    if (Array.isArray(input) || Symbol.iterator in Object(input)) {
      for (const value of input as Iterable<T>) {
        if (s.closed) break; // Stop if unsubscribed
        s.next(value);
      }
    }

    if (!s.closed) s.complete();
  });
  return obs;
}
