import { describe, it, expect } from 'vitest';
import { of } from '../src/observable/of';
import { from } from '../src/observable/from';
import { distinct } from '../src/operators/distinct';
import { distinctUntilChanged } from '../src/operators/distinctUntilChanged';
import { map } from '../src/operators/map';
import { Observable } from '../src/core/Observable';

describe('Step 8: Distinct & DistinctUntilChanged', () => {
  describe('distinct()', () => {
    it('should remove all duplicate values', () => {
      const values: number[] = [];
      of(1, 2, 1, 3, 2, 4, 3)
        .pipe(distinct())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3, 4]);
    });

    it('should emit first occurrence of each value', () => {
      const values: number[] = [];
      of(1, 1, 1, 2, 2, 3)
        .pipe(distinct())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3]);
    });

    it('should work with single value', () => {
      const values: number[] = [];
      of(42)
        .pipe(distinct())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([42]);
    });

    it('should work with empty source', () => {
      const values: number[] = [];
      from([])
        .pipe(distinct())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([]);
    });

    it('should work with all unique values', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(distinct())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3, 4, 5]);
    });

    it('should work with all duplicate values', () => {
      const values: number[] = [];
      of(5, 5, 5, 5, 5)
        .pipe(distinct())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([5]);
    });

    it('should work with strings', () => {
      const values: string[] = [];
      of('a', 'b', 'a', 'c', 'b', 'd')
        .pipe(distinct())
        .subscribe((value) => values.push(value));

      expect(values).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should distinguish between falsy values', () => {
      const values: any[] = [];
      of(0, false, '', null, undefined, 0, false, '')
        .pipe(distinct())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([0, false, '', null, undefined]);
    });

    it('should work with keySelector for objects', () => {
      const values: any[] = [];
      of(
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Alice Again' }, // Same id
        { id: 3, name: 'Charlie' },
        { id: 2, name: 'Bob Again' } // Same id
      )
        .pipe(distinct((user) => user.id))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ]);
    });

    it('should work with keySelector for case-insensitive strings', () => {
      const values: string[] = [];
      of('apple', 'APPLE', 'banana', 'Apple', 'BANANA')
        .pipe(distinct((s) => s.toLowerCase()))
        .subscribe((value) => values.push(value));

      expect(values).toEqual(['apple', 'banana']);
    });

    it('should complete when source completes', () => {
      let completed = false;
      of(1, 2, 1, 3)
        .pipe(distinct())
        .subscribe({
          complete: () => (completed = true),
        });

      expect(completed).toBe(true);
    });

    it('should propagate errors', () => {
      const errorSource = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.error(new Error('Test error'));
      });

      let errorReceived: any;
      const values: number[] = [];

      errorSource.pipe(distinct()).subscribe({
        next: (value: any) => values.push(value),
        error: (err) => (errorReceived = err),
      });

      expect(values).toEqual([1, 2]);
      expect(errorReceived).toBeInstanceOf(Error);
    });

    it('should work with map', () => {
      const values: number[] = [];
      of(1, 2, 1, 3, 2, 4)
        .pipe(
          map((x) => x * 2),
          distinct()
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([2, 4, 6, 8]);
    });

    it('should handle large number of duplicates efficiently', () => {
      const input = Array(1000)
        .fill(0)
        .map((_, i) => i % 10); // 0-9 repeated 100 times
      const values: number[] = [];

      from(input)
        .pipe(distinct())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('distinctUntilChanged()', () => {
    it('should remove consecutive duplicate values', () => {
      const values: number[] = [];
      of(1, 1, 2, 2, 2, 3, 3, 1, 1)
        .pipe(distinctUntilChanged())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3, 1]);
    });

    it('should emit first value always', () => {
      const values: number[] = [];
      of(42)
        .pipe(distinctUntilChanged())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([42]);
    });

    it('should emit all values if no consecutive duplicates', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(distinctUntilChanged())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3, 4, 5]);
    });

    it('should work with empty source', () => {
      const values: number[] = [];
      from([])
        .pipe(distinctUntilChanged())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([]);
    });

    it('should allow non-consecutive duplicates', () => {
      const values: number[] = [];
      of(1, 2, 1, 3, 2, 4)
        .pipe(distinctUntilChanged())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 1, 3, 2, 4]); // All emitted - no consecutive dupes
    });

    it('should work with all duplicate values', () => {
      const values: number[] = [];
      of(5, 5, 5, 5, 5)
        .pipe(distinctUntilChanged())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([5]); // Only first one
    });

    it('should work with strings', () => {
      const values: string[] = [];
      of('a', 'a', 'b', 'b', 'c', 'c')
        .pipe(distinctUntilChanged())
        .subscribe((value) => values.push(value));

      expect(values).toEqual(['a', 'b', 'c']);
    });

    it('should distinguish between falsy values', () => {
      const values: any[] = [];
      of(0, 0, false, false, '', '', null, null)
        .pipe(distinctUntilChanged())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([0, false, '', null]);
    });

    it('should work with custom compare function for objects', () => {
      const values: any[] = [];
      of(
        { id: 1, count: 5 },
        { id: 1, count: 5 }, // Same id
        { id: 2, count: 3 },
        { id: 2, count: 7 }, // Same id, different count
        { id: 3, count: 1 }
      )
        .pipe(distinctUntilChanged((prev, curr) => prev.id === curr.id))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([
        { id: 1, count: 5 },
        { id: 2, count: 3 },
        { id: 3, count: 1 },
      ]);
    });

    it('should work with custom compare for case-insensitive strings', () => {
      const values: string[] = [];
      of('apple', 'APPLE', 'Apple', 'banana', 'BANANA')
        .pipe(
          distinctUntilChanged(
            (a, b) => a.toLowerCase() === b.toLowerCase()
          )
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual(['apple', 'banana']);
    });

    it('should work with custom compare returning true for equal', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5, 6)
        .pipe(
          // Consider numbers equal if difference <= 1
          distinctUntilChanged((a, b) => Math.abs(a - b) <= 1)
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 3, 5]);
    });

    it('should complete when source completes', () => {
      let completed = false;
      of(1, 1, 2, 2)
        .pipe(distinctUntilChanged())
        .subscribe({
          complete: () => (completed = true),
        });

      expect(completed).toBe(true);
    });

    it('should propagate errors', () => {
      const errorSource = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.next(1);
        subscriber.error(new Error('Test error'));
      });

      let errorReceived: any;
      const values: number[] = [];

      errorSource.pipe(distinctUntilChanged()).subscribe({
        next: (value: any) => values.push(value),
        error: (err) => (errorReceived = err),
      });

      expect(values).toEqual([1]);
      expect(errorReceived).toBeInstanceOf(Error);
    });

    it('should work with map', () => {
      const values: number[] = [];
      of(1, 1, 2, 2, 3, 3)
        .pipe(
          map((x) => x * 10),
          distinctUntilChanged()
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([10, 20, 30]);
    });

    it('should handle rapid changes efficiently', () => {
      const input = Array(1000)
        .fill(0)
        .map((_, i) => Math.floor(i / 2)); // 0,0,1,1,2,2,...
      const values: number[] = [];

      from(input)
        .pipe(distinctUntilChanged())
        .subscribe((value) => values.push(value));

      expect(values.length).toBe(500); // Each number appears once
    });
  });

  describe('distinct() vs distinctUntilChanged() comparison', () => {
    it('should show difference between distinct and distinctUntilChanged', () => {
      const input = [1, 2, 1, 3, 2, 4];

      const distinctValues: number[] = [];
      const distinctUntilChangedValues: number[] = [];

      of(...input)
        .pipe(distinct())
        .subscribe((value) => distinctValues.push(value));

      of(...input)
        .pipe(distinctUntilChanged())
        .subscribe((value) => distinctUntilChangedValues.push(value));

      expect(distinctValues).toEqual([1, 2, 3, 4]); // All duplicates removed
      expect(distinctUntilChangedValues).toEqual([1, 2, 1, 3, 2, 4]); // No consecutive dupes
    });

    it('should show consecutive duplicate handling', () => {
      const input = [1, 1, 2, 2, 1, 1];

      const distinctValues: number[] = [];
      const distinctUntilChangedValues: number[] = [];

      of(...input)
        .pipe(distinct())
        .subscribe((value) => distinctValues.push(value));

      of(...input)
        .pipe(distinctUntilChanged())
        .subscribe((value) => distinctUntilChangedValues.push(value));

      expect(distinctValues).toEqual([1, 2]); // Only unique values
      expect(distinctUntilChangedValues).toEqual([1, 2, 1]); // 1 reappears (not consecutive)
    });
  });

  describe('Combined operators', () => {
    it('should work with distinct then distinctUntilChanged', () => {
      const values: number[] = [];
      of(1, 1, 2, 2, 1, 1, 3, 3)
        .pipe(distinct(), distinctUntilChanged())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3]);
    });

    it('should work with distinctUntilChanged then distinct', () => {
      const values: number[] = [];
      of(1, 1, 2, 2, 1, 1, 3, 3)
        .pipe(distinctUntilChanged(), distinct())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3]);
    });

    it('should work with map and both distinct operators', () => {
      const values: number[] = [];
      of(1, 1, 2, 2, 3, 3)
        .pipe(
          map((x) => x * 10),
          distinctUntilChanged(),
          map((x) => x / 10),
          distinct()
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3]);
    });
  });
});
