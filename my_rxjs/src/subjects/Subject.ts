import { Observable } from "../core/Observable";
import { Observer } from "../core/types";
import { Subscriber } from "../core/Subscriber";
import { Subscription } from "../core/Subscription";

/**
 * Subject - A special type of Observable that is both Observable and Observer
 *
 * CONCEPT:
 * - Subject is BOTH an Observable (can be subscribed to) AND an Observer (can receive values)
 * - Multicasts to multiple subscribers - all subscribers receive the same values
 * - "Hot" observable - values are shared, not replayed per subscriber
 * - Can manually push values using next(), error(), complete()
 *
 * KEY DIFFERENCES FROM REGULAR OBSERVABLE:
 * - Regular Observable: unicast (each subscriber gets independent execution)
 * - Subject: multicast (all subscribers share the same execution)
 * - Regular Observable: cold (starts emitting when subscribed)
 * - Subject: hot (emits regardless of subscribers)
 *
 * EXAMPLE:
 * ```typescript
 * const subject = new Subject<number>();
 *
 * // Subscriber 1
 * subject.subscribe(x => console.log('A:', x));
 *
 * subject.next(1);  // A: 1
 * subject.next(2);  // A: 2
 *
 * // Subscriber 2 (joins after some emissions)
 * subject.subscribe(x => console.log('B:', x));
 *
 * subject.next(3);  // A: 3, B: 3
 * subject.complete();  // Both complete
 * ```
 *
 * MARBLE DIAGRAM:
 * ```
 * Subject:     -1---2---3-|
 *
 * Subscriber A: -1---2---3-|  (subscribed from start)
 * Subscriber B:     ---3-|    (subscribed after 2)
 * ```
 *
 * KEY CONCEPTS:
 * 1. Dual Nature - Acts as both Observable and Observer
 * 2. Multicast - All subscribers receive the same values simultaneously
 * 3. No Replay - New subscribers don't get past values
 * 4. Manual Control - You call next/error/complete to emit values
 * 5. Stopped State - After error/complete, no more emissions allowed
 * 6. Observer Management - Track and notify all active subscribers
 *
 * USE CASES:
 * - Event buses (share events across app)
 * - State management (notify multiple components)
 * - Manual control over emissions
 * - Converting imperative code to reactive
 * - Bridging callback APIs to Observables
 *
 * IMPLEMENTATION STRATEGY:
 * 1. Extend Observable (to be subscribable)
 * 2. Implement Observer interface (next, error, complete)
 * 3. Maintain array of active observers/subscribers
 * 4. When next/error/complete called:
 *    - Check if stopped (don't emit after error/complete)
 *    - Notify all active observers
 *    - If error/complete, mark as stopped
 * 5. When subscribe called:
 *    - Add observer to list
 *    - Return subscription that removes observer on unsubscribe
 *    - If already stopped/errored, handle immediately
 * 6. Clean up completed/errored observers
 *
 * TODO: Implement Subject class
 *
 * HINTS:
 * - Extend Observable<T>
 * - Implement Observer<T> (next, error, complete methods)
 * - Track: observers: Observer<T>[], stopped: boolean, error?: any
 * - In constructor: pass subscribe function to super()
 * - In next(): if (!stopped) notify all observers
 * - In error(): set stopped, notify all, clear observers
 * - In complete(): set stopped, notify all, clear observers
 * - In subscribe: add observer, return teardown that removes observer
 * - Handle edge case: subscribing after error/complete
 */
