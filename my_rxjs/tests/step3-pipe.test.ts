import { describe, it, expect } from 'vitest';
import { Observable } from '../src/core/Observable';
import { pipe, OperatorFunction } from '../src/core/pipe';
import { of } from '../src/observable/of';

describe('Step 3: The Pipe Operator', () => {
  // Helper operators for testing
  const multiplyBy = (factor: number): OperatorFunction<number, number> => {
    return (source: Observable<number>) =>
      new Observable((subscriber) => {
        return source.subscribe({
          next: (value) => subscriber.next(value * factor),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
  };

  const addOne: OperatorFunction<number, number> = (
    source: Observable<number>
  ) =>
    new Observable((subscriber) => {
      return source.subscribe({
        next: (value) => subscriber.next(value + 1),
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
    });

  const toString: OperatorFunction<number, string> = (
    source: Observable<number>
  ) =>
    new Observable((subscriber) => {
      return source.subscribe({
        next: (value) => subscriber.next(value.toString()),
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
    });

  describe('Observable.pipe() method', () => {
    it('should return the same observable when no operators provided', () => {
      const source = of(1, 2, 3);
      const result = source.pipe();

      const values: number[] = [];
      result.subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3]);
    });

    it('should apply a single operator', () => {
      const values: number[] = [];
      of(1, 2, 3)
        .pipe(multiplyBy(2))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([2, 4, 6]);
    });

    it('should apply multiple operators in order (left to right)', () => {
      const values: number[] = [];
      of(1, 2, 3)
        .pipe(addOne, multiplyBy(2))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([4, 6, 8]); // (1+1)*2, (2+1)*2, (3+1)*2
    });

    it('should chain three operators', () => {
      const values: number[] = [];
      of(1, 2, 3)
        .pipe(addOne, multiplyBy(2), addOne)
        .subscribe((value) => values.push(value));

      expect(values).toEqual([5, 7, 9]); // ((1+1)*2)+1, ((2+1)*2)+1, ((3+1)*2)+1
    });

    it('should handle type transformations', () => {
      const values: string[] = [];
      of(1, 2, 3)
        .pipe(multiplyBy(10), toString)
        .subscribe((value) => values.push(value));

      expect(values).toEqual(['10', '20', '30']);
    });

    it('should propagate errors through pipe', () => {
      const errorOp: OperatorFunction<number, number> = (source) =>
        new Observable((subscriber) => {
          return source.subscribe({
            next: (value) => {
              if (value === 2) {
                subscriber.error(new Error('Test error'));
              } else {
                subscriber.next(value);
              }
            },
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete(),
          });
        });

      const values: number[] = [];
      let errorReceived: any;

      of(1, 2, 3)
        .pipe(errorOp)
        .subscribe({
          next: (value) => values.push(value),
          error: (err) => (errorReceived = err),
        });

      expect(values).toEqual([1]);
      expect(errorReceived).toBeInstanceOf(Error);
      expect(errorReceived.message).toBe('Test error');
    });

    it('should propagate completion through pipe', () => {
      let completed = false;
      of(1, 2, 3)
        .pipe(addOne, multiplyBy(2))
        .subscribe({
          complete: () => (completed = true),
        });

      expect(completed).toBe(true);
    });

    it('should handle unsubscription correctly', () => {
      const values: number[] = [];
      const subscription = of(1, 2, 3, 4, 5)
        .pipe(addOne, multiplyBy(2))
        .subscribe({
          next: (value) => {
            values.push(value);
            if (value === 6) {
              subscription.unsubscribe();
            }
          },
        });

      expect(values).toEqual([4, 6]); // (1+1)*2, (2+1)*2
    });

    it('should create a new Observable (not mutate original)', () => {
      const source = of(1, 2, 3);
      const transformed = source.pipe(multiplyBy(2));

      const sourceValues: number[] = [];
      const transformedValues: number[] = [];

      source.subscribe((value) => sourceValues.push(value));
      transformed.subscribe((value) => transformedValues.push(value));

      expect(sourceValues).toEqual([1, 2, 3]);
      expect(transformedValues).toEqual([2, 4, 6]);
    });
  });

  describe('Standalone pipe() function', () => {
    it('should compose no operators (identity function)', () => {
      const identity = pipe();
      const source = of(1, 2, 3);
      const result = identity(source);

      const values: number[] = [];
      result.subscribe((value) => values.push(value));

      expect(values).toEqual([1, 2, 3]);
    });

    it('should compose a single operator', () => {
      const transform = pipe(multiplyBy(3));
      const values: number[] = [];

      transform(of(1, 2, 3)).subscribe((value) => values.push(value));

      expect(values).toEqual([3, 6, 9]);
    });

    it('should compose multiple operators', () => {
      const transform = pipe(addOne, multiplyBy(2), addOne);
      const values: number[] = [];

      transform(of(1, 2, 3)).subscribe((value) => values.push(value));

      expect(values).toEqual([5, 7, 9]); // ((1+1)*2)+1, etc.
    });

    it('should handle type transformations', () => {
      const transform = pipe(multiplyBy(5), toString);
      const values: string[] = [];

      transform(of(2, 4)).subscribe((value) => values.push(value));

      expect(values).toEqual(['10', '20']);
    });

    it('should be reusable', () => {
      const transform = pipe(addOne, multiplyBy(2));

      const values1: number[] = [];
      const values2: number[] = [];

      transform(of(1, 2)).subscribe((value) => values1.push(value));
      transform(of(3, 4)).subscribe((value) => values2.push(value));

      expect(values1).toEqual([4, 6]); // (1+1)*2, (2+1)*2
      expect(values2).toEqual([8, 10]); // (3+1)*2, (4+1)*2
    });

    it('should work with Observable.pipe()', () => {
      // Using standalone pipe to create a reusable transformation
      const transform = pipe(addOne, multiplyBy(2));

      const values: number[] = [];
      of(1, 2, 3)
        .pipe(addOne) // Use Observable.pipe
        .subscribe((value) => {
          // Then apply standalone pipe to individual values
          const transformed = transform(of(value));
          transformed.subscribe((v) => values.push(v));
        });

      // Input: 1, 2, 3
      // After first addOne: 2, 3, 4
      // After transform ((x+1)*2): (2+1)*2=6, (3+1)*2=8, (4+1)*2=10
      expect(values).toEqual([6, 8, 10]);
    });
  });

  describe('Integration - Practical examples', () => {
    it('should work with complex operator chains', () => {
      const values: string[] = [];

      of(1, 2, 3, 4, 5)
        .pipe(
          addOne,           // 2, 3, 4, 5, 6
          multiplyBy(2),    // 4, 6, 8, 10, 12
          addOne,           // 5, 7, 9, 11, 13
          toString          // "5", "7", "9", "11", "13"
        )
        .subscribe((value) => values.push(value));

      expect(values).toEqual(['5', '7', '9', '11', '13']);
    });

    it('should allow method chaining', () => {
      const values: number[] = [];

      of(10)
        .pipe(multiplyBy(2))
        .pipe(addOne)
        .pipe(multiplyBy(3))
        .subscribe((value) => values.push(value));

      expect(values).toEqual([63]); // ((10*2)+1)*3 = 63
    });

    it('should work with custom operator composition', () => {
      // Create a reusable transformation
      const double = multiplyBy(2);
      const quadruple = pipe(double, double);
      const octo = pipe(quadruple, double);

      const values: number[] = [];
      of(1, 2, 3).pipe(octo).subscribe((value) => values.push(value));

      expect(values).toEqual([8, 16, 24]); // 1*8, 2*8, 3*8
    });
  });
});
