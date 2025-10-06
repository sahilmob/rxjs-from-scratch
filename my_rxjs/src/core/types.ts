/**
 * Core type definitions for the reactive library
 */

/**
 * Observer interface - the consumer of values from an Observable
 *
 * An Observer can receive three types of notifications:
 * - next: A new value has been emitted
 * - error: An error has occurred (terminal event)
 * - complete: The observable has finished (terminal event)
 */
export interface Observer<T> {
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}

/**
 * Partial observer - allows optional methods
 * Useful for when you only care about some notifications
 */
export type PartialObserver<T> = Partial<Observer<T>>;

/**
 * A function that can be called to unsubscribe or clean up resources
 */
export type TeardownLogic = (() => void) | void;

/**
 * An object with an unsubscribe method
 */
export interface Unsubscribable {
  unsubscribe(): void;
}

/**
 * A subscription-like object
 */
export interface SubscriptionLike extends Unsubscribable {
  unsubscribe(): void;
  readonly closed: boolean;
}
