import { describe, it, expect, vi } from "vitest";
import { Subject } from "../src/subjects/Subject";

describe.skip("Step 12: Subject", () => {
  describe("Basic Subject Behavior", () => {
    it("should be both Observable and Observer", () => {
      const subject = new Subject<number>();

      // Observable - has subscribe method
      expect(typeof subject.subscribe).toBe("function");

      // Observer - has next, error, complete methods
      expect(typeof subject.next).toBe("function");
      expect(typeof subject.error).toBe("function");
      expect(typeof subject.complete).toBe("function");
    });

    it("should multicast to multiple subscribers", () => {
      const subject = new Subject<number>();
      const results1: number[] = [];
      const results2: number[] = [];

      subject.subscribe((x) => results1.push(x));
      subject.subscribe((x) => results2.push(x));

      subject.next(1);
      subject.next(2);

      // Both subscribers receive all values
      expect(results1).toEqual([1, 2]);
      expect(results2).toEqual([1, 2]);
    });

    it("should not replay past values to new subscribers", () => {
      const subject = new Subject<number>();
      const results1: number[] = [];
      const results2: number[] = [];

      subject.subscribe((x) => results1.push(x));

      subject.next(1);
      subject.next(2);

      // New subscriber after some emissions
      subject.subscribe((x) => results2.push(x));

      subject.next(3);

      // First subscriber gets all values
      expect(results1).toEqual([1, 2, 3]);
      // Second subscriber only gets values after subscription
      expect(results2).toEqual([3]);
    });

    it("should handle manual next() calls", () => {
      const subject = new Subject<string>();
      const results: string[] = [];

      subject.subscribe((x) => results.push(x));

      subject.next("a");
      subject.next("b");
      subject.next("c");

      expect(results).toEqual(["a", "b", "c"]);
    });
  });

  describe("Completion", () => {
    it("should complete all subscribers when complete() is called", () => {
      const subject = new Subject<number>();
      const completed1 = vi.fn();
      const completed2 = vi.fn();

      subject.subscribe({ complete: completed1 });
      subject.subscribe({ complete: completed2 });

      subject.complete();

      expect(completed1).toHaveBeenCalled();
      expect(completed2).toHaveBeenCalled();
    });

    it("should not emit values after complete()", () => {
      const subject = new Subject<number>();
      const results: number[] = [];

      subject.subscribe((x) => results.push(x));

      subject.next(1);
      subject.complete();
      subject.next(2); // Should be ignored

      expect(results).toEqual([1]);
    });

    it("should immediately complete new subscribers after complete()", () => {
      const subject = new Subject<number>();
      const results: number[] = [];
      let completed = false;

      subject.next(1);
      subject.complete();

      // Subscribe after complete
      subject.subscribe({
        next: (x) => results.push(x),
        complete: () => {
          completed = true;
        },
      });

      // Should not receive past values, but should complete immediately
      expect(results).toEqual([]);
      expect(completed).toBe(true);
    });

    it("should ignore multiple complete() calls", () => {
      const subject = new Subject<number>();
      const completeCalls = vi.fn();

      subject.subscribe({ complete: completeCalls });

      subject.complete();
      subject.complete();
      subject.complete();

      // Should only complete once
      expect(completeCalls).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Handling", () => {
    it("should error all subscribers when error() is called", () => {
      const subject = new Subject<number>();
      const error1 = vi.fn();
      const error2 = vi.fn();

      subject.subscribe({ error: error1 });
      subject.subscribe({ error: error2 });

      const testError = new Error("Test error");
      subject.error(testError);

      expect(error1).toHaveBeenCalledWith(testError);
      expect(error2).toHaveBeenCalledWith(testError);
    });

    it("should not emit values after error()", () => {
      const subject = new Subject<number>();
      const results: number[] = [];

      subject.subscribe((x) => results.push(x));

      subject.next(1);
      subject.error(new Error("Test error"));
      subject.next(2); // Should be ignored

      expect(results).toEqual([1]);
    });

    it("should immediately error new subscribers after error()", () => {
      const subject = new Subject<number>();
      const results: number[] = [];
      let errorReceived: any;

      const testError = new Error("Test error");
      subject.next(1);
      subject.error(testError);

      // Subscribe after error
      subject.subscribe({
        next: (x) => results.push(x),
        error: (err) => {
          errorReceived = err;
        },
      });

      // Should not receive past values, but should error immediately
      expect(results).toEqual([]);
      expect(errorReceived).toBe(testError);
    });

    it("should ignore multiple error() calls", () => {
      const subject = new Subject<number>();
      const errorCalls = vi.fn();

      subject.subscribe({ error: errorCalls });

      const error1 = new Error("Error 1");
      const error2 = new Error("Error 2");

      subject.error(error1);
      subject.error(error2);

      // Should only error once with first error
      expect(errorCalls).toHaveBeenCalledTimes(1);
      expect(errorCalls).toHaveBeenCalledWith(error1);
    });

    it("should not complete after error", () => {
      const subject = new Subject<number>();
      const completeCalls = vi.fn();

      subject.subscribe({ complete: completeCalls });

      subject.error(new Error("Test error"));
      subject.complete(); // Should be ignored

      expect(completeCalls).not.toHaveBeenCalled();
    });
  });

  describe("Unsubscription", () => {
    it("should stop receiving values after unsubscribe", () => {
      const subject = new Subject<number>();
      const results: number[] = [];

      const subscription = subject.subscribe((x) => results.push(x));

      subject.next(1);
      subscription.unsubscribe();
      subject.next(2);

      expect(results).toEqual([1]);
    });

    it("should allow some subscribers to unsubscribe while others remain", () => {
      const subject = new Subject<number>();
      const results1: number[] = [];
      const results2: number[] = [];

      const sub1 = subject.subscribe((x) => results1.push(x));
      subject.subscribe((x) => results2.push(x));

      subject.next(1);
      sub1.unsubscribe();
      subject.next(2);

      expect(results1).toEqual([1]);
      expect(results2).toEqual([1, 2]);
    });

    it("should handle unsubscribing all subscribers", () => {
      const subject = new Subject<number>();
      const results1: number[] = [];
      const results2: number[] = [];

      const sub1 = subject.subscribe((x) => results1.push(x));
      const sub2 = subject.subscribe((x) => results2.push(x));

      subject.next(1);
      sub1.unsubscribe();
      sub2.unsubscribe();
      subject.next(2);

      // No subscribers, but subject should still work
      expect(results1).toEqual([1]);
      expect(results2).toEqual([1]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle subscribing with no observers provided", () => {
      const subject = new Subject<number>();

      // Should not throw
      expect(() => {
        const sub = subject.subscribe();
        subject.next(1);
        sub.unsubscribe();
      }).not.toThrow();
    });

    it("should handle subscribing with partial observer", () => {
      const subject = new Subject<number>();
      const results: number[] = [];

      subject.subscribe({
        next: (x) => results.push(x),
        // No error or complete
      });

      subject.next(1);
      subject.complete();

      expect(results).toEqual([1]);
    });

    it("should handle empty subject lifecycle", () => {
      const subject = new Subject<number>();

      // Complete without any emissions
      subject.complete();

      const results: number[] = [];
      let completed = false;

      subject.subscribe({
        next: (x) => results.push(x),
        complete: () => {
          completed = true;
        },
      });

      expect(results).toEqual([]);
      expect(completed).toBe(true);
    });

    it("should work with different types", () => {
      const numberSubject = new Subject<number>();
      const stringSubject = new Subject<string>();
      const objectSubject = new Subject<{ id: number; name: string }>();

      const numberResults: number[] = [];
      const stringResults: string[] = [];
      const objectResults: any[] = [];

      numberSubject.subscribe((x) => numberResults.push(x));
      stringSubject.subscribe((x) => stringResults.push(x));
      objectSubject.subscribe((x) => objectResults.push(x));

      numberSubject.next(42);
      stringSubject.next("hello");
      objectSubject.next({ id: 1, name: "Alice" });

      expect(numberResults).toEqual([42]);
      expect(stringResults).toEqual(["hello"]);
      expect(objectResults).toEqual([{ id: 1, name: "Alice" }]);
    });
  });

  describe("Integration with Operators", () => {
    it("should work with operators", () => {
      const subject = new Subject<number>();
      const results: number[] = [];

      subject
        .pipe(
          (source) =>
            new (require("../src/core/Observable").Observable)((subscriber) =>
              source.subscribe({
                next: (x) => subscriber.next(x * 2),
                error: (e) => subscriber.error(e),
                complete: () => subscriber.complete(),
              })
            )
        )
        .subscribe((x) => results.push(x));

      subject.next(1);
      subject.next(2);
      subject.next(3);

      expect(results).toEqual([2, 4, 6]);
    });

    it("should work as a source for multiple operator chains", () => {
      const subject = new Subject<number>();
      const doubled: number[] = [];
      const tripled: number[] = [];

      // Two independent operator chains
      subject
        .pipe(
          (source) =>
            new (require("../src/core/Observable").Observable)((subscriber) =>
              source.subscribe({
                next: (x) => subscriber.next(x * 2),
                error: (e) => subscriber.error(e),
                complete: () => subscriber.complete(),
              })
            )
        )
        .subscribe((x) => doubled.push(x));

      subject
        .pipe(
          (source) =>
            new (require("../src/core/Observable").Observable)((subscriber) =>
              source.subscribe({
                next: (x) => subscriber.next(x * 3),
                error: (e) => subscriber.error(e),
                complete: () => subscriber.complete(),
              })
            )
        )
        .subscribe((x) => tripled.push(x));

      subject.next(1);
      subject.next(2);

      expect(doubled).toEqual([2, 4]);
      expect(tripled).toEqual([3, 6]);
    });
  });

  describe("Use Case: Event Bus", () => {
    it("should work as an event bus", () => {
      interface AppEvent {
        type: string;
        payload: any;
      }

      const eventBus = new Subject<AppEvent>();
      const loginEvents: AppEvent[] = [];
      const logoutEvents: AppEvent[] = [];

      // Component 1 listens for login events
      eventBus.subscribe((event) => {
        if (event.type === "login") {
          loginEvents.push(event);
        }
      });

      // Component 2 listens for logout events
      eventBus.subscribe((event) => {
        if (event.type === "logout") {
          logoutEvents.push(event);
        }
      });

      // Trigger events
      eventBus.next({ type: "login", payload: { userId: 1 } });
      eventBus.next({ type: "logout", payload: { userId: 1 } });
      eventBus.next({ type: "login", payload: { userId: 2 } });

      expect(loginEvents).toHaveLength(2);
      expect(logoutEvents).toHaveLength(1);
    });
  });

  describe("Use Case: Manual Observable Control", () => {
    it("should allow manual control over observable emissions", () => {
      const subject = new Subject<number>();
      const results: number[] = [];

      subject.subscribe((x) => results.push(x));

      // Simulate async operations
      setTimeout(() => subject.next(1), 0);
      setTimeout(() => subject.next(2), 0);
      setTimeout(() => subject.complete(), 0);

      // In real test, would need to wait for async
      // Just verifying the pattern compiles
      expect(subject).toBeDefined();
    });
  });

  describe("Comparison: Subject vs Observable", () => {
    it("should demonstrate unicast vs multicast behavior", () => {
      // Regular Observable - unicast (each subscriber gets independent execution)
      const Observable = require("../src/core/Observable").Observable;
      let observableExecutions = 0;
      const observable = new Observable((subscriber) => {
        observableExecutions++;
        subscriber.next(1);
        subscriber.complete();
      });

      observable.subscribe();
      observable.subscribe();

      // Each subscription triggers execution
      expect(observableExecutions).toBe(2);

      // Subject - multicast (all subscribers share execution)
      const subject = new Subject<number>();
      let subjectExecutions = 0;

      subject.subscribe();
      subject.subscribe();

      subjectExecutions++;
      subject.next(1);

      // Single execution shared by all subscribers
      expect(subjectExecutions).toBe(1);
    });

    it("should demonstrate cold vs hot behavior", () => {
      // Cold Observable - starts emitting when subscribed
      const Observable = require("../src/core/Observable").Observable;
      const coldResults1: number[] = [];
      const coldResults2: number[] = [];

      const cold = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.complete();
      });

      cold.subscribe((x) => coldResults1.push(x));
      // Each subscriber gets the same sequence from the start
      cold.subscribe((x) => coldResults2.push(x));

      expect(coldResults1).toEqual([1, 2]);
      expect(coldResults2).toEqual([1, 2]);

      // Hot Subject - emits regardless of subscribers
      const hot = new Subject<number>();
      const hotResults1: number[] = [];
      const hotResults2: number[] = [];

      hot.subscribe((x) => hotResults1.push(x));
      hot.next(1);
      hot.next(2);
      // Second subscriber joins late
      hot.subscribe((x) => hotResults2.push(x));
      hot.next(3);

      // First subscriber gets all values
      expect(hotResults1).toEqual([1, 2, 3]);
      // Second subscriber only gets values after subscription
      expect(hotResults2).toEqual([3]);
    });
  });
});
