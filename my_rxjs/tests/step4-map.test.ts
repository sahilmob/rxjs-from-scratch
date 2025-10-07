import { describe, it, expect, vi } from "vitest";
import { of } from "../src/observable/of";
import { from } from "../src/observable/from";
import { map } from "../src/operators/map";
import { Observable } from "../src/core/Observable";

describe("Step 4: Map Operator", () => {
  describe("Basic transformation", () => {
    it("should map values using a projection function", () => {
      const values: number[] = [];
      of(1, 2, 3)
        .pipe(map((x) => x * 2))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([2, 4, 6]);
    });

    it("should work with single value", () => {
      const values: number[] = [];
      of(5)
        .pipe(map((x) => x * 10))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([50]);
    });

    it("should work with no values (empty)", () => {
      const values: number[] = [];
      from([])
        .pipe(map((x: number) => x * 2))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([]);
    });

    it("should transform to different type", () => {
      const values: string[] = [];
      of(1, 2, 3)
        .pipe(map((x) => `Value: ${x}`))
        .subscribe((value) => values.push(value));

      expect(values).toEqual(["Value: 1", "Value: 2", "Value: 3"]);
    });

    it("should work with complex transformations", () => {
      const values: { original: number; doubled: number }[] = [];
      of(1, 2, 3)
        .pipe(map((x) => ({ original: x, doubled: x * 2 })))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([
        { original: 1, doubled: 2 },
        { original: 2, doubled: 4 },
        { original: 3, doubled: 6 },
      ]);
    });
  });

  describe("Chaining multiple maps", () => {
    it("should chain multiple map operators", () => {
      const values: number[] = [];
      of(1, 2, 3)
        .pipe(
          map((x) => x + 1), // 2, 3, 4
          map((x) => x * 2), // 4, 6, 8
          map((x) => x - 1) // 3, 5, 7
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([3, 5, 7]);
    });

    it("should chain map with type changes", () => {
      const values: boolean[] = [];
      of(1, 2, 3)
        .pipe(
          map((x) => x * 10), // 10, 20, 30
          map((x) => x.toString()), // "10", "20", "30"
          map((x) => x.length > 1) // true, true, true
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([true, true, true]);
    });
  });

  describe("Index parameter (bonus)", () => {
    it("should provide index to projection function", () => {
      const values: string[] = [];
      of("a", "b", "c")
        .pipe(map((value, index) => `${index}: ${value}`))
        .subscribe((value) => values.push(value));

      expect(values).toEqual(["0: a", "1: b", "2: c"]);
    });

    it("should increment index correctly", () => {
      const indices: number[] = [];
      of(10, 20, 30)
        .pipe(
          map((value, index) => {
            indices.push(index);
            return value;
          })
        )
        .subscribe(() => {});

      expect(indices).toEqual([0, 1, 2]);
    });

    it("should reset index for each subscription", () => {
      const source = of("x", "y");
      const transform = map(
        (value: string, index: number) => `${index}:${value}`
      );

      const values1: string[] = [];
      const values2: string[] = [];

      source.pipe(transform).subscribe((v) => values1.push(v));
      source.pipe(transform).subscribe((v) => values2.push(v));

      expect(values1).toEqual(["0:x", "1:y"]);
      expect(values2).toEqual(["0:x", "1:y"]); // Index resets
    });
  });

  describe("Error handling", () => {
    it("should propagate errors from source", () => {
      const errorOp = () =>
        new Observable((subscriber: any) => {
          subscriber.next(1);
          subscriber.error(new Error("Source error"));
        });

      let errorReceived: any;
      const values: number[] = [];

      errorOp()
        .pipe(map((x: any) => x * 2))
        .subscribe({
          next: (value) => values.push(value),
          error: (err) => (errorReceived = err),
        });

      expect(values).toEqual([2]);
      expect(errorReceived).toBeInstanceOf(Error);
      expect(errorReceived.message).toBe("Source error");
    });

    it("should handle errors thrown in projection function", () => {
      let errorReceived: any;
      const values: number[] = [];

      of(1, 2, 3)
        .pipe(
          map((x) => {
            if (x === 2) throw new Error("Projection error");
            return x * 2;
          })
        )
        .subscribe({
          next: (value) => values.push(value),
          error: (err) => (errorReceived = err),
        });

      expect(values).toEqual([2]); // Only first value before error
      expect(errorReceived).toBeInstanceOf(Error);
      expect(errorReceived.message).toBe("Projection error");
    });

    it("should not emit after error", () => {
      const values: number[] = [];
      let errorReceived: any;

      of(1, 2, 3, 4)
        .pipe(
          map((x) => {
            if (x === 3) throw new Error("Stop here");
            return x;
          })
        )
        .subscribe({
          next: (value) => values.push(value),
          error: (err) => (errorReceived = err),
        });

      expect(values).toEqual([1, 2]);
      expect(errorReceived).toBeDefined();
    });
  });

  describe("Completion", () => {
    it("should complete when source completes", () => {
      let completed = false;
      of(1, 2, 3)
        .pipe(map((x) => x * 2))
        .subscribe({
          complete: () => (completed = true),
        });

      expect(completed).toBe(true);
    });

    it("should not complete if source does not complete", () => {
      let completed = false;
      const neverCompletes = new Observable((subscriber: any) => {
        subscriber.next(1);
        // Never calls complete()
      });

      neverCompletes.pipe(map((x: any) => x * 2)).subscribe({
        complete: () => (completed = true),
      });

      expect(completed).toBe(false);
    });
  });

  describe("Unsubscription", () => {
    it("should stop emitting after unsubscription", () => {
      const values: number[] = [];
      let subscription: any;

      subscription = of(1, 2, 3, 4, 5)
        .pipe(map((x) => x * 2))
        .subscribe({
          next: (value) => {
            values.push(value);
            if (value === 6) {
              subscription.unsubscribe();
            }
          },
        });

      expect(values).toEqual([2, 4, 6]);
    });
  });

  describe("Integration with other operators", () => {
    it("should work in complex pipelines", () => {
      const values: number[] = [];

      of(1, 2, 3, 4, 5)
        .pipe(
          map((x) => x * 2), // 2, 4, 6, 8, 10
          map((x) => x + 1), // 3, 5, 7, 9, 11
          map((x) => x / 2) // 1.5, 2.5, 3.5, 4.5, 5.5
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1.5, 2.5, 3.5, 4.5, 5.5]);
    });
  });

  describe("Edge cases", () => {
    it("should handle null and undefined values", () => {
      const values: any[] = [];
      of(null, undefined, 0, false)
        .pipe(map((x) => `Value: ${x}`))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([
        "Value: null",
        "Value: undefined",
        "Value: 0",
        "Value: false",
      ]);
    });

    it("should work with identity function", () => {
      const values: number[] = [];
      of(1, 2, 3)
        .pipe(map((x) => x))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3]);
    });

    it("should allow returning the same value repeatedly", () => {
      const values: string[] = [];
      of(1, 2, 3)
        .pipe(map(() => "same"))
        .subscribe((value) => values.push(value));

      expect(values).toEqual(["same", "same", "same"]);
    });
  });
});
