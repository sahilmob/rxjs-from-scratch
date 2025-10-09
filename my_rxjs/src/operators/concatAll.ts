import { Observable } from "../core/Observable";
import { OperatorFunction } from "../core/pipe";
import { Subscription } from "../core/Subscription";

/**
 * concatAll() - Flatten a higher-order observable using concat strategy
 *
 * CONCEPT:
 * - Takes an Observable of Observables (higher-order observable)
 * - Subscribes to each inner observable SEQUENTIALLY (one at a time)
 * - Waits for current inner to complete before subscribing to next
 * - Maintains strict order of emissions
 * - Completes when outer completes AND all inner observables complete
 *
 * EXAMPLE:
 * ```typescript
 * const outer$ = of(
 *   of(1, 2, 3),      // inner observable 1
 *   of('a', 'b', 'c') // inner observable 2
 * );
 *
 * outer$.pipe(concatAll()).subscribe(console.log);
 * // Output (guaranteed order): 1, 2, 3, 'a', 'b', 'c'
 * // Second inner doesn't start until first completes!
 * ```
 *
 * DIFFERENCE FROM mergeAll:
 * - mergeAll: subscribes to all inners concurrently (at same time)
 * - concatAll: subscribes to inners sequentially (one at a time)
 *
 * MARBLE DIAGRAM:
 * ```
 * outer$: -inner1--inner2--inner3-|
 * inner1:  -1-2-3-|
 * inner2:          -a-b-c-|
 * inner3:                  -X-Y-|
 * concatAll(): -1-2-3-a-b-c-X-Y-|
 * ```
 *
 * KEY CONCEPTS:
 * 1. Two-level subscription:
 *    - Subscribe to outer (observable of observables)
 *    - Subscribe to each inner observable as previous completes
 * 2. Queue inner observables as they arrive
 * 3. Process queue sequentially (FIFO)
 * 4. Complete when:
 *    - Outer has completed (no more inner observables coming)
 *    - AND all queued inner observables have been processed
 *    - AND current inner observable has completed
 *
 * IMPLEMENTATION STRATEGY:
 * 1. Subscribe to outer observable
 * 2. When outer emits an inner observable:
 *    - Add it to a queue
 *    - If not currently processing, start processing queue
 * 3. Process queue:
 *    - Subscribe to first inner in queue
 *    - When it completes, move to next inner in queue
 * 4. When outer completes:
 *    - Mark outer as complete
 *    - Complete when queue is empty AND no active inner
 * 5. When inner completes:
 *    - Process next inner from queue
 *    - If queue empty and outer complete, complete
 *
 * TODO: Implement concatAll operator
 *
 * HINTS:
 * - Use a queue (array) to store inner observables: const queue: Observable<T>[] = []
 * - Track whether actively processing an inner: let isProcessing = false
 * - Track whether outer completed: let outerComplete = false
 * - Create helper: processNext()
 *   - If isProcessing or queue empty, return
 *   - Set isProcessing = true
 *   - Subscribe to queue[0]
 *   - On complete: remove from queue, isProcessing = false, processNext()
 *
 * @returns OperatorFunction that flattens higher-order observable sequentially
 */
export function concatAll<T>(): OperatorFunction<Observable<T>, T> {
  // TODO: Implement concatAll logic
  //
  return (source: Observable<Observable<T>>) =>
    new Observable((subscriber) => {
      const queue: Observable<T>[] = [];
      let outerComplete = false;
      let isProcessing = false;
      let innerSub: Subscription | undefined = undefined;

      const processNext = () => {
        if (isProcessing) return;

        if (queue.length === 0) {
          if (outerComplete) {
            subscriber.complete();
          }
          return;
        }

        isProcessing = true;

        const next = queue.shift();
        innerSub = next?.subscribe({
          next: (v) => subscriber.next(v),
          error: (e) => subscriber.error(e),
          complete: () => {
            isProcessing = false;
            processNext();
          },
        });
      };

      const outerSub = source.subscribe({
        next: (obs) => {
          queue.push(obs);
          processNext();
        },
        error: (e) => subscriber.error(e),
        complete: () => {
          outerComplete = true;
          processNext();
        },
      });

      return () => {
        innerSub?.unsubscribe();
        outerSub.unsubscribe();
      };
    });
  // Steps:
  // 1. Return (source: Observable<Observable<T>>) => new Observable((subscriber) => { ... })
  // 2. Track state:
  //    - const queue: Observable<T>[] = []
  //    - let outerComplete = false
  //    - let isProcessing = false
  //    - let innerSub: Subscription | null = null
  // 3. Create helper: processNext()
  //    - If isProcessing or queue.length === 0:
  //        - If outerComplete and queue.length === 0 and !isProcessing:
  //            subscriber.complete()
  //        - return
  //    - isProcessing = true
  //    - const innerObs = queue.shift()!
  //    - Subscribe to innerObs:
  //        - next: forward to subscriber.next()
  //        - error: forward to subscriber.error()
  //        - complete: isProcessing = false, processNext()
  // 4. Subscribe to outer:
  //    - next(inner): queue.push(inner), processNext()
  //    - error(e): subscriber.error(e)
  //    - complete(): outerComplete = true, processNext()
  // 5. Return cleanup that unsubscribes from outer and current inner
}
