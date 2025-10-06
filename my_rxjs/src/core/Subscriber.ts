import { Subscription } from "./Subscription";
import type { Observer, PartialObserver } from "./types";

/**
 * Subscriber class
 *
 * A Subscriber is both a Subscription and an Observer.
 * It receives values from an Observable and forwards them to a destination Observer.
 *
 * Key responsibilities:
 * - Implements the Observer interface (next, error, complete)
 * - Extends Subscription for cleanup capabilities
 * - Prevents notifications after error/complete (stopped state)
 * - Safely handles observer callbacks (wraps them in try-catch)
 */
export class Subscriber<T> extends Subscription implements Observer<T> {
  /**
   * TODO: Create a property to track if this subscriber is stopped
   * A subscriber is "stopped" after error() or complete() is called
   * Once stopped, it should ignore any further next() calls
   */
  protected isStopped: boolean = false;

  /**
   * TODO: Create a property to hold the destination observer
   * This is where we forward the notifications (next/error/complete)
   */
  protected destination: Observer<T>;

  /**
   * TODO: Implement the constructor
   *
   * @param observerOrNext - Can be:
   *   - A full Observer object with next/error/complete methods
   *   - A partial Observer with some methods
   *   - Just a next function
   *   - null/undefined
   *
   * Tasks:
   * 1. Call super() to initialize the Subscription
   * 2. Convert the parameter into a safe Observer and store in destination
   *
   * Hint: You'll need a helper function to normalize the parameter into an Observer.
   * The helper should:
   * - If it's already an Observer object, use it
   * - If it's a function, wrap it in { next: fn, error: err => throw err, complete: () => {} }
   * - If it's null/undefined, create a noop observer
   * - Wrap each method in try-catch for safety
   */
  constructor(
    observerOrNext?: PartialObserver<T> | ((value: T) => void) | null
  ) {
    super();
    // TODO: Implement constructor
    this.destination = createSafeObserver(observerOrNext);
  }

  /**
   * TODO: Implement the next method
   *
   * This is called when a new value is emitted by the Observable.
   *
   * Tasks:
   * 1. Check if subscriber is stopped - if so, return early
   * 2. Call destination.next(value)
   *
   * Note: Error handling is done in the destination observer
   */
  next(value: T): void {
    // TODO: Implement next
    if (this.isStopped || this.closed) return;
    this.destination.next(value);
  }

  /**
   * TODO: Implement the error method
   *
   * This is called when an error occurs in the Observable.
   * This is a TERMINAL event - no more notifications after this.
   *
   * Tasks:
   * 1. Check if already stopped - if so, return early (or handle gracefully)
   * 2. Set isStopped = true
   * 3. Call destination.error(err)
   * 4. Call this.unsubscribe() to clean up
   */
  error(err: any): void {
    // TODO: Implement error
    if (this.isStopped) return;
    this.isStopped = true;
    this.destination.error(err);
    this.unsubscribe();
  }

  /**
   * TODO: Implement the complete method
   *
   * This is called when the Observable completes successfully.
   * This is a TERMINAL event - no more notifications after this.
   *
   * Tasks:
   * 1. Check if already stopped - if so, return early
   * 2. Set isStopped = true
   * 3. Call destination.complete()
   * 4. Call this.unsubscribe() to clean up
   */
  complete(): void {
    // TODO: Implement complete
    if (this.isStopped) return;
    this.isStopped = true;
    this.destination.complete();
    this.unsubscribe();
  }
}

/**
 * TODO: Implement this helper function
 *
 * Creates a safe Observer from various input types.
 * "Safe" means each method is wrapped in try-catch to prevent errors
 * in user code from breaking the library.
 *
 * @param observerOrNext - The observer input (object, function, or null)
 * @returns A complete Observer object with all three methods
 *
 * Implementation guide:
 * 1. If null/undefined: return noop observer { next: noop, error: throw, complete: noop }
 * 2. If function: return { next: fn, error: throw, complete: noop }
 * 3. If object: return { next: obj.next || noop, error: obj.error || throw, complete: obj.complete || noop }
 * 4. Wrap each method in try-catch for safety
 *
 * Hint: The error handler should re-throw if no custom error handler provided
 */
export function createSafeObserver<T>(
  observerOrNext?: PartialObserver<T> | ((value: T) => void) | null
): Observer<T> {
  // TODO: Implement this helper function
  if (observerOrNext === null || observerOrNext === undefined) {
    return {
      next: () => {},
      error: () => {},
      complete: () => {},
    };
  } else if (typeof observerOrNext === "function") {
    return {
      next: observerOrNext,
      error: (err) => {
        throw err;
      },
      complete: () => {},
    };
  } else {
    return {
      next: observerOrNext.next || (() => {}),
      error:
        observerOrNext.error ||
        ((e) => {
          throw e;
        }),
      complete: observerOrNext.complete || (() => {}),
    };
  }
}
