import { Observable } from "../core/Observable";
import { Subscription } from "../core/Subscription";

/**
 * concat() - Creation function that combines observables SEQUENTIALLY
 *
 * CONCEPT:
 * - Subscribes to observables ONE AT A TIME (sequentially)
 * - Waits for previous observable to complete before subscribing to next
 * - Maintains strict order - values from obs1, then obs2, then obs3, etc.
 * - Completes when ALL observables have completed
 * - If ANY observable errors, concat errors and stops
 *
 * EXAMPLE:
 * ```typescript
 * const a$ = of(1, 2, 3);
 * const b$ = of('a', 'b', 'c');
 *
 * concat(a$, b$).subscribe(console.log);
 * // Output (guaranteed order): 1, 2, 3, 'a', 'b', 'c'
 * // b$ doesn't start until a$ completes!
 * ```
 *
 * KEY DIFFERENCE FROM MERGE:
 * - merge: ALL subscriptions start immediately (concurrent)
 * - concat: ONE subscription at a time (sequential)
 *
 * MARBLE DIAGRAM:
 * ```
 * a$:  -1-2-3-|
 * b$:          -a-b-c-|
 * concat(a$, b$): -1-2-3-a-b-c-|
 * ```
 *
 * KEY CONCEPTS:
 * 1. Sequential subscriptions - subscribe one at a time
 * 2. Queue/index tracking - track which observable is current
 * 3. Order preservation - strict FIFO (first in, first out)
 * 4. Error handling - any error stops the sequence
 *
 * IMPLEMENTATION STRATEGY:
 * 1. Create new Observable
 * 2. Track current index (which observable we're on)
 * 3. Subscribe to first observable
 * 4. When it completes:
 *    - Move to next index
 *    - Subscribe to next observable
 *    - Repeat until no more observables
 * 5. Complete when last observable completes
 * 6. Error immediately if any observable errors
 *
 * TODO: Implement concat creation function
 *
 * HINTS:
 * - Use a recursive or loop-based approach to subscribe to next
 * - Track current index: let currentIndex = 0
 * - Create a helper function: subscribeToNext()
 * - When current completes: currentIndex++, subscribeToNext()
 * - Base case: if currentIndex >= observables.length, complete
 *
 * @param observables - Variable number of observables to concat
 * @returns Observable that emits values sequentially
 */
export function concat<T>(...observables: Observable<T>[]): Observable<T> {
  // TODO: Implement concat logic
  //
  // Steps:
  return new Observable((s) => {
    let currentIdx = 0;

    const subscribe = (obs?: Observable<T>) => {
      if (obs === undefined) {
        s.complete();
        return;
      }

      return obs.subscribe({
        next: (v) => s.next(v),
        error: (e) => s.error(e),
        complete: () => {
          subscribe(observables[++currentIdx]);
        },
      });
    };

    const sub = subscribe(observables[currentIdx]);

    return () => sub?.unsubscribe?.();
  });
  // 1. Return new Observable((subscriber) => { ... })
  // 2. Handle empty array edge case
  // 3. Track current index: let currentIndex = 0
  // 4. Track current subscription for cleanup
  // 5. Create helper function: subscribeToNext()
  //    - Check if currentIndex >= observables.length → complete
  //    - Get current observable: observables[currentIndex]
  //    - Subscribe with:
  //        - next: forward to subscriber.next()
  //        - error: forward to subscriber.error()
  //        - complete: currentIndex++, subscribeToNext()
  // 6. Call subscribeToNext() to start
  // 7. Return cleanup that unsubscribes from current subscription
}
