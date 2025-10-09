import { Observable } from "../core/Observable";
import { OperatorFunction } from "../core/pipe";
import { concat } from "../observable/concat";

/**
 * concatWith() - Operator that concatenates source with other observables sequentially
 *
 * CONCEPT:
 * - Operator version of concat()
 * - Takes source observable and concatenates it with additional observables
 * - All observables run sequentially (one after another)
 * - Maintains strict order
 *
 * EXAMPLE:
 * ```typescript
 * const source$ = of(1, 2, 3);
 * const other$ = of('a', 'b', 'c');
 *
 * source$.pipe(
 *   concatWith(other$)
 * ).subscribe(console.log);
 * // Output: 1, 2, 3, 'a', 'b', 'c' (guaranteed order)
 * // other$ waits for source$ to complete
 * ```
 *
 * DIFFERENCE FROM mergeWith:
 * - mergeWith: all run concurrently (at same time)
 * - concatWith: all run sequentially (one after another)
 *
 * IMPLEMENTATION STRATEGY:
 * - This is just a wrapper around concat()
 * - Combine source observable with ...observables
 * - Call concat() with all of them
 *
 * TODO: Implement concatWith operator
 *
 * HINT: This can be a one-liner! Use concat() and spread operator
 *
 * @param observables - Additional observables to concatenate after source
 * @returns OperatorFunction that concatenates source with other observables
 */
export function concatWith<T>(
  ...observables: Observable<T>[]
): OperatorFunction<T, T> {
  // TODO: Implement concatWith logic
  //
  // This is simple:
  // 1. Return a function that takes source: Observable<T>
  // 2. Call concat(source, ...observables)
  //
  // Pattern:
  return (source: Observable<T>) => concat(source, ...observables);
}
