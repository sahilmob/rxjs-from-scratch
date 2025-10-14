import { Observable } from "../core/Observable";
import { OperatorFunction } from "../core/types";
import { Subscription } from "../core/Subscription";

/**
 * mergeMap (also known as flatMap) - Map to inner observable and flatten concurrently
 *
 * CONCEPT:
 * - Maps each source value to an inner Observable
 * - Subscribes to ALL inner observables concurrently
 * - Flattens by forwarding all inner values to output
 * - Completes when outer completes AND all inner observables complete
 *
 * FLATTENING EXPLAINED:
 * - Higher-Order Observable: Observable<Observable<T>> (Observable of Observables)
 * - Flattening: Converting Observable<Observable<T>> → Observable<T>
 * - mergeMap does: map (create inner observables) + mergeAll (flatten concurrently)
 *
 * KEY DIFFERENCES FROM MAP:
 * - map: transforms values (T → R)
 * - mergeMap: transforms values to observables, then flattens (T → Observable<R> → R)
 *
 * MARBLE DIAGRAM:
 * ```
 * Source:     -1-------2-------3-|
 *              |       |       |
 *              v       v       v
 * Inner Obs:  -10-20-| -10-20-| -10-20-|
 *
 * mergeMap:   -10-20--10-20--10-20-|
 *             (all inner observables run concurrently)
 * ```
 *
 * VS OTHER FLATTENING STRATEGIES:
 * - mergeMap: concurrent (all inner observables run at same time)
 * - switchMap: cancel previous (only latest inner observable runs)
 * - concatMap: sequential (wait for previous to complete before next)
 *
 * EXAMPLE:
 * ```typescript
 * // Fetch user details for multiple user IDs (in parallel)
 * of(1, 2, 3).pipe(
 *   mergeMap(id => fetchUser(id))  // All 3 requests fire immediately
 * ).subscribe(user => console.log(user));
 * // Output: users arrive as responses complete (order not guaranteed)
 *
 * // vs map (wrong - creates nested observables)
 * of(1, 2, 3).pipe(
 *   map(id => fetchUser(id))  // ❌ Returns Observable<Observable<User>>
 * ).subscribe(obs => console.log(obs));  // ❌ You get observables, not users!
 * ```
 *
 * COMMON USE CASES:
 * - Parallel API requests (fire all at once, collect as they complete)
 * - File uploads (upload multiple files concurrently)
 * - Database queries (query multiple records in parallel)
 * - Any scenario where you want concurrent execution
 *
 * CONCURRENCY CONTROL (OPTIONAL):
 * - mergeMap can take an optional `concurrent` parameter
 * - Limits how many inner observables can run at the same time
 * - mergeMap(fn, 2) → max 2 concurrent inner subscriptions
 * - Useful for rate limiting API calls
 *
 * COMPLETION BEHAVIOR:
 * - Must track: outer completion AND active inner count
 * - Only complete when outer is done AND no active inners
 * - Same pattern as mergeAll() from Step 9
 *
 * ERROR BEHAVIOR:
 * - Any error from any inner observable propagates immediately
 * - Errors stop everything (both outer and all inners)
 *
 * IMPLEMENTATION STRATEGY:
 * 1. Subscribe to source (outer) observable
 * 2. For each outer value:
 *    - Call projection function to get inner observable
 *    - Subscribe to inner observable
 *    - Increment active inner count
 * 3. Forward all inner values to subscriber
 * 4. When inner completes:
 *    - Decrement active inner count
 *    - Check if we should complete (outer done + no active inners)
 * 5. When outer completes:
 *    - Mark outer as complete
 *    - Check if we should complete (no active inners)
 *
 * TODO: Implement mergeMap operator
 *
 * HINTS:
 * - Very similar to mergeAll() from Step 9, but with a projection function
 * - Instead of source emitting observables, YOU create observables via projection
 * - Track: outerComplete (boolean), activeInnerCount (number)
 * - Store all subscriptions for cleanup
 * - Use checkComplete() helper to avoid duplicating completion logic
 *
 * PATTERNS TO USE:
 * - Two-level subscription (outer + multiple inners)
 * - Completion tracking (outer complete + active inner count)
 * - Subscription management (array of subscriptions)
 */

/**
 * Maps each source value to an Observable (via projection function),
 * then flattens all inner Observables concurrently.
 *
 * @param project Function that maps each source value to an Observable
 * @param concurrent Optional limit on number of concurrent inner subscriptions
 * @returns OperatorFunction that flattens projected observables
 */
export function mergeMap<T, R>(
  project: (value: T, index: number) => Observable<R>,
  concurrent?: number
): OperatorFunction<T, R> {
  // TODO: Implement mergeMap
  //
  // Implementation plan:
  //
  // STEP 1: Return operator function
  // return (source: Observable<T>) => new Observable<R>((subscriber) => {
  //
  // STEP 2: Setup state tracking
  //   let outerComplete = false;
  //   let activeInnerCount = 0;
  //   let outerIndex = 0;
  //   const subs: Subscription[] = [];
  //
  // STEP 3: Create checkComplete helper
  //   const checkComplete = () => {
  //     if (outerComplete && activeInnerCount === 0) {
  //       subscriber.complete();
  //     }
  //   };
  //
  // STEP 4: Subscribe to outer (source) observable
  //   const outerSub = source.subscribe({
  //     next: (outerValue) => {
  //       // Call projection function to get inner observable
  //       const innerObs = project(outerValue, outerIndex++);
  //
  //       // Increment active inner count
  //       activeInnerCount++;
  //
  //       // Subscribe to inner observable
  //       const innerSub = innerObs.subscribe({
  //         next: (innerValue) => subscriber.next(innerValue),
  //         error: (err) => subscriber.error(err),
  //         complete: () => {
  //           activeInnerCount--;
  //           checkComplete();
  //         }
  //       });
  //
  //       subs.push(innerSub);
  //     },
  //     error: (err) => subscriber.error(err),
  //     complete: () => {
  //       outerComplete = true;
  //       checkComplete();
  //     }
  //   });
  //
  // STEP 5: Add outer subscription to cleanup array
  //   subs.push(outerSub);
  //
  // STEP 6: Return cleanup function
  //   return () => subs.forEach(s => s.unsubscribe());
  // });
  //
  // OPTIONAL: Concurrency Control (for advanced version)
  // If you want to implement the concurrent parameter:
  // - Create a queue to buffer outer values when at max concurrency
  // - Only subscribe to inner when activeInnerCount < concurrent
  // - When inner completes, check queue and process next
  //
  // For now, implement WITHOUT concurrency control (unlimited concurrent inners)
  //
  // KEY POINTS:
  // - Very similar to mergeAll(), but you create the inner observables via project()
  // - Each outer value creates a new inner subscription (concurrent)
  // - Track both outer completion AND active inner count
  // - Only complete when BOTH conditions met:
  //   1. Outer has completed (outerComplete = true)
  //   2. No active inner subscriptions (activeInnerCount === 0)
  //
  // EDGE CASES:
  // - Outer completes immediately (no values) → complete immediately
  // - Projection function throws → error the subscriber
  // - Inner observable errors → propagate and stop everything
  // - Early unsubscribe → clean up all subscriptions
  //
  // COMPARISON TO PREVIOUS OPERATORS:
  // - map: transforms values
  // - mergeAll: flattens observable of observables
  // - mergeMap: map + mergeAll (convenience operator!)

  throw new Error("mergeMap not implemented yet");
}

/**
 * Alias for mergeMap (for backwards compatibility with RxJS 4)
 */
export const flatMap = mergeMap;
