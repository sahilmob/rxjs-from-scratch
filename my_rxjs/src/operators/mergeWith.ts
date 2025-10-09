import { Observable } from "../core/Observable";
import { OperatorFunction } from "../core/pipe";
import { merge } from "../observable/merge";

/**
 * mergeWith() - Operator that merges source with other observables
 *
 * CONCEPT:
 * - Operator version of merge()
 * - Takes source observable and merges it with additional observables
 * - All observables run concurrently
 *
 * EXAMPLE:
 * ```typescript
 * const source$ = of(1, 2, 3);
 * const other$ = of('a', 'b', 'c');
 *
 * source$.pipe(
 *   mergeWith(other$)
 * ).subscribe(console.log);
 * // Output: 1, 2, 3, 'a', 'b', 'c' (order may vary)
 * ```
 *
 * IMPLEMENTATION STRATEGY:
 * - This is just a wrapper around merge()
 * - Combine source observable with ...observables
 * - Call merge() with all of them
 *
 * TODO: Implement mergeWith operator
 *
 * HINT: This can be a one-liner! Use merge() and spread operator
 *
 * @param observables - Additional observables to merge with source
 * @returns OperatorFunction that merges source with other observables
 */
export function mergeWith<T>(
  ...observables: Observable<T>[]
): OperatorFunction<T, T> {
  // TODO: Implement mergeWith logic
  //
  // This is simple:
  // 1. Return a function that takes source: Observable<T>
  return (source: Observable<T>) => merge(source, ...observables);
  // 2. Call merge(source, ...observables)
  //
  // Pattern:
  // return (source: Observable<T>) => merge(source, ...observables);
}
