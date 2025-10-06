import { Observable } from '../core/Observable';

/**
 * fromEvent() - Create an Observable from DOM events
 *
 * Creates an Observable that emits events from a specified event target.
 * This is commonly used with DOM elements but can work with any EventTarget.
 *
 * Unlike of() and from(), this creates a "hot" observable that emits over time,
 * not all at once. It also requires cleanup (removing event listeners).
 *
 * Marble diagram:
 * fromEvent(button, 'click')
 * -------c-------c---c------>
 *        (clicks happen over time)
 *
 * Usage:
 * const button = document.querySelector('button');
 * fromEvent(button, 'click').subscribe({
 *   next: (event) => console.log('Button clicked!', event)
 * });
 */

/**
 * EventTarget interface (simplified)
 * This covers DOM elements, Window, Document, etc.
 */
export interface EventTargetLike {
  addEventListener(event: string, handler: any): void;
  removeEventListener(event: string, handler: any): void;
}

/**
 * TODO: Implement the fromEvent() function
 *
 * @param target - The event target (DOM element, window, etc.)
 * @param eventName - The name of the event to listen for
 * @returns An Observable that emits events
 *
 * Implementation guide:
 * 1. Return a new Observable
 * 2. In the subscribe function:
 *    a. Create an event handler function that calls subscriber.next(event)
 *    b. Add the event listener using target.addEventListener(eventName, handler)
 *    c. Return a teardown function that removes the listener
 * 3. The teardown is CRITICAL - must call target.removeEventListener(eventName, handler)
 *
 * Key points:
 * - This is asynchronous - events arrive over time
 * - Never completes (unless you unsubscribe)
 * - MUST clean up by removing event listener
 * - The same handler function reference must be used for both add and remove
 *
 * Example:
 * const clicks = fromEvent(document, 'click');
 * const subscription = clicks.subscribe(event => console.log(event));
 * // Later...
 * subscription.unsubscribe(); // Must remove the event listener!
 */
export function fromEvent<T extends Event>(
  target: EventTargetLike,
  eventName: string
): Observable<T> {
  // TODO: Implement fromEvent()
  throw new Error('Not implemented');
}
