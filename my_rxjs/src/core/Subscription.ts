import type { SubscriptionLike, TeardownLogic, Unsubscribable } from "./types";

/**
 * Subscription class
 *
 * Represents a disposable resource (like the execution of an Observable).
 * The main purpose is to provide an `unsubscribe` method to release resources.
 *
 * Key features:
 * - Can hold a teardown function that runs on unsubscribe
 * - Can have child subscriptions added via `add()`
 * - Unsubscribing a parent unsubscribes all children
 * - Prevents multiple unsubscriptions
 */
export class Subscription implements SubscriptionLike {
  /**
   * A flag indicating whether this subscription has been unsubscribed
   */
  public closed: boolean = false;

  private _teardowns: Set<(() => void) | Unsubscribable>;
  private _teardown?: Function;

  constructor(teardown?: Function) {
    this._teardowns = new Set();
    this._teardown = teardown;

  }

  unsubscribe(): void {

    if (this.closed) return;
    this.closed = true;
    this._teardown?.();
    this._teardowns.forEach((t) => {
      if (typeof t === "function") t();
      else t.unsubscribe();
    });
    this._teardowns.clear();
  }

  add(teardown: TeardownLogic | Unsubscribable): void {
    if (this.closed) {
      if (teardown === undefined || teardown === null) {
        return;
      } else if (typeof teardown === "function") {
        teardown();
      } else {
        teardown.unsubscribe();
      }
    } else {
      if (teardown === undefined || teardown === null) {
        return;
      } else if (typeof teardown === "function") {
        this._teardowns.add(teardown);
      } else {
        this._teardowns.add(teardown);
      }
    }

  }

  /**
   * Remove a registered teardown without running it
   *
   * Removes a specific teardown from this subscription without executing it.
   *
   * @param teardown - The teardown to remove
   */
  remove(teardown: TeardownLogic | Unsubscribable): void {

    if (teardown === undefined || teardown === null) {
      return;
    } else if (typeof teardown === "function") {
      this._teardowns.delete(teardown);
    } else {
      this._teardowns.delete(teardown);
    }
  }
}