export class Subject<T> extends Observable<T> implements Observer<T> {
  // TODO: Implement Subject
  //
  // State to track:
  private observers: Observer<T>[] = []; // List of active subscribers
  private stopped: boolean = false; // Has error/complete been called?
  private hasError: boolean = false; // Did it error?
  private thrownError?: any; // The error that was thrown
  //
  // Constructor:
  constructor() {
    super((s) => {
      if (this.stopped) {
        if (this.hasError) {
          s.error(this.thrownError);
        } else {
          s.complete();
        }
      } else {
        this.observers.push(s);

        return () => {
          const idx = this.observers.findIndex((sub) => sub === s);

          if (idx > -1) {
            this.observers.splice(idx, 1);
          }
        };
      }
    });
  }
  // - Call super() with subscribe function
  // - Subscribe function should:
  //   - If stopped and hasError: immediately error the subscriber
  //   - If stopped and !hasError: immediately complete the subscriber
  //   - Otherwise: add observer to list, return unsubscribe function
  //
  next(value: T) {
    if (this.stopped) return;

    // Make a copy to avoid issues if observer unsubscribes during iteration
    const observers = [...this.observers];

    observers.forEach((o) => {
      try {
        if (o.next) {
          o.next(value);
        }
      } catch (error) {
        // Observer errors should not affect other observers
        // Just ignore or could log in production
      }
    });
  }
  // - If stopped, return (ignore)
  // - Iterate through observers and call observer.next(value)
  // - Wrap in try-catch to handle observer errors
  //

  error(err: any) {
    if (this.stopped) return;
    this.stopped = true;
    this.hasError = true;
    this.thrownError = err;

    // Make a copy to avoid issues if observer unsubscribes during iteration
    const observers = [...this.observers];
    this.observers = [];

    observers.forEach((o) => {
      try {
        if (o.error) {
          o.error(err);
        }
      } catch (error) {
        // Observer errors should not affect other observers
        // Just ignore or could log in production
      }
    });
  }
  // error(err: any):
  // - If stopped, return (ignore)
  // - Set stopped = true, hasError = true, thrownError = err
  // - Iterate through observers and call observer.error(err)
  // - Clear observers array
  //
  // complete():
  // - If stopped, return (ignore)
  // - Set stopped = true
  // - Iterate through observers and call observer.complete()
  // - Clear observers array
  //
  complete() {
    if (this.stopped) return;
    this.stopped = true;

    // Make a copy to avoid issues if observer unsubscribes during iteration
    const observers = [...this.observers];
    this.observers = [];

    observers.forEach((o) => {
      try {
        if (o.complete) {
          o.complete();
        }
      } catch (error) {
        // Observer errors should not affect other observers
        // Just ignore or could log in production
      }
    });
  }
  // IMPORTANT EDGE CASES:
  // - Subscribing after complete: should immediately complete
  // - Subscribing after error: should immediately error
  // - Calling next/error/complete after stopped: should be no-op
  // - Observer throwing error during notification: should not break other observers
  // - Unsubscribing during notification: handle safely (copy array or mark removed)
  //
  // PATTERN: Observer Array Management
  // ```typescript
  // private observers: Observer<T>[] = [];
  //
  // // Add observer
  // observers.push(observer);
  //
  // // Remove observer
  // const index = observers.indexOf(observer);
  // if (index !== -1) observers.splice(index, 1);
  //
  // // Notify all observers
  // observers.forEach(observer => {
  //   try {
  //     observer.next(value);
  //   } catch (err) {
  //     // Handle observer errors
  //   }
  // });
  // ```
  //
  // PATTERN: Stopped State Check
  // ```typescript
  // next(value: T) {
  //   if (this.stopped) return;  // Ignore after error/complete
  //   // ... notify observers
  // }
  // ```
  //
  // Steps:
  // 1. Declare state variables (observers, stopped, hasError, thrownError)
  // 2. Implement constructor:
  //    - super(subscriber => {
  //        - Handle stopped state
  //        - Add to observers
  //        - Return unsubscribe function
  //      })
  // 3. Implement next(value: T):
  //    - Guard: if (stopped) return
  //    - Notify all observers
  // 4. Implement error(err: any):
  //    - Guard: if (stopped) return
  //    - Set stopped = true, hasError = true, thrownError = err
  //    - Notify all observers
  //    - Clear observers array
  // 5. Implement complete():
  //    - Guard: if (stopped) return
  //    - Set stopped = true
  //    - Notify all observers
  //    - Clear observers array
}
