import { describe, it, expect, vi } from "vitest";
import { mergeMap, flatMap } from "../src/operators/mergeMap";
import { Observable } from "../src/core/Observable";
import { of } from "../src/observable/of";

describe.skip("Step 15: MergeMap (FlatMap)", () => {
  describe("Basic MergeMap Behavior", () => {
    it("should map each value to an observable and flatten", () => {
      const results: number[] = [];

      of(1, 2, 3)
        .pipe(mergeMap((x) => of(x * 10)))
        .subscribe((x) => results.push(x));

      expect(results).toEqual([10, 20, 30]);
    });

    it("should flatten multiple values from each inner observable", () => {
      const results: number[] = [];

      of(1, 2)
        .pipe(mergeMap((x) => of(x * 10, x * 100)))
        .subscribe((x) => results.push(x));

      expect(results).toEqual([10, 100, 20, 200]);
    });

    it("should pass index to projection function", () => {
      const indices: number[] = [];

      of("a", "b", "c")
        .pipe(
          mergeMap((value, index) => {
            indices.push(index);
            return of(value);
          })
        )
        .subscribe();

      expect(indices).toEqual([0, 1, 2]);
    });

    it("should work with empty source", () => {
      const results: number[] = [];
      let completed = false;

      new Observable((s) => s.complete())
        .pipe(mergeMap((x: number) => of(x * 10)))
        .subscribe({
          next: (x) => results.push(x),
          complete: () => (completed = true),
        });

      expect(results).toEqual([]);
      expect(completed).toBe(true);
    });
  });

  describe("Concurrent Inner Subscriptions", () => {
    it("should subscribe to all inner observables immediately (concurrent)", () => {
      const subscriptions: number[] = [];
      const results: number[] = [];

      of(1, 2, 3)
        .pipe(
          mergeMap((x) => {
            subscriptions.push(x);
            return of(x * 10);
          })
        )
        .subscribe((x) => results.push(x));

      // All 3 inner observables subscribe immediately (before any complete)
      expect(subscriptions).toEqual([1, 2, 3]);
      expect(results).toEqual([10, 20, 30]);
    });

    it("should handle async inner observables concurrently", (done) => {
      const results: string[] = [];

      of(1, 2, 3)
        .pipe(
          mergeMap((x) =>
            new Observable<string>((s) => {
              setTimeout(() => {
                s.next(`result-${x}`);
                s.complete();
              }, 10 * (4 - x)); // 1 takes 30ms, 2 takes 20ms, 3 takes 10ms
            })
          )
        )
        .subscribe({
          next: (x) => results.push(x),
          complete: () => {
            // Should arrive in order: 3 (10ms), 2 (20ms), 1 (30ms)
            expect(results).toEqual(["result-3", "result-2", "result-1"]);
            done();
          },
        });
    }, 100);
  });

  describe("Completion Behavior", () => {
    it("should complete when source completes and all inner observables complete", () => {
      const results: number[] = [];
      let completed = false;

      of(1, 2, 3)
        .pipe(mergeMap((x) => of(x * 10)))
        .subscribe({
          next: (x) => results.push(x),
          complete: () => (completed = true),
        });

      expect(completed).toBe(true);
      expect(results).toEqual([10, 20, 30]);
    });

    it("should not complete until all inner observables complete", (done) => {
      const results: number[] = [];
      let completed = false;

      of(1, 2)
        .pipe(
          mergeMap((x) =>
            new Observable<number>((s) => {
              setTimeout(() => {
                s.next(x * 10);
                s.complete();
              }, x * 10);
            })
          )
        )
        .subscribe({
          next: (x) => results.push(x),
          complete: () => {
            completed = true;
            // Should have all results before completing
            expect(results).toEqual([10, 20]);
            done();
          },
        });

      // Should not complete immediately
      expect(completed).toBe(false);
    }, 100);

    it("should complete immediately if source emits no values", () => {
      let completed = false;

      new Observable((s) => s.complete())
        .pipe(mergeMap((x: number) => of(x * 10)))
        .subscribe({
          complete: () => (completed = true),
        });

      expect(completed).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should propagate errors from inner observables", () => {
      const results: number[] = [];
      let errorReceived: any;

      of(1, 2, 3)
        .pipe(
          mergeMap((x) =>
            new Observable<number>((s) => {
              if (x === 2) {
                s.error(new Error("Inner error"));
              } else {
                s.next(x * 10);
                s.complete();
              }
            })
          )
        )
        .subscribe({
          next: (x) => results.push(x),
          error: (err) => (errorReceived = err),
        });

      expect(results).toEqual([10]); // Got first value before error
      expect(errorReceived).toBeInstanceOf(Error);
      expect(errorReceived.message).toBe("Inner error");
    });

    it("should propagate errors from source observable", () => {
      let errorReceived: any;

      new Observable((s) => {
        s.next(1);
        s.error(new Error("Source error"));
      })
        .pipe(mergeMap((x: number) => of(x * 10)))
        .subscribe({
          error: (err) => (errorReceived = err),
        });

      expect(errorReceived).toBeInstanceOf(Error);
      expect(errorReceived.message).toBe("Source error");
    });

    it("should handle projection function errors", () => {
      let errorReceived: any;

      of(1, 2, 3)
        .pipe(
          mergeMap((x) => {
            if (x === 2) {
              throw new Error("Projection error");
            }
            return of(x * 10);
          })
        )
        .subscribe({
          error: (err) => (errorReceived = err),
        });

      expect(errorReceived).toBeInstanceOf(Error);
      expect(errorReceived.message).toBe("Projection error");
    });
  });

  describe("Unsubscription", () => {
    it("should unsubscribe from source and all inner observables", () => {
      const innerUnsubs: number[] = [];
      let sourceUnsubbed = false;

      const subscription = of(1, 2, 3)
        .pipe(
          mergeMap((x) =>
            new Observable<number>((s) => {
              s.next(x * 10);
              return () => innerUnsubs.push(x);
            })
          )
        )
        .subscribe();

      subscription.unsubscribe();

      // All inner observables should be unsubscribed
      expect(innerUnsubs.length).toBe(3);
      expect(innerUnsubs).toContain(1);
      expect(innerUnsubs).toContain(2);
      expect(innerUnsubs).toContain(3);
    });

    it("should not subscribe to new inner observables after unsubscribe", () => {
      const subscriptionCounts: number[] = [];

      const source = new Observable<number>((s) => {
        s.next(1);
        setTimeout(() => s.next(2), 10);
        setTimeout(() => s.next(3), 20);
      });

      const subscription = source
        .pipe(
          mergeMap((x) => {
            subscriptionCounts.push(x);
            return of(x * 10);
          })
        )
        .subscribe();

      // Unsubscribe immediately (before async emissions)
      subscription.unsubscribe();

      setTimeout(() => {
        // Should only have subscribed to first value
        expect(subscriptionCounts).toEqual([1]);
      }, 50);
    });
  });

  describe("Comparison with Map", () => {
    it("should flatten inner observables (unlike map)", () => {
      const results: number[] = [];

      // mergeMap flattens
      of(1, 2, 3)
        .pipe(mergeMap((x) => of(x * 10)))
        .subscribe((x) => results.push(x));

      expect(results).toEqual([10, 20, 30]); // Gets numbers, not observables
    });

    it("demonstrates why map alone doesn't work for observables", () => {
      const results: any[] = [];

      // map doesn't flatten - returns Observable<Observable<number>>
      of(1, 2, 3)
        .pipe(
          (source) =>
            new Observable((subscriber) =>
              source.subscribe({
                next: (x) => subscriber.next(of(x * 10)), // Returns observable!
                error: (e) => subscriber.error(e),
                complete: () => subscriber.complete(),
              })
            )
        )
        .subscribe((x) => results.push(x));

      // Results are observables, not numbers!
      expect(results.length).toBe(3);
      expect(results[0]).toBeInstanceOf(Observable);
      expect(results[1]).toBeInstanceOf(Observable);
      expect(results[2]).toBeInstanceOf(Observable);
    });
  });

  describe("Common Use Cases", () => {
    it("should work for parallel API requests", () => {
      // Simulate fetching user details for multiple IDs
      const fetchUser = (id: number) =>
        new Observable<{ id: number; name: string }>((s) => {
          setTimeout(() => {
            s.next({ id, name: `User${id}` });
            s.complete();
          }, 10);
        });

      const results: any[] = [];

      of(1, 2, 3)
        .pipe(mergeMap((id) => fetchUser(id)))
        .subscribe({
          next: (user) => results.push(user),
          complete: () => {
            expect(results.length).toBe(3);
            expect(results[0]).toEqual({ id: 1, name: "User1" });
            expect(results[1]).toEqual({ id: 2, name: "User2" });
            expect(results[2]).toEqual({ id: 3, name: "User3" });
          },
        });
    });

    it("should handle nested observables", () => {
      const results: string[] = [];

      of(1, 2)
        .pipe(
          mergeMap((x) =>
            of("a", "b").pipe(
              mergeMap((y) => of(`${x}-${y}`))
            )
          )
        )
        .subscribe((x) => results.push(x));

      expect(results).toEqual(["1-a", "1-b", "2-a", "2-b"]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle inner observable that emits nothing", () => {
      const results: number[] = [];
      let completed = false;

      of(1, 2, 3)
        .pipe(
          mergeMap((x) =>
            x === 2
              ? new Observable((s) => s.complete()) // Empty inner
              : of(x * 10)
          )
        )
        .subscribe({
          next: (x) => results.push(x),
          complete: () => (completed = true),
        });

      expect(results).toEqual([10, 30]); // Skips 2
      expect(completed).toBe(true);
    });

    it("should handle projection returning same observable", () => {
      const shared = of(100, 200);
      const results: number[] = [];

      of(1, 2)
        .pipe(mergeMap(() => shared))
        .subscribe((x) => results.push(x));

      // Each outer value subscribes to shared independently
      expect(results).toEqual([100, 200, 100, 200]);
    });

    it("should work with single source value", () => {
      const results: number[] = [];

      of(1)
        .pipe(mergeMap((x) => of(x * 10, x * 100)))
        .subscribe((x) => results.push(x));

      expect(results).toEqual([10, 100]);
    });
  });

  describe("FlatMap Alias", () => {
    it("should be an alias for mergeMap", () => {
      expect(flatMap).toBe(mergeMap);
    });

    it("should work exactly like mergeMap", () => {
      const results: number[] = [];

      of(1, 2, 3)
        .pipe(flatMap((x) => of(x * 10)))
        .subscribe((x) => results.push(x));

      expect(results).toEqual([10, 20, 30]);
    });
  });

  describe("Integration with Other Operators", () => {
    it("should work with filter", () => {
      const results: number[] = [];

      of(1, 2, 3, 4, 5)
        .pipe(
          (source) =>
            new Observable((s) =>
              source.subscribe({
                next: (x) => {
                  if (x % 2 === 0) s.next(x);
                },
                error: (e) => s.error(e),
                complete: () => s.complete(),
              })
            ), // filter even
          mergeMap((x) => of(x * 10))
        )
        .subscribe((x) => results.push(x));

      expect(results).toEqual([20, 40]);
    });

    it("should work with map", () => {
      const results: number[] = [];

      of(1, 2, 3)
        .pipe(
          (source) =>
            new Observable((s) =>
              source.subscribe({
                next: (x) => s.next(x * 2),
                error: (e) => s.error(e),
                complete: () => s.complete(),
              })
            ), // map x => x * 2
          mergeMap((x) => of(x + 100))
        )
        .subscribe((x) => results.push(x));

      expect(results).toEqual([102, 104, 106]);
    });
  });
});
