import { describe, it, expect, vi } from "vitest";
import { Subscription } from "../src/core/Subscription";

describe("Subscription.remove", () => {
  it("detaches a child without unsubscribing it", () => {
    const teardown = vi.fn();
    const child = new Subscription(teardown);
    const parent = new Subscription();
    parent.add(child);
    parent.remove(child);
    parent.unsubscribe();
    expect(child.closed).toBe(false);
    expect(teardown).not.toHaveBeenCalled();
    child.unsubscribe();
    expect(teardown).toHaveBeenCalledTimes(1);
  });
  it("retains unrelated children when one child is removed", () => {
    const removed = new Subscription();
    const retained = new Subscription();
    const parent = new Subscription();
    parent.add(removed);
    parent.add(retained);
    parent.remove(removed);
    parent.unsubscribe();
    expect(removed.closed).toBe(false);
    expect(retained.closed).toBe(true);
  });
});
