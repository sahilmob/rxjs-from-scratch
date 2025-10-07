import { describe, it, expect } from 'vitest';
import { of } from '../src/observable/of';
import { from } from '../src/observable/from';
import { scan } from '../src/operators/scan';
import { reduce } from '../src/operators/reduce';
import { map } from '../src/operators/map';
import { filter } from '../src/operators/filter';
import { Observable } from '../src/core/Observable';

describe('Step 6: Scan & Reduce Operators', () => {
  describe('scan()', () => {
    describe('Basic accumulation', () => {
      it('should accumulate sum', () => {
        const values: number[] = [];
        of(1, 2, 3, 4, 5)
          .pipe(scan((acc, x) => acc + x, 0))
          .subscribe((value) => values.push(value));

        expect(values).toEqual([1, 3, 6, 10, 15]);
      });

      it('should accumulate product', () => {
        const values: number[] = [];
        of(1, 2, 3, 4)
          .pipe(scan((acc, x) => acc * x, 1))
          .subscribe((value) => values.push(value));

        expect(values).toEqual([1, 2, 6, 24]);
      });

      it('should work with single value', () => {
        const values: number[] = [];
        of(5)
          .pipe(scan((acc, x) => acc + x, 10))
          .subscribe((value) => values.push(value));

        expect(values).toEqual([15]);
      });

      it('should emit seed for empty source', () => {
        const values: number[] = [];
        from([])
          .pipe(scan((acc: number, x: number) => acc + x, 42))
          .subscribe((value) => values.push(value));

        expect(values).toEqual([]);
      });

      it('should start with seed value', () => {
        const values: number[] = [];
        of(5)
          .pipe(scan((acc, x) => acc + x, 100))
          .subscribe((value) => values.push(value));

        expect(values).toEqual([105]); // 100 + 5
      });
    });

    describe('Different accumulation types', () => {
      it('should build an array', () => {
        const values: number[][] = [];
        of(1, 2, 3)
          .pipe(scan((acc, x) => [...acc, x], [] as number[]))
          .subscribe((value) => values.push(value));

        expect(values).toEqual([[1], [1, 2], [1, 2, 3]]);
      });

      it('should build an object', () => {
        const values: any[] = [];
        of(
          { key: 'a', value: 1 },
          { key: 'b', value: 2 },
          { key: 'c', value: 3 }
        )
          .pipe(
            scan((acc, item) => ({ ...acc, [item.key]: item.value }), {} as any)
          )
          .subscribe((value) => values.push(value));

        expect(values).toEqual([
          { a: 1 },
          { a: 1, b: 2 },
          { a: 1, b: 2, c: 3 },
        ]);
      });

      it('should count occurrences', () => {
        const values: number[] = [];
        of('a', 'b', 'a', 'c', 'a', 'b')
          .pipe(scan((count) => count + 1, 0))
          .subscribe((value) => values.push(value));

        expect(values).toEqual([1, 2, 3, 4, 5, 6]);
      });

      it('should concatenate strings', () => {
        const values: string[] = [];
        of('Hello', ' ', 'World', '!')
          .pipe(scan((acc, x) => acc + x, ''))
          .subscribe((value) => values.push(value));

        expect(values).toEqual(['Hello', 'Hello ', 'Hello World', 'Hello World!']);
      });
    });

    describe('Index parameter', () => {
      it('should provide index to accumulator', () => {
        const indices: number[] = [];
        of(10, 20, 30)
          .pipe(
            scan((acc, value, index) => {
              indices.push(index);
              return acc + value;
            }, 0)
          )
          .subscribe(() => {});

        expect(indices).toEqual([0, 1, 2]);
      });

      it('should use index in accumulation', () => {
        const values: number[] = [];
        of(5, 5, 5)
          .pipe(scan((acc, value, index) => acc + value * index, 0))
          .subscribe((value) => values.push(value));

        expect(values).toEqual([0, 5, 15]); // 0 + 5*0, 0 + 5*1, 5 + 5*2
      });
    });

    describe('Chaining with other operators', () => {
      it('should work after map', () => {
        const values: number[] = [];
        of(1, 2, 3)
          .pipe(
            map((x) => x * 2), // 2, 4, 6
            scan((acc, x) => acc + x, 0) // 2, 6, 12
          )
          .subscribe((value) => values.push(value));

        expect(values).toEqual([2, 6, 12]);
      });

      it('should work after filter', () => {
        const values: number[] = [];
        of(1, 2, 3, 4, 5)
          .pipe(
            filter((x) => x % 2 === 0), // 2, 4
            scan((acc, x) => acc + x, 0) // 2, 6
          )
          .subscribe((value) => values.push(value));

        expect(values).toEqual([2, 6]);
      });

      it('should work with map after scan', () => {
        const values: string[] = [];
        of(1, 2, 3)
          .pipe(
            scan((acc, x) => acc + x, 0), // 1, 3, 6
            map((x) => `Total: ${x}`)
          )
          .subscribe((value) => values.push(value));

        expect(values).toEqual(['Total: 1', 'Total: 3', 'Total: 6']);
      });
    });

    describe('Error handling', () => {
      it('should propagate errors from source', () => {
        const errorSource = new Observable((subscriber) => {
          subscriber.next(1);
          subscriber.next(2);
          subscriber.error(new Error('Source error'));
        });

        let errorReceived: any;
        const values: number[] = [];

        errorSource
          .pipe(scan((acc: number, x: number) => acc + x, 0))
          .subscribe({
            next: (value) => values.push(value),
            error: (err) => (errorReceived = err),
          });

        expect(values).toEqual([1, 3]);
        expect(errorReceived).toBeInstanceOf(Error);
        expect(errorReceived.message).toBe('Source error');
      });

      it('should handle errors in accumulator function', () => {
        let errorReceived: any;
        const values: number[] = [];

        of(1, 2, 3, 4)
          .pipe(
            scan((acc, x) => {
              if (x === 3) throw new Error('Accumulator error');
              return acc + x;
            }, 0)
          )
          .subscribe({
            next: (value) => values.push(value),
            error: (err) => (errorReceived = err),
          });

        expect(values).toEqual([1, 3]); // 1, 1+2
        expect(errorReceived).toBeInstanceOf(Error);
        expect(errorReceived.message).toBe('Accumulator error');
      });
    });

    describe('Completion', () => {
      it('should complete when source completes', () => {
        let completed = false;
        of(1, 2, 3)
          .pipe(scan((acc, x) => acc + x, 0))
          .subscribe({
            complete: () => (completed = true),
          });

        expect(completed).toBe(true);
      });
    });
  });

  describe('reduce()', () => {
    describe('Basic reduction', () => {
      it('should emit only final sum', () => {
        const values: number[] = [];
        of(1, 2, 3, 4, 5)
          .pipe(reduce((acc, x) => acc + x, 0))
          .subscribe((value) => values.push(value));

        expect(values).toEqual([15]); // Only final value
      });

      it('should calculate product', () => {
        const values: number[] = [];
        of(1, 2, 3, 4)
          .pipe(reduce((acc, x) => acc * x, 1))
          .subscribe((value) => values.push(value));

        expect(values).toEqual([24]);
      });

      it('should work with single value', () => {
        const values: number[] = [];
        of(5)
          .pipe(reduce((acc, x) => acc + x, 10))
          .subscribe((value) => values.push(value));

        expect(values).toEqual([15]);
      });

      it('should emit seed for empty source', () => {
        const values: number[] = [];
        from([])
          .pipe(reduce((acc: number, x: number) => acc + x, 42))
          .subscribe((value) => values.push(value));

        expect(values).toEqual([42]); // Seed value
      });
    });

    describe('Different reduction types', () => {
      it('should build final array', () => {
        const values: number[][] = [];
        of(1, 2, 3)
          .pipe(reduce((acc, x) => [...acc, x], [] as number[]))
          .subscribe((value) => values.push(value));

        expect(values).toEqual([[1, 2, 3]]); // Only final array
      });

      it('should find maximum', () => {
        const values: number[] = [];
        of(3, 7, 2, 9, 1, 5)
          .pipe(reduce((acc, x) => Math.max(acc, x), -Infinity))
          .subscribe((value) => values.push(value));

        expect(values).toEqual([9]);
      });

      it('should find minimum', () => {
        const values: number[] = [];
        of(3, 7, 2, 9, 1, 5)
          .pipe(reduce((acc, x) => Math.min(acc, x), Infinity))
          .subscribe((value) => values.push(value));

        expect(values).toEqual([1]);
      });

      it('should count items', () => {
        const values: number[] = [];
        of('a', 'b', 'c', 'd', 'e')
          .pipe(reduce((count) => count + 1, 0))
          .subscribe((value) => values.push(value));

        expect(values).toEqual([5]);
      });
    });

    describe('Index parameter', () => {
      it('should provide index to accumulator', () => {
        const indices: number[] = [];
        of(10, 20, 30)
          .pipe(
            reduce((acc, value, index) => {
              indices.push(index);
              return acc + value;
            }, 0)
          )
          .subscribe(() => {});

        expect(indices).toEqual([0, 1, 2]);
      });
    });

    describe('Chaining with other operators', () => {
      it('should work after map', () => {
        const values: number[] = [];
        of(1, 2, 3)
          .pipe(
            map((x) => x * 2), // 2, 4, 6
            reduce((acc, x) => acc + x, 0) // 12
          )
          .subscribe((value) => values.push(value));

        expect(values).toEqual([12]);
      });

      it('should work after filter', () => {
        const values: number[] = [];
        of(1, 2, 3, 4, 5)
          .pipe(
            filter((x) => x % 2 === 0), // 2, 4
            reduce((acc, x) => acc + x, 0) // 6
          )
          .subscribe((value) => values.push(value));

        expect(values).toEqual([6]);
      });
    });

    describe('Error handling', () => {
      it('should propagate errors from source', () => {
        const errorSource = new Observable((subscriber) => {
          subscriber.next(1);
          subscriber.next(2);
          subscriber.error(new Error('Source error'));
        });

        let errorReceived: any;
        const values: number[] = [];

        errorSource
          .pipe(reduce((acc: number, x: number) => acc + x, 0))
          .subscribe({
            next: (value) => values.push(value),
            error: (err) => (errorReceived = err),
          });

        expect(values).toEqual([]); // No emission before error
        expect(errorReceived).toBeInstanceOf(Error);
        expect(errorReceived.message).toBe('Source error');
      });

      it('should handle errors in accumulator function', () => {
        let errorReceived: any;
        const values: number[] = [];

        of(1, 2, 3, 4)
          .pipe(
            reduce((acc, x) => {
              if (x === 3) throw new Error('Accumulator error');
              return acc + x;
            }, 0)
          )
          .subscribe({
            next: (value) => values.push(value),
            error: (err) => (errorReceived = err),
          });

        expect(values).toEqual([]);
        expect(errorReceived).toBeInstanceOf(Error);
        expect(errorReceived.message).toBe('Accumulator error');
      });
    });

    describe('Completion', () => {
      it('should complete after emitting final value', () => {
        let completed = false;
        of(1, 2, 3)
          .pipe(reduce((acc, x) => acc + x, 0))
          .subscribe({
            complete: () => (completed = true),
          });

        expect(completed).toBe(true);
      });
    });
  });

  describe('scan() vs reduce() comparison', () => {
    it('should show difference in emission timing', () => {
      const scanValues: number[] = [];
      const reduceValues: number[] = [];

      of(1, 2, 3, 4, 5)
        .pipe(scan((acc, x) => acc + x, 0))
        .subscribe((value) => scanValues.push(value));

      of(1, 2, 3, 4, 5)
        .pipe(reduce((acc, x) => acc + x, 0))
        .subscribe((value) => reduceValues.push(value));

      expect(scanValues).toEqual([1, 3, 6, 10, 15]); // Intermediate values
      expect(reduceValues).toEqual([15]); // Only final
    });

    it('should both use same accumulator logic', () => {
      const accumulator = (acc: number, x: number) => acc + x * 2;
      const seed = 0;

      const scanValues: number[] = [];
      const reduceValues: number[] = [];

      of(1, 2, 3)
        .pipe(scan(accumulator, seed))
        .subscribe((value) => scanValues.push(value));

      of(1, 2, 3)
        .pipe(reduce(accumulator, seed))
        .subscribe((value) => reduceValues.push(value));

      expect(scanValues).toEqual([2, 6, 12]); // 0+1*2, 2+2*2, 6+3*2
      expect(reduceValues).toEqual([12]); // Final only
    });
  });
});
