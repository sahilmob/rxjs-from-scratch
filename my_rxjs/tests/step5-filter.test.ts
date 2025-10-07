import { describe, it, expect } from 'vitest';
import { of } from '../src/observable/of';
import { from } from '../src/observable/from';
import { filter } from '../src/operators/filter';
import { map } from '../src/operators/map';
import { Observable } from '../src/core/Observable';

describe('Step 5: Filter Operator', () => {
  describe('Basic filtering', () => {
    it('should filter values based on predicate', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(filter((x) => x > 2))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([3, 4, 5]);
    });

    it('should filter even numbers', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5, 6)
        .pipe(filter((x) => x % 2 === 0))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([2, 4, 6]);
    });

    it('should filter odd numbers', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5, 6)
        .pipe(filter((x) => x % 2 !== 0))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 3, 5]);
    });

    it('should work with single value', () => {
      const values: number[] = [];
      of(5)
        .pipe(filter((x) => x > 3))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([5]);
    });

    it('should work with single value that does not pass', () => {
      const values: number[] = [];
      of(2)
        .pipe(filter((x) => x > 3))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([]);
    });

    it('should emit nothing when no values pass predicate', () => {
      const values: number[] = [];
      of(1, 2, 3)
        .pipe(filter((x) => x > 10))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([]);
    });

    it('should emit all values when all pass predicate', () => {
      const values: number[] = [];
      of(1, 2, 3)
        .pipe(filter((x) => x > 0))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3]);
    });

    it('should work with empty source', () => {
      const values: number[] = [];
      from([])
        .pipe(filter((x: number) => x > 2))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([]);
    });
  });

  describe('Different data types', () => {
    it('should filter strings', () => {
      const values: string[] = [];
      of('apple', 'banana', 'apricot', 'cherry')
        .pipe(filter((x) => x.startsWith('a')))
        .subscribe((value) => values.push(value));

      expect(values).toEqual(['apple', 'apricot']);
    });

    it('should filter objects', () => {
      const values: any[] = [];
      of(
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 },
        { name: 'Charlie', age: 20 }
      )
        .pipe(filter((x) => x.age >= 25))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 },
      ]);
    });

    it('should handle null and undefined values', () => {
      const values: any[] = [];
      of(1, null, 2, undefined, 3)
        .pipe(filter((x) => x != null)) // != checks for both null and undefined
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3]);
    });

    it('should handle boolean values', () => {
      const values: boolean[] = [];
      of(true, false, true, false)
        .pipe(filter((x) => x))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([true, true]);
    });
  });

  describe('Index parameter (bonus)', () => {
    it('should provide index to predicate function', () => {
      const values: string[] = [];
      of('a', 'b', 'c', 'd', 'e')
        .pipe(filter((value, index) => index % 2 === 0))
        .subscribe((value) => values.push(value));

      expect(values).toEqual(['a', 'c', 'e']); // Indices 0, 2, 4
    });

    it('should use index in complex predicates', () => {
      const values: number[] = [];
      of(10, 20, 30, 40, 50)
        .pipe(filter((value, index) => value > 20 && index < 4))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([30, 40]); // 30 at index 2, 40 at index 3
    });

    it('should increment index even for filtered values', () => {
      const indices: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(
          filter((value, index) => {
            indices.push(index);
            return value % 2 === 0;
          })
        )
        .subscribe(() => {});

      expect(indices).toEqual([0, 1, 2, 3, 4]); // All indices checked
    });

    it('should reset index for each subscription', () => {
      const source = of(1, 2, 3, 4);
      const filterOp = filter((value: number, index: number) => index < 2);

      const values1: number[] = [];
      const values2: number[] = [];

      source.pipe(filterOp).subscribe((v) => values1.push(v));
      source.pipe(filterOp).subscribe((v) => values2.push(v));

      expect(values1).toEqual([1, 2]);
      expect(values2).toEqual([1, 2]); // Index resets
    });
  });

  describe('Chaining with other operators', () => {
    it('should work with map', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5)
        .pipe(
          filter((x) => x > 2), // 3, 4, 5
          map((x) => x * 2) // 6, 8, 10
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([6, 8, 10]);
    });

    it('should work with multiple filters', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
        .pipe(
          filter((x) => x > 2), // 3-10
          filter((x) => x < 8), // 3-7
          filter((x) => x % 2 === 0) // 4, 6
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual([4, 6]);
    });

    it('should work in complex pipelines', () => {
      const values: string[] = [];
      of(1, 2, 3, 4, 5, 6)
        .pipe(
          map((x) => x * 2), // 2, 4, 6, 8, 10, 12
          filter((x) => x > 5), // 6, 8, 10, 12
          map((x) => `Value: ${x}`) // "Value: 6", etc.
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual(['Value: 6', 'Value: 8', 'Value: 10', 'Value: 12']);
    });
  });

  describe('Error handling', () => {
    it('should propagate errors from source', () => {
      const errorOp = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.error(new Error('Source error'));
      });

      let errorReceived: any;
      const values: number[] = [];

      errorOp
        .pipe(filter((x: number) => x > 0))
        .subscribe({
          next: (value) => values.push(value),
          error: (err) => (errorReceived = err),
        });

      expect(values).toEqual([1, 2]);
      expect(errorReceived).toBeInstanceOf(Error);
      expect(errorReceived.message).toBe('Source error');
    });

    it('should handle errors thrown in predicate function', () => {
      let errorReceived: any;
      const values: number[] = [];

      of(1, 2, 3, 4)
        .pipe(
          filter((x) => {
            if (x === 3) throw new Error('Predicate error');
            return x > 0;
          })
        )
        .subscribe({
          next: (value) => values.push(value),
          error: (err) => (errorReceived = err),
        });

      expect(values).toEqual([1, 2]); // Only values before error
      expect(errorReceived).toBeInstanceOf(Error);
      expect(errorReceived.message).toBe('Predicate error');
    });

    it('should not emit after error', () => {
      const values: number[] = [];
      let errorReceived: any;

      of(1, 2, 3, 4, 5)
        .pipe(
          filter((x) => {
            if (x === 3) throw new Error('Stop');
            return true;
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

  describe('Completion', () => {
    it('should complete when source completes', () => {
      let completed = false;
      of(1, 2, 3, 4, 5)
        .pipe(filter((x) => x > 2))
        .subscribe({
          complete: () => (completed = true),
        });

      expect(completed).toBe(true);
    });

    it('should complete even if no values pass predicate', () => {
      let completed = false;
      of(1, 2, 3)
        .pipe(filter((x) => x > 10))
        .subscribe({
          complete: () => (completed = true),
        });

      expect(completed).toBe(true);
    });

    it('should not complete if source does not complete', () => {
      let completed = false;
      const neverCompletes = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.next(2);
        // Never calls complete()
      });

      neverCompletes.pipe(filter((x: number) => x > 0)).subscribe({
        complete: () => (completed = true),
      });

      expect(completed).toBe(false);
    });
  });

  describe('Unsubscription', () => {
    it('should stop filtering after unsubscription', () => {
      const values: number[] = [];
      let subscription: any;

      subscription = of(1, 2, 3, 4, 5)
        .pipe(filter((x) => x > 0))
        .subscribe({
          next: (value) => {
            values.push(value);
            if (value === 3) {
              subscription.unsubscribe();
            }
          },
        });

      expect(values).toEqual([1, 2, 3]);
    });
  });

  describe('Edge cases', () => {
    it('should work with falsy values in predicate', () => {
      const values: number[] = [];
      of(0, 1, 2, 3)
        .pipe(filter((x) => x !== 0))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3]);
    });

    it('should handle predicate that always returns false', () => {
      const values: number[] = [];
      of(1, 2, 3)
        .pipe(filter(() => false))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([]);
    });

    it('should handle predicate that always returns true', () => {
      const values: number[] = [];
      of(1, 2, 3)
        .pipe(filter(() => true))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3]);
    });

    it('should work with complex predicates', () => {
      const values: number[] = [];
      of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
        .pipe(filter((x) => x % 2 === 0 && x % 3 === 0))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([6]); // Only 6 is divisible by both 2 and 3
    });
  });
});
