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

  /**
   * TODO: Create a private property to store child subscriptions/teardown functions
   * Hint: You can use a Set or Array to store them
   */
  private _teardowns: Set<Function>;
  private _teardown?: Function;

  /**
   * TODO: Implement the constructor
   *
   * @param initialTeardown - Optional function to execute when unsubscribing
   *
   * Tasks:
   * 1. Accept an optional teardown function parameter
   * 2. Store it so it can be called during unsubscribe
   */
  constructor(teardown?: Function) {
    this._teardowns = new Set();
    this._teardown = teardown;
    // TODO: Implement constructor
  }

  /**
   * TODO: Implement the unsubscribe method
   *
   * This method should:
   * 1. Check if already closed (if so, do nothing)
   * 2. Set closed = true
   * 3. Execute the initial teardown function (if provided)
   * 4. Execute all child teardowns
   * 5. Clear the teardowns collection
   *
   * Important: Make sure this is idempotent (safe to call multiple times)
   */
  unsubscribe(): void {
    // TODO: Implement unsubscribe logic
    if (this.closed) return;
    this.closed = true;
    this._teardown?.();
    this._teardowns.forEach((t) => t());
    this._teardowns.clear();
  }

  /**
   * TODO: Implement the add method
   *
   * Adds a teardown function or child subscription to this subscription.
   * When this subscription is unsubscribed, all added teardowns will be executed.
   *
   * @param teardown - A function to execute on unsubscribe, or another Subscription
   *
   * Tasks:
   * 1. If already closed, execute the teardown immediately and return
   * 2. If teardown is null/undefined, ignore it
   * 3. Otherwise, add it to the teardowns collection
   *
   * Hint: Check if teardown has an 'unsubscribe' method to handle Subscription objects
   */
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
        this._teardowns.add(() => teardown.unsubscribe());
      }
    }
    // TODO: Implement add logic
  }

  /**
   * BONUS (Optional): Implement a remove method
   *
   * Removes a specific teardown from this subscription without executing it.
   *
   * @param teardown - The teardown to remove
   */
  remove(teardown: TeardownLogic | Unsubscribable): void {
    // TODO: Optional implementation
    if (teardown === undefined || teardown === null) {
      return;
    } else if (typeof teardown === "function") {
      this._teardowns.delete(teardown);
    } else {
      this._teardowns.delete(() => teardown.unsubscribe());
    }
  }
}
