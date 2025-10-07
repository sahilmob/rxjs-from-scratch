import { describe, it, expect } from 'vitest';
import { of } from '../src/observable/of';
import { from } from '../src/observable/from';
import { take } from '../src/operators/take';
import { skip } from '../src/operators/skip';
import { first } from '../src/operators/first';
import { last } from '../src/operators/last';
import { map } from '../src/operators/map';
import { Observable } from '../src/core/Observable';

describe('Step 7: Take, Skip, First, Last Operators', () => {
  describe('take()', () => {
    it('should take first N values', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(take(3))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3]);
    });

    it('should complete after taking N values', () => {
      let completed = false;
      of(1, 2, 3, 4, 5)
        .pipe(take(3))
        .subscribe({
          complete: () => (completed = true),
        });

      expect(completed).toBe(true);
    });

    it('should take all values if count > source length', () => {
      const values: number[] = [];
      of(1, 2, 3)
        .pipe(take(10))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3]);
    });

    it('should emit nothing for take(0)', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(take(0))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([]);
    });

    it('should complete immediately for take(0)', () => {
      let completed = false;
      of(1, 2, 3, 4, 5)
        .pipe(take(0))
        .subscribe({
          complete: () => (completed = true),
        });

      expect(completed).toBe(true);
    });

    it('should handle negative count as 0', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(take(-5))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([]);
    });

    it('should work with take(1)', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(take(1))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1]);
    });

    it('should work with empty source', () => {
      const values: number[] = [];
      from([])
        .pipe(take(5))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([]);
    });

    it('should propagate errors', () => {
      const errorSource = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.error(new Error('Test error'));
      });

      let errorReceived: any;
      const values: number[] = [];

      errorSource.pipe(take(3)).subscribe({
        next: (value: any) => values.push(value),
        error: (err) => (errorReceived = err),
      });

      expect(values).toEqual([1]);
      expect(errorReceived).toBeInstanceOf(Error);
    });

    it('should work with map', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(
          map((x) => x * 2),
          take(3)
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([2, 4, 6]);
    });

    it('should unsubscribe from source after taking N values', () => {
      const values: number[] = [];
      let sourceCompleted = false;

      const source = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.next(3);
        subscriber.next(4);
        subscriber.next(5);
        return () => {
          sourceCompleted = true;
        };
      });

      source.pipe(take(2)).subscribe((value: any) => values.push(value));

      expect(values).toEqual([1, 2]);
      // The source teardown should be called when take completes
    });
  });

  describe('skip()', () => {
    it('should skip first N values', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(skip(2))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([3, 4, 5]);
    });

    it('should skip all if count >= source length', () => {
      const values: number[] = [];
      of(1, 2, 3)
        .pipe(skip(5))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([]);
    });

    it('should skip nothing for skip(0)', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(skip(0))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle negative count as 0', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(skip(-3))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3, 4, 5]);
    });

    it('should complete when source completes', () => {
      let completed = false;
      of(1, 2, 3, 4, 5)
        .pipe(skip(2))
        .subscribe({
          complete: () => (completed = true),
        });

      expect(completed).toBe(true);
    });

    it('should work with empty source', () => {
      const values: number[] = [];
      from([])
        .pipe(skip(3))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([]);
    });

    it('should propagate errors', () => {
      const errorSource = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.error(new Error('Test error'));
      });

      let errorReceived: any;
      const values: number[] = [];

      errorSource.pipe(skip(1)).subscribe({
        next: (value: any) => values.push(value),
        error: (err) => (errorReceived = err),
      });

      expect(values).toEqual([2]);
      expect(errorReceived).toBeInstanceOf(Error);
    });

    it('should work with map', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(
          skip(2),
          map((x) => x * 2)
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([6, 8, 10]);
    });
  });

  describe('first()', () => {
    it('should emit only the first value', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(first())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1]);
    });

    it('should complete after first value', () => {
      let completed = false;
      of(1, 2, 3, 4, 5)
        .pipe(first())
        .subscribe({
          complete: () => (completed = true),
        });

      expect(completed).toBe(true);
    });

    it('should work with single value', () => {
      const values: number[] = [];
      of(42)
        .pipe(first())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([42]);
    });

    it('should complete without emitting for empty source', () => {
      const values: number[] = [];
      let completed = false;

      from([])
        .pipe(first())
        .subscribe({
          next: (value) => values.push(value),
          complete: () => (completed = true),
        });

      expect(values).toEqual([]);
      expect(completed).toBe(true);
    });

    it('should propagate errors', () => {
      const errorSource = new Observable((subscriber) => {
        subscriber.error(new Error('Test error'));
      });

      let errorReceived: any;

      errorSource.pipe(first()).subscribe({
        error: (err) => (errorReceived = err),
      });

      expect(errorReceived).toBeInstanceOf(Error);
    });

    it('should work with map', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(
          map((x) => x * 10),
          first()
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([10]);
    });

    it('should be equivalent to take(1)', () => {
      const firstValues: number[] = [];
      const takeValues: number[] = [];

      of(1, 2, 3, 4, 5)
        .pipe(first())
        .subscribe((value) => firstValues.push(value));

      of(1, 2, 3, 4, 5)
        .pipe(take(1))
        .subscribe((value) => takeValues.push(value));

      expect(firstValues).toEqual(takeValues);
    });
  });

  describe('last()', () => {
    it('should emit only the last value', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(last())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([5]);
    });

    it('should complete after emitting last value', () => {
      let completed = false;
      of(1, 2, 3, 4, 5)
        .pipe(last())
        .subscribe({
          complete: () => (completed = true),
        });

      expect(completed).toBe(true);
    });

    it('should work with single value', () => {
      const values: number[] = [];
      of(42)
        .pipe(last())
        .subscribe((value) => values.push(value));

      expect(values).toEqual([42]);
    });

    it('should complete without emitting for empty source', () => {
      const values: number[] = [];
      let completed = false;

      from([])
        .pipe(last())
        .subscribe({
          next: (value) => values.push(value),
          complete: () => (completed = true),
        });

      expect(values).toEqual([]);
      expect(completed).toBe(true);
    });

    it('should wait for completion before emitting', () => {
      const values: number[] = [];
      const emissions: string[] = [];

      const source = new Observable<number>((subscriber) => {
        emissions.push('emit 1');
        subscriber.next(1);
        emissions.push('emit 2');
        subscriber.next(2);
        emissions.push('emit 3');
        subscriber.next(3);
        emissions.push('complete');
        subscriber.complete();
      });

      source.pipe(last()).subscribe((value) => {
        emissions.push(`received ${value}`);
        values.push(value);
      });

      expect(emissions).toEqual([
        'emit 1',
        'emit 2',
        'emit 3',
        'complete',
        'received 3',
      ]);
      expect(values).toEqual([3]);
    });

    it('should propagate errors', () => {
      const errorSource = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.error(new Error('Test error'));
      });

      let errorReceived: any;
      const values: number[] = [];

      errorSource.pipe(last()).subscribe({
        next: (value: any) => values.push(value),
        error: (err) => (errorReceived = err),
      });

      expect(values).toEqual([]);
      expect(errorReceived).toBeInstanceOf(Error);
    });

    it('should work with map', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(
          map((x) => x * 10),
          last()
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([50]);
    });
  });

  describe('Combinations', () => {
    it('should combine take and skip', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
        .pipe(
          skip(2), // Skip 1, 2 => 3-10
          take(3) // Take first 3 => 3, 4, 5
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([3, 4, 5]);
    });

    it('should use first after skip', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(
          skip(2), // Skip 1, 2 => 3, 4, 5
          first() // First value => 3
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([3]);
    });

    it('should use last after take', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
        .pipe(
          take(5), // Take first 5 => 1-5
          last() // Last value => 5
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([5]);
    });

    it('should work in complex pipeline', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
        .pipe(
          map((x) => x * 2), // 2, 4, 6, 8, 10, 12, 14, 16, 18, 20
          skip(2), // Skip first 2 => 6-20
          take(4), // Take first 4 => 6, 8, 10, 12
          map((x) => x / 2) // 3, 4, 5, 6
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([3, 4, 5, 6]);
    });

    it('should get middle values with skip and take', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
        .pipe(
          skip(3), // Skip first 3 => 4-10
          take(4) // Take 4 => 4, 5, 6, 7
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([4, 5, 6, 7]);
    });
  });
});
