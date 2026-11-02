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

  protected isStopped: boolean = false;

  protected destination: Observer<T>;

  constructor(
    observerOrNext?: PartialObserver<T> | ((value: T) => void) | null
  ) {
    super();

    this.destination = createSafeObserver(observerOrNext);
  }

  next(value: T): void {

    if (this.isStopped || this.closed) return;
    this.destination.next(value);
  }

  error(err: any): void {

    if (this.isStopped) return;
    this.isStopped = true;
    this.destination.error(err);
    this.unsubscribe();
  }

  complete(): void {

    if (this.isStopped) return;
    this.isStopped = true;
    this.destination.complete();
    this.unsubscribe();
  }
}

export function createSafeObserver<T>(
  observerOrNext?: PartialObserver<T> | ((value: T) => void) | null
): Observer<T> {

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
