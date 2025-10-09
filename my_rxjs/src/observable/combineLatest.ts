import { Observable } from "../core/Observable";
import { Subscription } from "../core/Subscription";

/**
 * combineLatest() - Combine latest values from multiple observables
 *
 * CONCEPT:
 * - Waits for ALL observables to emit at least once
 * - Then emits an array of latest values whenever ANY source emits
 * - Always emits the LATEST value from each observable
 * - Completes when ALL source observables complete
 *
 * KEY DIFFERENCE FROM MERGE/CONCAT:
 * - merge: emits individual values as they come (interleaved)
 * - concat: emits all values from each observable (sequential)
 * - combineLatest: emits ARRAYS of latest values (combined)
 *
 * EXAMPLE:
 * ```typescript
 * const a$ = of(1, 2, 3);
 * const b$ = of('a', 'b');
 *
 * combineLatest([a$, b$]).subscribe(console.log);
 * // Output:
 * // [1, 'a']  // Both have emitted at least once
 * // [2, 'a']  // a$ emits 2, b$ still 'a'
 * // [3, 'a']  // a$ emits 3, b$ still 'a'
 * // [3, 'b']  // a$ still 3, b$ emits 'b'
 * ```
 *
 * MARBLE DIAGRAM:
 * ```
 * a$:  -1---2---3-|
 * b$:  ---a---b---|
 *
 * combineLatest([a$, b$]):
 *      ---[1,a]-[2,a]-[3,a]-[3,b]-|
 *          ^     ^     ^     ^
 *      Both     a$    a$    b$
 *      ready  emits  emits emits
 * ```
 *
 * KEY CONCEPTS:
 * 1. Initial emission requirement - MUST wait for all observables to emit once
 * 2. Latest value tracking - Store latest value from each observable
 * 3. Emission trigger - ANY observable emitting triggers new combined emission
 * 4. Completion logic - Complete when ALL complete
 * 5. hasValue flags - Track which observables have emitted
 *
 * IMPLEMENTATION STRATEGY:
 * 1. Create arrays to track latest values and hasValue flags
 * 2. Subscribe to all observables simultaneously
 * 3. When any observable emits:
 *    - Store the new value
 *    - Mark hasValue = true for that observable
 *    - If ALL have emitted, emit array of all latest values
 * 4. Track completions - complete only when ALL complete
 *
 * TODO: Implement combineLatest creation function
 *
 * HINTS:
 * - Use arrays: latestValues[] and hasValue[] (indexed by observable)
 * - Check if all have emitted: hasValue.every(v => v === true)
 * - Only emit after all have emitted at least once
 * - Track completion count like in merge()
 *
 * @param observables - Array of observables to combine
 * @returns Observable that emits arrays of latest values
 */
export function combineLatest<T>(
  observables: Observable<T>[]
): Observable<T[]> {
  // TODO: Implement combineLatest logic
  //
  return new Observable((s) => {
    if (observables.length === 0) {
      s.next([]);
      s.complete();
      return;
    }

    let allEmitted = false;
    let completedCount = 0;
    const subs: Subscription[] = [];
    const values = Array(observables.length);
    const emitted = Array(observables.length).fill(false);

    // Buffer emissions during subscription setup
    let inSetupPhase = true;
    const buffer: Array<{ index: number; value: any }> = [];

    const tryEmit = () => {
      if (allEmitted) {
        s.next([...values]);
      } else {
        allEmitted = emitted.every((v) => v === true);
        if (allEmitted) {
          s.next([...values]);
          allEmitted = true; // Ensure we don't check again
        }
      }
    };

    const checkComplete = () => {
      if (!inSetupPhase && completedCount === observables.length) {
        s.complete();
      }
    };

    // Subscribe to all observables, buffering emissions
    observables.forEach((obs, i) => {
      const sub = obs.subscribe({
        next: (v) => {
          values[i] = v;
          emitted[i] = true;

          if (inSetupPhase) {
            // Buffer emission during setup
            buffer.push({ index: i, value: v });
          } else {
            // After setup, emit immediately
            tryEmit();
          }
        },
        error: (e) => s.error(e),
        complete: () => {
          completedCount++;
          checkComplete();
        },
      });
      subs.push(sub);
    });

    // Subscription setup complete - replay buffered emissions
    inSetupPhase = false;

    buffer.forEach(({ index, value }) => {
      values[index] = value;
      tryEmit();
    });

    // Now check if we should complete
    checkComplete();

    return () => subs.forEach((s) => s.unsubscribe());
  });

  // Steps:
  // 1. Return new Observable((subscriber) => { ... })
  // 2. Handle empty array edge case
  // 3. Create state tracking:
  //    - const latestValues: T[] = new Array(observables.length)
  //    - const hasValue: boolean[] = new Array(observables.length).fill(false)
  //    - let completedCount = 0
  // 4. Helper function: tryEmit()
  //    - Check if all hasValue are true
  //    - If yes: subscriber.next([...latestValues])
  // 5. Subscribe to each observable with index:
  //    - next(value):
  //        - latestValues[index] = value
  //        - hasValue[index] = true
  //        - tryEmit()
  //    - error(e): subscriber.error(e)
  //    - complete():
  //        - completedCount++
  //        - if completedCount === observables.length: subscriber.complete()
  // 6. Return cleanup function
}
