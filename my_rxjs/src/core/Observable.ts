import { Subscriber } from "./Subscriber";
import { Subscription } from "./Subscription";
import type { PartialObserver, TeardownLogic } from "./types";
import type { OperatorFunction } from "./pipe";

/**
 * Observable class
 *
 * An Observable represents a stream of values over time.
 * It's a "lazy" push-based collection - nothing happens until you subscribe.
 *
 * Key concepts:
 * - Created with a subscribe function that defines what happens when subscribed
 * - Can emit multiple values via subscriber.next()
 * - Can error via subscriber.error() (terminal)
 * - Can complete via subscriber.complete() (terminal)
 * - Returns a Subscription for cleanup
 */
export class Observable<T> {

  protected _subscribe?: Function;

  constructor(subscribe?: (subscriber: Subscriber<T>) => TeardownLogic) {
    this._subscribe = subscribe;
  }

  subscribe(
    observerOrNext?: PartialObserver<T> | ((value: T) => void) | null
  ): Subscription {

    // if (!observerOrNext) return
    const subscriber = new Subscriber(observerOrNext);
    try {
      const unsub = this._subscribe?.(subscriber);
      subscriber.add(unsub);
    } catch (error) {
      subscriber.error(error);
    }

    return subscriber;
  }

  // Overloads for type safety
  pipe(): Observable<T>;
  pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
  pipe<A, B>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>
  ): Observable<B>;
  pipe<A, B, C>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>
  ): Observable<C>;
  pipe<A, B, C, D>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>
  ): Observable<D>;
  pipe<A, B, C, D, E>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>
  ): Observable<E>;

  // Implementation
  pipe(...operators: OperatorFunction<any, any>[]): Observable<any> {
    return operators.reduce((acc, curr) => curr(acc), this as Observable<any>);
  }
}
