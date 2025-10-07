import { Observable } from "../core/Observable";
import { OperatorFunction } from "../core/pipe";

/**
 * first() - Emit only the first value, then complete
 *
 * Emits the first value from the source and immediately completes.
 * Essentially equivalent to take(1).
 *
 * If the source completes without emitting any values, first() will error
 * (in real RxJS - for simplicity, we can just complete).
 *
 * Marble diagram:
 * source:  --1--2--3--4--5--|
 * first()
 * result:  --1|
 *
 * Usage:
 * of(1, 2, 3, 4, 5).pipe(
 *   first()
 * ).subscribe(console.log);
 * // Output: 1 (then completes)
 */

/**
 * TODO: Implement the first() operator
 *
 * @returns An OperatorFunction that emits only the first value
 *
 * Implementation guide:
 * 1. Return an OperatorFunction (standard pattern)
 * 2. Inside, return a new Observable
 * 3. Create a flag to track if we've emitted (or just use a counter)
 * 4. Subscribe to the source Observable
 * 5. In the next handler:
 *    a. If haven't emitted yet, emit the value
 *    b. Complete immediately after emitting
 *    c. The subscription will be cleaned up automatically
 * 6. Forward error notifications
 * 7. Complete handler: forward completion (if no value was emitted)
 * 8. Return the subscription for cleanup
 *
 * Key points:
 * - This is a STATEFUL operator (tracks if emitted)
 * - Completes EARLY after first emission
 * - Essentially same as take(1)
 * - Common use case: get first event, first response, etc.
 *
 * Pattern:
 * export function first<T>(): OperatorFunction<T, T> {
 *   return (source: Observable<T>) => {
 *     return new Observable<T>(subscriber => {
 *       let hasEmitted = false;
 *       return source.subscribe({
 *         next: value => {
 *           if (!hasEmitted) {
 *             hasEmitted = true;
 *             subscriber.next(value);
 *             subscriber.complete();
 *           }
 *         },
 *         error: err => subscriber.error(err),
 *         complete: () => {
 *           if (!hasEmitted) {
 *             subscriber.complete();
 *           }
 *         }
 *       }).unsubscribe;
 *     });
 *   };
 * }
 */

export function first<T>(): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable((s) => {
      return source.subscribe({
        next: (v) => {
          s.next(v);
          s.complete();
        },
        error: (e) => s.error(e),
        complete: () => {
          s.complete();
        },
      }).unsubscribe;
    });
}
