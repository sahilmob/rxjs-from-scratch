import { describe, it, expect, vi } from "vitest";
import { Observable } from "../src/core/Observable";
import { of } from "../src/observable/of";
import { combineLatest } from "../src/observable/combineLatest";
import { withLatestFrom } from "../src/operators/withLatestFrom";

describe("Step 11: CombineLatest & WithLatestFrom", () => {
  describe("combineLatest()", () => {
    it("should combine latest values from two observables", () => {
      const results: any[] = [];

      const a$ = of(1, 2, 3);
      const b$ = of("a", "b");

      combineLatest([a$, b$]).subscribe({
        next: (v) => results.push(v),
      });

      // Should emit combined arrays
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toEqual([expect.any(Number), expect.any(String)]);
    });

    it("should wait for all observables to emit before emitting", () => {
      const results: any[] = [];
      const emissions: string[] = [];

      const a$ = new Observable<number>((subscriber) => {
        emissions.push("a1");
        subscriber.next(1);
        emissions.push("a2");
        subscriber.next(2);
        subscriber.complete();
      });

      const b$ = new Observable<string>((subscriber) => {
        emissions.push("b1");
        subscriber.next("x");
        emissions.push("b2");
        subscriber.next("y");
        subscriber.complete();
      });

      combineLatest([a$, b$]).subscribe({
        next: (v) => results.push(v),
      });

      // Should not emit until both have emitted
      expect(results.length).toBeGreaterThan(0);
      // First emission should have values from both
      expect(results[0]).toHaveLength(2);
    });

    it("should emit when any observable emits after initial", () => {
      const results: [number, string][] = [];

      const a$ = of(1, 2);
      const b$ = of("a");

      combineLatest([a$, b$]).subscribe({
        next: (v) => results.push(v as [number, string]),
      });

      // Should have multiple emissions
      expect(results.length).toBeGreaterThanOrEqual(2);
      // Should contain latest values
      expect(results).toContainEqual([1, "a"]);
      expect(results).toContainEqual([2, "a"]);
    });

    it("should emit array of all latest values", () => {
      const results: any[][] = [];

      const a$ = of(1, 2, 3);
      const b$ = of("a", "b", "c");

      combineLatest([a$, b$]).subscribe({
        next: (v) => results.push(v),
      });

      // Each result should be an array of length 2
      results.forEach((result) => {
        expect(result).toBeInstanceOf(Array);
        expect(result).toHaveLength(2);
        expect(typeof result[0]).toBe("number");
        expect(typeof result[1]).toBe("string");
      });
    });

    it("should complete when all observables complete", () => {
      let completed = false;

      const a$ = of(1, 2);
      const b$ = of("a", "b");

      combineLatest([a$, b$]).subscribe({
        complete: () => {
          completed = true;
        },
      });

      expect(completed).toBe(true);
    });

    it("should work with three observables", () => {
      const results: any[] = [];

      const a$ = of(1);
      const b$ = of("a");
      const c$ = of(true);

      combineLatest([a$, b$, c$]).subscribe({
        next: (v) => results.push(v),
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toEqual([1, "a", true]);
    });

    it("should handle single observable", () => {
      const results: any[] = [];

      combineLatest([of(1, 2, 3)]).subscribe({
        next: (v) => results.push(v),
      });

      expect(results).toEqual([[1], [2], [3]]);
    });

    it("should handle empty array", () => {
      const results: any[] = [];
      let completed = false;

      combineLatest([]).subscribe({
        next: (v) => results.push(v),
        complete: () => {
          completed = true;
        },
      });

      expect(results).toEqual([[]]);
      expect(completed).toBe(true);
    });

    it("should propagate errors from any observable", () => {
      let errorReceived: any;

      const error$ = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.error(new Error("Test error"));
      });

      const other$ = of(2, 3);

      combineLatest([error$, other$]).subscribe({
        error: (err) => {
          errorReceived = err;
        },
      });

      expect(errorReceived).toBeInstanceOf(Error);
      expect(errorReceived.message).toBe("Test error");
    });

    it("should emit latest values when any source emits", () => {
      const results: [number, string][] = [];

      const a$ = new Observable<number>((subscriber) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.next(3);
        subscriber.complete();
      });

      const b$ = new Observable<string>((subscriber) => {
        subscriber.next("a");
        subscriber.complete();
      });

      combineLatest([a$, b$]).subscribe({
        next: (v) => results.push(v as [number, string]),
      });

      // Should emit for each a$ emission after both have emitted
      expect(results.length).toBeGreaterThanOrEqual(3);
      expect(results).toContainEqual([1, "a"]);
      expect(results).toContainEqual([2, "a"]);
      expect(results).toContainEqual([3, "a"]);
    });

    it("should not emit until all have emitted at least once", () => {
      const results: any[] = [];

      const fast$ = of(1, 2, 3);
      const slow$ = new Observable<string>((subscriber) => {
        setTimeout(() => {
          subscriber.next("slow");
          subscriber.complete();
        }, 10);
      });

      combineLatest([fast$, slow$]).subscribe({
        next: (v) => results.push(v),
      });

      // Should not emit synchronously (slow hasn't emitted yet)
      expect(results).toEqual([]);

      setTimeout(() => {
        // Now should have emitted
        expect(results.length).toBeGreaterThan(0);
        expect(results[0]).toContain("slow");
      }, 20);
    });

    it("should unsubscribe from all observables", () => {
      const unsubscribe1 = vi.fn();
      const unsubscribe2 = vi.fn();

      const obs1$ = new Observable((subscriber) => {
        subscriber.next(1);
        return unsubscribe1;
      });

      const obs2$ = new Observable((subscriber) => {
        subscriber.next(2);
        return unsubscribe2;
      });

      const subscription = combineLatest([obs1$, obs2$]).subscribe({});
      subscription.unsubscribe();

      expect(unsubscribe1).toHaveBeenCalled();
      expect(unsubscribe2).toHaveBeenCalled();
    });

    it("should handle multiple emissions maintaining latest state", () => {
      const results: [number, string][] = [];

      const a$ = new Observable<number>((subscriber) => {
        subscriber.next(1); // [1, 'x']
        subscriber.next(2); // [2, 'x']
        subscriber.complete();
      });

      const b$ = new Observable<string>((subscriber) => {
        subscriber.next("x"); // [1, 'x'] or [2, 'x']
        subscriber.next("y"); // [2, 'y']
        subscriber.complete();
      });

      combineLatest([a$, b$]).subscribe({
        next: (v) => results.push(v as [number, string]),
      });

      // Should have captured changing state
      expect(results.length).toBeGreaterThanOrEqual(2);
      // Last emission should have latest from both
      const last = results[results.length - 1];
      expect(last[0]).toBe(2);
      expect(last[1]).toBe("y");
    });

    it("should work with observables of different types", () => {
      const results: [number, string, boolean][] = [];

      const numbers$ = of(1, 2);
      const strings$ = of("a");
      const booleans$ = of(true, false);

      combineLatest([numbers$, strings$, booleans$]).subscribe({
        next: (v) => results.push(v as [number, string, boolean]),
      });

      expect(results.length).toBeGreaterThan(0);
      results.forEach((result) => {
        expect(typeof result[0]).toBe("number");
        expect(typeof result[1]).toBe("string");
        expect(typeof result[2]).toBe("boolean");
      });
    });
  });

  describe("withLatestFrom()", () => {
    it("should combine source with latest from other observables", () => {
      const results: any[] = [];

      const source$ = of(1, 2, 3);
      const other$ = of("a", "b", "c");

      source$.pipe(withLatestFrom(other$)).subscribe({
        next: (v) => results.push(v),
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toBeInstanceOf(Array);
      expect(results[0]).toHaveLength(2);
    });

    it("should only emit when source emits", () => {
      const results: [number, string][] = [];
      const sourceEmissions: number[] = [];
      const otherEmissions: string[] = [];

      const source$ = new Observable<number>((subscriber) => {
        sourceEmissions.push(1);
        subscriber.next(1);
        sourceEmissions.push(2);
        subscriber.next(2);
        subscriber.complete();
      });

      const other$ = new Observable<string>((subscriber) => {
        otherEmissions.push("a");
        subscriber.next("a");
        otherEmissions.push("b");
        subscriber.next("b");
        otherEmissions.push("c");
        subscriber.next("c");
        subscriber.complete();
      });

      source$.pipe(withLatestFrom(other$)).subscribe({
        next: (v) => results.push(v as [number, string]),
      });

      // Should have emissions equal to source emissions (not other)
      expect(results.length).toBe(sourceEmissions.length);
    });

    it("should sample latest value from other observable", () => {
      const results: [number, string][] = [];

      const source$ = new Observable<number>((subscriber) => {
        subscriber.next(1); // other is 'a'
        subscriber.next(2); // other is 'c'
        subscriber.complete();
      });

      const other$ = new Observable<string>((subscriber) => {
        subscriber.next("a");
        subscriber.next("b");
        subscriber.next("c");
        subscriber.complete();
      });

      source$.pipe(withLatestFrom(other$)).subscribe({
        next: (v) => results.push(v as [number, string]),
      });

      // Should sample whatever the latest value is at time of source emission
      expect(results.length).toBe(2);
      expect(results[0][0]).toBe(1);
      expect(results[1][0]).toBe(2);
    });

    it("should not emit until all observables have emitted", () => {
      const results: any[] = [];

      const source$ = new Observable<number>((subscriber) => {
        subscriber.next(1); // other hasn't emitted - don't emit
        setTimeout(() => {
          subscriber.next(2); // other has emitted - emit!
          subscriber.complete();
        }, 10);
      });

      const other$ = new Observable<string>((subscriber) => {
        setTimeout(() => {
          subscriber.next("a");
          subscriber.complete();
        }, 5);
      });

      source$.pipe(withLatestFrom(other$)).subscribe({
        next: (v) => results.push(v),
      });

      // First source emission before other - no output
      expect(results).toEqual([]);

      setTimeout(() => {
        // Second source emission after other - should have output
        expect(results.length).toBe(1);
        expect(results[0]).toEqual([2, "a"]);
      }, 20);
    });

    it("should complete when source completes", () => {
      let completed = false;

      const source$ = of(1, 2);
      const other$ = new Observable((subscriber) => {
        subscriber.next("a");
        // Never completes!
      });

      source$.pipe(withLatestFrom(other$)).subscribe({
        complete: () => {
          completed = true;
        },
      });

      // Should complete when source completes (ignore other)
      expect(completed).toBe(true);
    });

    it("should work with multiple other observables", () => {
      const results: [number, string, boolean][] = [];

      const source$ = of(1, 2);
      const other1$ = of("a", "b");
      const other2$ = of(true, false);

      source$.pipe(withLatestFrom(other1$, other2$)).subscribe({
        next: (v) => results.push(v as [number, string, boolean]),
      });

      expect(results.length).toBeGreaterThan(0);
      results.forEach((result) => {
        expect(result).toHaveLength(3);
        expect(typeof result[0]).toBe("number");
        expect(typeof result[1]).toBe("string");
        expect(typeof result[2]).toBe("boolean");
      });
    });

    it("should propagate errors from source", () => {
      let errorReceived: any;

      const source$ = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.error(new Error("Source error"));
      });

      const other$ = of("a");

      source$.pipe(withLatestFrom(other$)).subscribe({
        error: (err) => {
          errorReceived = err;
        },
      });

      expect(errorReceived).toBeInstanceOf(Error);
      expect(errorReceived.message).toBe("Source error");
    });

    it("should propagate errors from other observables", () => {
      let errorReceived: any;

      const source$ = of(1, 2, 3);
      const other$ = new Observable((subscriber) => {
        subscriber.next("a");
        subscriber.error(new Error("Other error"));
      });

      source$.pipe(withLatestFrom(other$)).subscribe({
        error: (err) => {
          errorReceived = err;
        },
      });

      expect(errorReceived).toBeInstanceOf(Error);
      expect(errorReceived.message).toBe("Other error");
    });

    it("should work with no other observables", () => {
      const results: any[] = [];

      of(1, 2, 3)
        .pipe(withLatestFrom())
        .subscribe({
          next: (v) => results.push(v),
        });

      // Should just pass through source values
      expect(results).toEqual([1, 2, 3]);
    });

    it("should unsubscribe from all observables", () => {
      const sourceUnsub = vi.fn();
      const otherUnsub = vi.fn();

      const source$ = new Observable((subscriber) => {
        subscriber.next(1);
        return sourceUnsub;
      });

      const other$ = new Observable((subscriber) => {
        subscriber.next("a");
        return otherUnsub;
      });

      const subscription = source$.pipe(withLatestFrom(other$)).subscribe({});
      subscription.unsubscribe();

      expect(sourceUnsub).toHaveBeenCalled();
      expect(otherUnsub).toHaveBeenCalled();
    });

    it("should maintain latest values across source emissions", () => {
      const results: [number, string][] = [];

      const source$ = new Observable<number>((subscriber) => {
        subscriber.next(1); // other is 'a'
        subscriber.next(2); // other is 'b'
        subscriber.next(3); // other is 'c'
        subscriber.complete();
      });

      const other$ = new Observable<string>((subscriber) => {
        subscriber.next("a");
        subscriber.next("b");
        subscriber.next("c");
        subscriber.complete();
      });

      source$.pipe(withLatestFrom(other$)).subscribe({
        next: (v) => results.push(v as [number, string]),
      });

      expect(results.length).toBe(3);
      expect(results[0]).toEqual([1, expect.any(String)]);
      expect(results[1]).toEqual([2, expect.any(String)]);
      expect(results[2]).toEqual([3, expect.any(String)]);
    });
  });

  describe("Integration: Comparing combineLatest and withLatestFrom", () => {
    it("combineLatest emits on any source, withLatestFrom only on main source", () => {
      const combineResults: any[] = [];
      const withLatestResults: any[] = [];

      const main$ = of(1, 2);
      const other$ = of("a", "b", "c");

      // combineLatest emits when ANY emits
      combineLatest([main$, other$]).subscribe({
        next: (v) => combineResults.push(v),
      });

      // withLatestFrom emits only when main emits
      main$.pipe(withLatestFrom(other$)).subscribe({
        next: (v) => withLatestResults.push(v),
      });

      // combineLatest should have more emissions (responds to 'other' too)
      expect(combineResults.length).toBeGreaterThanOrEqual(
        withLatestResults.length
      );
    });

    it("both wait for all observables to emit before first emission", () => {
      const combineResults: any[] = [];
      const withLatestResults: any[] = [];

      const fast$ = of(1, 2, 3);
      const slow$ = new Observable<string>((subscriber) => {
        setTimeout(() => {
          subscriber.next("slow");
          subscriber.complete();
        }, 10);
      });

      combineLatest([fast$, slow$]).subscribe({
        next: (v) => combineResults.push(v),
      });

      fast$.pipe(withLatestFrom(slow$)).subscribe({
        next: (v) => withLatestResults.push(v),
      });

      // Both should wait for slow
      expect(combineResults).toEqual([]);
      expect(withLatestResults).toEqual([]);

      setTimeout(() => {
        expect(combineResults.length).toBeGreaterThan(0);
        expect(withLatestResults.length).toBeGreaterThan(0);
      }, 20);
    });

    it("combineLatest for reactive state updates, withLatestFrom for triggered actions", () => {
      const stateUpdates: any[] = [];
      const actions: any[] = [];

      // State changes frequently
      const state$ = new Observable<{ count: number }>((subscriber) => {
        subscriber.next({ count: 0 });
        subscriber.next({ count: 1 });
        subscriber.next({ count: 2 });
        subscriber.complete();
      });

      // User clicks occasionally
      const click$ = new Observable<string>((subscriber) => {
        subscriber.next("click1");
        subscriber.next("click2");
        subscriber.complete();
      });

      // React to any state change
      combineLatest([state$, click$]).subscribe({
        next: (v) => stateUpdates.push(v),
      });

      // Only act on clicks (with current state)
      click$.pipe(withLatestFrom(state$)).subscribe({
        next: (v) => actions.push(v),
      });

      // State updates should have more emissions
      expect(stateUpdates.length).toBeGreaterThan(actions.length);
      // Actions should only match click count
      expect(actions.length).toBe(2);
    });
  });
});
