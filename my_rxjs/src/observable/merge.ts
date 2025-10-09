import { Observable } from "../core/Observable";
import { Subscription } from "../core/Subscription";

/**
 * merge() - Creation function that combines multiple observables concurrently
 *
 * CONCEPT:
 * - Subscribes to ALL input observables simultaneously (concurrently)
 * - Emits values from ANY observable as they arrive (interleaved)
 * - Completes only when ALL input observables have completed
 * - If ANY observable errors, the merged observable errors immediately
 *
 * EXAMPLE:
 * ```typescript
 * const a$ = of(1, 2, 3);
 * const b$ = of('a', 'b', 'c');
 *
 * merge(a$, b$).subscribe(console.log);
 * // Output (order may vary): 1, 2, 3, 'a', 'b', 'c'
 * ```
 *
 * KEY CONCEPTS:
 * 1. Concurrent subscriptions - subscribe to all observables at once
 * 2. Multiple active subscriptions - manage array of subscriptions
 * 3. Completion counting - track how many have completed
 * 4. Error handling - any error stops everything
 *
 * IMPLEMENTATION STRATEGY:
 * 1. Create a new Observable
 * 2. Subscribe to each input observable
 * 3. Forward all next() calls to subscriber
 * 4. Track completion count - only complete when ALL complete
 * 5. On error - unsubscribe from all and forward error
 * 6. Return cleanup function that unsubscribes from all
 *
 * TODO: Implement merge creation function
 *
 * HINTS:
 * - Use an array to store all subscriptions
 * - Use a counter to track how many observables have completed
 * - When counter reaches total count, call subscriber.complete()
 * - On error or unsubscribe, clean up all subscriptions
 *
 * @param observables - Variable number of observables to merge
 * @returns Observable that emits values from all input observables
 */
export function merge<T>(...observables: Observable<T>[]): Observable<T> {
  // TODO: Implement merge logic
  //
  // Steps:
  // 1. Return new Observable((subscriber) => { ... })
  return new Observable((s) => {
    let completedCount = 0;
    const subs: Subscription[] = [];
    if (observables.length === 0) {
      s.complete();
    }

    observables.forEach((o) => {
      const sub = o.subscribe({
        next: (v) => s.next(v),
        error: (e) => s.error(e),
        complete: () => {
          completedCount++;
          if (completedCount === observables.length) {
            s.complete();
          }
        },
      });
      subs.push(sub);
    });

    return () => subs.forEach((s) => s.unsubscribe());
  });
  // 2. Create array to store subscriptions
  // 3. Create counter for completed observables
  // 4. For each observable:
  //    - Subscribe with next, error, complete handlers
  //    - In next: forward to subscriber.next()
  //    - In error: forward to subscriber.error() and cleanup
  //    - In complete: increment counter, complete if all done
  //    - Store subscription in array
  // 5. Return cleanup function that unsubscribes from all
}
