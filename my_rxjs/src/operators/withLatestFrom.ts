import { Observable } from "../core/Observable";
import { OperatorFunction } from "../core/pipe";
import { Subscription } from "../core/Subscription";

/**
 * withLatestFrom() - Combine source with latest from other observables
 *
 * CONCEPT:
 * - Only emits when the SOURCE observable emits
 * - Combines source value with latest values from other observables
 * - Other observables are "sampled" - we take their latest value
 * - Does NOT emit when other observables emit (only source triggers)
 *
 * KEY DIFFERENCE FROM combineLatest:
 * - combineLatest: emits when ANY observable emits
 * - withLatestFrom: emits ONLY when SOURCE emits
 *
 * EXAMPLE:
 * ```typescript
 * const source$ = of(1, 2, 3);
 * const other$ = of('a', 'b', 'c');
 *
 * source$.pipe(
 *   withLatestFrom(other$)
 * ).subscribe(console.log);
 * // Output:
 * // [1, 'a']  // source emits 1, latest from other is 'a'
 * // [2, 'b']  // source emits 2, latest from other is 'b'
 * // [3, 'c']  // source emits 3, latest from other is 'c'
 * ```
 *
 * MARBLE DIAGRAM:
 * ```
 * source:  -1---2---3-|
 * other:   ---a---b---c---|
 *
 * withLatestFrom(other):
 *          ---[1,a]-[2,b]-[3,c]-|
 *              ^     ^     ^
 *           source source source
 *           triggers triggers triggers
 * ```
 *
 * KEY DIFFERENCE ILLUSTRATED:
 * ```
 * source:  -1-------2-|
 * other:   ---a-b-c-d---|
 *
 * combineLatest:
 *          ---[1,a]-[1,b]-[1,c]-[1,d]-[2,d]-|
 *              ↑     ↑     ↑     ↑     ↑
 *           Emits on ANY emission
 *
 * withLatestFrom:
 *          ---[1,a]-------[2,d]-|
 *              ↑           ↑
 *           Emits ONLY on source emission
 * ```
 *
 * KEY CONCEPTS:
 * 1. Source-driven emission - only source triggers output
 * 2. Latest value sampling - take latest from others at time of source emission
 * 3. Must wait for all to emit once - like combineLatest
 * 4. Source completion determines output completion
 * 5. Other observables keep running (don't need to complete)
 *
 * IMPLEMENTATION STRATEGY:
 * 1. Subscribe to source observable
 * 2. Subscribe to all other observables to track their latest values
 * 3. When source emits:
 *    - Check if all others have emitted at least once
 *    - If yes: emit array [sourceValue, ...latestFromOthers]
 *    - If no: skip (can't combine yet)
 * 4. Complete when source completes (ignore other completions)
 *
 * TODO: Implement withLatestFrom operator
 *
 * HINTS:
 * - Track latest values from "other" observables
 * - Track hasValue flags for "other" observables
 * - Only emit when source emits AND all others have emitted once
 * - Source completion → output completion (don't wait for others)
 *
 * @param observables - Other observables to sample from
 * @returns OperatorFunction that combines source with latest from others
 */
export function withLatestFrom<T, R>(
  ...observables: Observable<R>[]
): OperatorFunction<T, [T, ...R[]]> {
  // TODO: Implement withLatestFrom logic

  return (source: Observable<T>) =>
    new Observable((s) => {
      // ✅ Empty array: pass through source values unchanged
      if (observables.length === 0) {
        return source.subscribe({
          next: (v) => s.next(v as any),
          error: (e) => s.error(e),
          complete: () => s.complete(),
        });
      }

      // Track latest values from OTHER observables only
      const latestValues: R[] = new Array(observables.length);
      const hasValue: boolean[] = new Array(observables.length).fill(false);
      const subs: Subscription[] = [];

      // Subscribe to OTHER observables FIRST
      observables.forEach((obs, i) => {
        const sub = obs.subscribe({
          next: (v) => {
            latestValues[i] = v;
            hasValue[i] = true;
          },
          error: (e) => s.error(e),
          complete: () => {}, // Ignore other completions
        });
        subs.push(sub);
      });

      // Subscribe to SOURCE last
      const sourceSub = source.subscribe({
        next: (sourceValue) => {
          // Only emit if ALL other observables have emitted at least once
          if (hasValue.every((v) => v === true)) {
            s.next([sourceValue, ...latestValues] as any);
          }
        },
        error: (e) => s.error(e),
        complete: () => s.complete(),
      });

      return () => {
        sourceSub.unsubscribe();
        subs.forEach((sub) => sub.unsubscribe());
      };
    });
  //
  // Steps:
  // 1. Return (source: Observable<T>) => new Observable((subscriber) => { ... })
  // 2. Handle empty array edge case (just pass through source)
  // 3. Create state tracking for OTHER observables:
  //    - const latestValues: R[] = new Array(observables.length)
  //    - const hasValue: boolean[] = new Array(observables.length).fill(false)
  // 4. Helper: allOthersHaveEmitted()
  //    - return hasValue.every(v => v === true)
  // 5. Subscribe to each "other" observable (with index):
  //    - next(value):
  //        - latestValues[index] = value
  //        - hasValue[index] = true
  //    - error(e): subscriber.error(e)
  //    - complete(): (do nothing - source drives completion)
  // 6. Subscribe to source:
  //    - next(sourceValue):
  //        - if (allOthersHaveEmitted()):
  //            subscriber.next([sourceValue, ...latestValues])
  //    - error(e): subscriber.error(e)
  //    - complete(): subscriber.complete()
  // 7. Return cleanup function
}
