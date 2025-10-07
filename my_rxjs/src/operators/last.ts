import { Observable } from "../core/Observable";
import { OperatorFunction } from "../core/pipe";

/**
 * last() - Emit only the last value, then complete
 *
 * Waits for the source to complete, then emits only the last value.
 * This requires buffering the most recent value until completion.
 *
 * If the source completes without emitting any values, last() will
 * complete without emitting (in real RxJS, it can error or use a default).
 *
 * Marble diagram:
 * source:  --1--2--3--4--5--|
 * last()
 * result:  ----------------5|
 *
 * Usage:
 * of(1, 2, 3, 4, 5).pipe(
 *   last()
 * ).subscribe(console.log);
 * // Output: 5 (when source completes)
 */

/**
 * TODO: Implement the last() operator
 *
 * @returns An OperatorFunction that emits only the last value
 *
 * Implementation guide:
 * 1. Return an OperatorFunction (standard pattern)
 * 2. Inside, return a new Observable
 * 3. Create a variable to store the last seen value
 * 4. Create a flag to track if any value was seen
 * 5. Subscribe to the source Observable
 * 6. In the next handler:
 *    a. Store the value (overwriting previous)
 *    b. Mark that we've seen a value
 *    c. Do NOT emit yet (wait for completion)
 * 7. In the complete handler:
 *    a. If we saw at least one value, emit the last stored value
 *    b. Then complete
 * 8. Forward error notifications
 * 9. Return the subscription for cleanup
 *
 * Key points:
 * - This is a STATEFUL operator (buffers last value)
 * - Does NOT complete early (must wait for source to complete)
 * - Only emits when source completes
 * - If source never completes, last() never emits
 * - Needs to buffer exactly one value (the most recent)
 *
 * Pattern:
 * export function last<T>(): OperatorFunction<T, T> {
 *   return (source: Observable<T>) => {
 *     return new Observable<T>(subscriber => {
 *       let lastValue: T;
 *       let hasValue = false;
 *
 *       return source.subscribe({
 *         next: value => {
 *           lastValue = value;
 *           hasValue = true;
 *         },
 *         error: err => subscriber.error(err),
 *         complete: () => {
 *           if (hasValue) {
 *             subscriber.next(lastValue);
 *           }
 *           subscriber.complete();
 *         }
 *       }).unsubscribe;
 *     });
 *   };
 * }
 */

export function last<T>(): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable((s) => {
      let val: T;
      let hasValue = false;
      return source.subscribe({
        next: (v) => {
          val = v;
          hasValue = true;
        },
        error: (e) => s.error(e),
        complete: () => {
          if (hasValue) s.next(val);
          s.complete();
        },
      }).unsubscribe;
    });
}
