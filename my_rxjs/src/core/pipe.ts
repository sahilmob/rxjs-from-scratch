/**
 * pipe() - Standalone function for composing operators
 *
 * The pipe function is a utility for composing multiple operator functions.
 * It takes a series of operators and returns a new function that applies them
 * left-to-right (first to last).
 *
 * This is the functional programming concept of "function composition".
 *
 * Example:
 * const transform = pipe(
 *   map(x => x * 2),
 *   filter(x => x > 5)
 * );
 * const result = transform(sourceObservable);
 */

/**
 * OperatorFunction type
 * An operator is a function that takes an Observable and returns a new Observable
 */
export type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>;

import { Observable } from './Observable';

/**
 * TODO: Implement the pipe() function with overloads
 *
 * The pipe function should:
 * 1. Accept multiple operator functions as arguments
 * 2. Return a new function that applies all operators in sequence
 * 3. Support type inference through TypeScript overloads
 *
 * Implementation guide:
 * - Start with the input (first argument)
 * - Apply each operator function in order
 * - Return the final result
 *
 * Hint: You can use Array.reduce() to apply operators sequentially
 *
 * Example implementation pattern:
 * export function pipe<T>(): (source: Observable<T>) => Observable<T>;
 * export function pipe<T, A>(op1: OperatorFunction<T, A>): (source: Observable<T>) => Observable<A>;
 * export function pipe<T, A, B>(
 *   op1: OperatorFunction<T, A>,
 *   op2: OperatorFunction<A, B>
 * ): (source: Observable<T>) => Observable<B>;
 * // ... more overloads for more operators
 * export function pipe(...operators: OperatorFunction<any, any>[]): (source: Observable<any>) => Observable<any> {
 *   // Implementation here
 * }
 */

// Overloads for type safety (support up to 9 operators - common in RxJS)
export function pipe<T>(): (source: Observable<T>) => Observable<T>;
export function pipe<T, A>(
  op1: OperatorFunction<T, A>
): (source: Observable<T>) => Observable<A>;
export function pipe<T, A, B>(
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>
): (source: Observable<T>) => Observable<B>;
export function pipe<T, A, B, C>(
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>
): (source: Observable<T>) => Observable<C>;
export function pipe<T, A, B, C, D>(
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>
): (source: Observable<T>) => Observable<D>;
export function pipe<T, A, B, C, D, E>(
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>
): (source: Observable<T>) => Observable<E>;

// Implementation
export function pipe(
  ...operators: OperatorFunction<any, any>[]
): (source: Observable<any>) => Observable<any> {
  // TODO: Implement pipe
  // If no operators, return identity function
  // Otherwise, compose all operators left-to-right
  throw new Error('Not implemented');
}
