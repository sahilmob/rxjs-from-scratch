import { Subscriber } from "./Subscriber";
import { Subscription } from "./Subscription";
import type { PartialObserver, TeardownLogic } from "./types";

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
  /**
   * TODO: Store the subscribe function
   * This function defines the Observable's behavior when subscribed to
   */
  protected _subscribe?: Function;

  /**
   * TODO: Implement the constructor
   *
   * @param subscribe - A function that gets called when someone subscribes.
   *   It receives a Subscriber and should:
   *   - Call subscriber.next(value) to emit values
   *   - Call subscriber.error(err) if an error occurs
   *   - Call subscriber.complete() when done
   *   - Optionally return a teardown function for cleanup
   *
   * Example:
   *   new Observable(subscriber => {
   *     subscriber.next(1);
   *     subscriber.next(2);
   *     subscriber.complete();
   *     return () => console.log('cleanup');
   *   });
   *
   * Tasks:
   * 1. Store the subscribe function for later use
   */
  constructor(subscribe?: (subscriber: Subscriber<T>) => TeardownLogic) {
    this._subscribe = subscribe;
  }

  /**
   * TODO: Implement the subscribe method
   *
   * This is the main way to consume an Observable.
   * It activates the Observable and starts receiving values.
   *
   * @param observerOrNext - Can be:
   *   - An Observer object { next?, error?, complete? }
   *   - A next function
   *   - null/undefined
   *
   * @returns A Subscription object to unsubscribe
   *
   * Tasks:
   * 1. Create a Subscriber from the observerOrNext parameter
   * 2. Call the _subscribe function with this subscriber
   * 3. If _subscribe returns a teardown function, add it to the subscriber
   * 4. Return the subscriber (it's also a Subscription!)
   *
   * Important: Wrap the _subscribe call in try-catch and call subscriber.error()
   * if an exception is thrown.
   */
  subscribe(
    observerOrNext?: PartialObserver<T> | ((value: T) => void) | null
  ): Subscription {
    // TODO: Implement subscribe
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
}
