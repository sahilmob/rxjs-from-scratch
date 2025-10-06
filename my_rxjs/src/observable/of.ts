import { Observable } from '../core/Observable';

/**
 * of() - Create an Observable that emits a sequence of values
 *
 * Creates an Observable that emits the arguments you provide, then completes.
 * This is a synchronous operator - all values are emitted immediately when subscribed.
 *
 * Marble diagram:
 * of(1, 2, 3)
 * ---(1,2,3|)
 *
 * Usage:
 * of(1, 2, 3).subscribe({
 *   next: (value) => console.log(value),
 *   complete: () => console.log('done')
 * });
 * // Output: 1, 2, 3, "done"
 */

/**
 * TODO: Implement the of() function
 *
 * @param values - Values to emit
 * @returns An Observable that emits the provided values synchronously, then completes
 *
 * Implementation guide:
 * 1. Return a new Observable
 * 2. In the subscribe function:
 *    a. Loop through all values and call subscriber.next(value) for each
 *    b. After all values are emitted, call subscriber.complete()
 * 3. No teardown logic needed (synchronous, completes immediately)
 *
 * Key points:
 * - All values are emitted synchronously (immediately)
 * - Completes after emitting all values
 * - If subscriber is closed/stopped during emission, stop emitting
 */
export function of<T>(...values: T[]): Observable<T> {
  // TODO: Implement of()
  throw new Error('Not implemented');
}
