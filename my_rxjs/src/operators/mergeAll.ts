import { Observable } from "../core/Observable";
import { OperatorFunction } from "../core/pipe";
import { Subscription } from "../core/Subscription";

/**
 * mergeAll() - Flatten a higher-order observable using merge strategy
 *
 * CONCEPT:
 * - Takes an Observable of Observables (higher-order observable)
 * - Subscribes to each inner observable concurrently as they arrive
 * - Emits values from all inner observables
 * - Completes when outer completes AND all inner observables complete
 *
 * EXAMPLE:
 * ```typescript
 * const outer$ = of(
 *   of(1, 2, 3),      // inner observable 1
 *   of('a', 'b', 'c') // inner observable 2
 * );
 *
 * outer$.pipe(mergeAll()).subscribe(console.log);
 * // Output: 1, 2, 3, 'a', 'b', 'c' (order may vary)
 * ```
 *
 * HIGHER-ORDER OBSERVABLE:
 * An observable that emits observables!
 * - Outer observable: emits inner observables
 * - Inner observables: emit actual values
 *
 * EXAMPLE USE CASE:
 * ```typescript
 * // Map each number to an interval that counts to that number
 * of(2, 3, 1).pipe(
 *   map(n => interval(1000).pipe(take(n))),
 *   mergeAll()
 * );
 * // Creates 3 concurrent intervals
 * ```
 *
 * KEY CONCEPTS:
 * 1. Two-level subscription:
 *    - Subscribe to outer (observable of observables)
 *    - Subscribe to each inner observable as it arrives
 * 2. Track active inner subscriptions
 * 3. Complete when:
 *    - Outer has completed (no more inner observables coming)
 *    - AND all inner observables have completed
 *
 * IMPLEMENTATION STRATEGY:
 * 1. Subscribe to outer observable
 * 2. When outer emits an inner observable:
 *    - Subscribe to that inner observable
 *    - Forward inner values to subscriber
 *    - Track completion of that inner
 * 3. When outer completes:
 *    - Mark outer as complete
 *    - Check if all inners are also complete
 * 4. When inner completes:
 *    - Remove from active list
 *    - If outer is done and no more active inners, complete
 *
 * TODO: Implement mergeAll operator
 *
 * HINTS:
 * - Track whether outer has completed (boolean flag)
 * - Track active inner subscriptions (Set or counter)
 * - Create a helper function to check if should complete:
 *   - Complete if outerComplete && activeInnerCount === 0
 *
 * @returns OperatorFunction that flattens higher-order observable
 */
export function mergeAll<T>(): OperatorFunction<Observable<T>, T> {
  // TODO: Implement mergeAll logic
  //
  // Steps:
  // 1. Return (source: Observable<Observable<T>>) => new Observable((subscriber) => { ... })
  return (source: Observable<Observable<T>>) =>
    new Observable((subscriber) => {
      let outerComplete = false;
      let activeInnerCount = 0;
      const subs: Subscription[] = [];

      function checkComplete() {
        if (outerComplete && activeInnerCount === 0) {
          subscriber.complete();
        }
      }

      const sub = source.subscribe({
        next: (s) => {
          activeInnerCount++;
          const innerSub = s.subscribe({
            next: (v) => subscriber.next(v),
            error: (e) => subscriber.error(e),
            complete: () => {
              activeInnerCount--;
              checkComplete();
            },
          });
          subs.push(innerSub);
        },
        error: (e) => subscriber.error(e),
        complete: () => {
          outerComplete = true;
          checkComplete();
        },
      });

      subs.push(sub);

      return () => subs.forEach((s) => s.unsubscribe());
    });
  // 2. Track: outerComplete = false, activeInnerCount = 0
  // 3. Create helper: checkComplete() - if outerComplete && activeInnerCount === 0, complete
  // 4. Subscribe to outer (source):
  //    - next(inner):
  //        - activeInnerCount++
  //        - Subscribe to inner observable
  //        - In inner's next: forward to subscriber.next()
  //        - In inner's error: forward to subscriber.error()
  //        - In inner's complete: activeInnerCount--, checkComplete()
  //    - error(e): subscriber.error(e)
  //    - complete(): outerComplete = true, checkComplete()
  // 5. Return cleanup that unsubscribes from outer and all active inners
}
