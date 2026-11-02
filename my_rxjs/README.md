> Historical exercise guide: includes planned work, not a completion report. See the [repository README](../README.md) and [validation notes](../VALIDATION.md) for current status and working commands.

# My RxJS Implementation

A learning-focused implementation of RxJS core concepts, built from scratch to understand reactive programming.

## Project Structure

```
my_rxjs/
├── src/
│   ├── core/              # Core Observable infrastructure
│   │   ├── Observable.ts  # Observable class with subscribe & pipe
│   │   ├── Subscriber.ts  # Subscriber (Observer + Subscription)
│   │   ├── Subscription.ts # Subscription with teardown logic
│   │   ├── pipe.ts        # Standalone pipe function
│   │   └── types.ts       # TypeScript type definitions
│   │
│   ├── observable/        # Observable creation functions
│   │   ├── of.ts          # Emit values synchronously
│   │   ├── from.ts        # Convert arrays/iterables
│   │   └── fromEvent.ts   # DOM event observables
│   │
│   ├── operators/         # Transformation & filtering operators
│   │   ├── map.ts         # Transform values with projection function
│   │   ├── filter.ts      # Conditionally emit values based on predicate
│   │   ├── scan.ts        # Accumulate with intermediate emissions
│   │   ├── reduce.ts      # Accumulate with final emission only
│   │   ├── take.ts        # Take first N values then complete
│   │   ├── skip.ts        # Skip first N values, emit rest
│   │   ├── first.ts       # Emit only first value
│   │   ├── last.ts        # Buffer last value, emit on complete
│   │   ├── distinct.ts    # Remove ALL duplicates
│   │   └── distinctUntilChanged.ts  # Remove consecutive duplicates
│   ├── subjects/          # Subjects (coming soon)
│   └── index.ts           # Public API exports
│
└── tests/                           # Vitest test suites
    ├── step1-core.test.ts           # 24 tests - Core Observable
    ├── step2-creation.test.ts       # 22 tests - Creation functions
    ├── step3-pipe.test.ts           # 18 tests - Pipe operator
    ├── step4-map.test.ts            # 20 tests - Map operator
    ├── step5-filter.test.ts         # 30 tests - Filter operator
    ├── step6-scan-reduce.test.ts    # 33 tests - Scan & Reduce
    ├── step7-take-skip-first-last.test.ts  # 38 tests - Take, Skip, First, Last
    └── step8-distinct.test.ts       # 34 tests - Distinct & DistinctUntilChanged
```

## Implementation Status

### ✅ Phase 1: Foundation (Complete - 64/64 tests passing)
### ✅ Phase 2: Transformation Operators (Complete - 57/57 tests passing)
### ✅ Phase 3: Filtering & Utility Operators (Complete - 72/72 tests passing)

#### Step 1: Observable & Subscriber Basics
**Files:** `Observable.ts`, `Subscriber.ts`, `Subscription.ts`, `types.ts`

Core concepts implemented:
- Observable pattern (lazy, push-based)
- Observer interface (next, error, complete)
- Subscription lifecycle and cleanup
- Teardown logic with proper context binding
- Terminal event handling

**Key Pattern:**
```typescript
const observable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
  return () => console.log('cleanup'); // teardown
});

const subscription = observable.subscribe({
  next: value => console.log(value),
  error: err => console.error(err),
  complete: () => console.log('done')
});

subscription.unsubscribe(); // cleanup runs
```

#### Step 2: Basic Observable Creation Functions
**Files:** `of.ts`, `from.ts`, `fromEvent.ts`

Creation operators for different sources:
- `of(...values)` - Emit values synchronously
- `from(array)` - Convert arrays/iterables to Observable
- `fromEvent(target, event)` - Listen to DOM events

**Key Patterns:**
```typescript
// Synchronous emission
of(1, 2, 3).subscribe(console.log); // 1, 2, 3

// Array/iterable conversion
from([10, 20, 30]).subscribe(console.log);
from(new Set([1, 2, 3])).subscribe(console.log);

// Event handling with cleanup
const clicks = fromEvent(button, 'click');
const sub = clicks.subscribe(event => console.log(event));
sub.unsubscribe(); // removes event listener
```

**Key Learnings:**
- Hot vs Cold observables
- Synchronous vs asynchronous emission
- Proper event listener cleanup
- Early exit with `subscriber.closed` check

#### Step 3: The Pipe Operator
**Files:** `pipe.ts`, updated `Observable.ts`

Function composition for operator chaining:
- Standalone `pipe()` function
- `Observable.pipe()` method
- Type-safe operator composition

**Key Patterns:**
```typescript
// Method chaining (most common)
of(1, 2, 3)
  .pipe(
    map(x => x * 2),
    filter(x => x > 2)
  )
  .subscribe(console.log); // 4, 6

// Standalone pipe (reusable)
const double = map(x => x * 2);
const evens = filter(x => x % 2 === 0);
const transform = pipe(double, evens);

transform(of(1, 2, 3)).subscribe(console.log); // 2, 6
```

**Key Learnings:**
- Function composition with `reduce()`
- Left-to-right operator application
- TypeScript type inference through chains
- Immutability (new Observable each time)

#### Step 4: Map Operator
**Files:** `operators/map.ts`

The fundamental transformation operator:
- Transform each emitted value using projection function
- Support index parameter (bonus feature)
- Handle errors from projection function
- Type transformation (T → R)

**Key Patterns:**
```typescript
// Basic transformation
of(1, 2, 3)
  .pipe(map(x => x * 2))
  .subscribe(console.log); // 2, 4, 6

// Type transformation
of(1, 2, 3)
  .pipe(map(x => `Value: ${x}`))
  .subscribe(console.log); // "Value: 1", "Value: 2", "Value: 3"

// With index
of('a', 'b', 'c')
  .pipe(map((value, index) => `${index}: ${value}`))
  .subscribe(console.log); // "0: a", "1: b", "2: c"

// Chaining maps
of(1, 2, 3)
  .pipe(
    map(x => x + 1),  // 2, 3, 4
    map(x => x * 2),  // 4, 6, 8
    map(x => `${x}`)  // "4", "6", "8"
  )
  .subscribe(console.log);
```

**Operator Pattern (used by all operators):**
```typescript
export function operatorName<T, R>(config): OperatorFunction<T, R> {
  return (source: Observable<T>) => {
    return new Observable<R>(subscriber => {
      return source.subscribe({
        next: value => {
          try {
            // Transform value
            subscriber.next(transformed);
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: err => subscriber.error(err),
        complete: () => subscriber.complete()
      }).unsubscribe;
    });
  };
}
```

**Key Learnings:**
- Higher-order function pattern
- Error handling in transformations
- State management (index tracking)
- Subscription forwarding for cleanup
- Type safety with generics

#### Step 5: Filter Operator
**Files:** `operators/filter.ts`

Conditional emission based on predicate:
- Emit only values that pass a test
- Type preservation (T → T)
- Index tracking for all values (even filtered)
- Same pattern as map, but with conditional emission

**Key Patterns:**
```typescript
// Basic filtering
of(1, 2, 3, 4, 5)
  .pipe(filter(x => x > 2))
  .subscribe(console.log); // 3, 4, 5

// Filter by type/property
of(
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 20 }
)
  .pipe(filter(x => x.age >= 25))
  .subscribe(console.log); // Alice, Bob

// Filter with index
of('a', 'b', 'c', 'd', 'e')
  .pipe(filter((value, index) => index % 2 === 0))
  .subscribe(console.log); // 'a', 'c', 'e'

// Chaining map and filter
of(1, 2, 3, 4, 5)
  .pipe(
    map(x => x * 2),     // 2, 4, 6, 8, 10
    filter(x => x > 5),  // 6, 8, 10
    map(x => `${x}`)     // "6", "8", "10"
  )
  .subscribe(console.log);

// Remove null/undefined
of(1, null, 2, undefined, 3)
  .pipe(filter(x => x != null))
  .subscribe(console.log); // 1, 2, 3
```

**Map vs Filter:**
| Aspect | map | filter |
|--------|-----|--------|
| Purpose | Transform | Conditionally emit |
| Output | Every value (transformed) | Only passing values |
| Type | T → R (can change) | T → T (same) |
| Logic | `s.next(transform(v))` | `if (test(v)) s.next(v)` |

**Key Learnings:**
- Conditional emission pattern
- Type preservation semantics
- Index behavior (increments for all values)
- Predicate error handling
- Combining with map for powerful transformations

#### Step 6: Scan & Reduce Operators
**Files:** `operators/scan.ts`, `operators/reduce.ts`

Stateful accumulation operators:
- First operators that maintain internal state
- Accumulate values using accumulator function
- scan: emits after every value (running total)
- reduce: emits only on complete (final total)

**Key Patterns:**
```typescript
// Running sum with scan
of(1, 2, 3, 4, 5)
  .pipe(scan((acc, x) => acc + x, 0))
  .subscribe(console.log);
// Output: 1, 3, 6, 10, 15 (progressive)

// Final sum with reduce
of(1, 2, 3, 4, 5)
  .pipe(reduce((acc, x) => acc + x, 0))
  .subscribe(console.log);
// Output: 15 (final only)

// Building array with scan
of(1, 2, 3)
  .pipe(scan((acc, x) => [...acc, x], []))
  .subscribe(console.log);
// Output: [1], [1,2], [1,2,3]

// State management with scan
actions$.pipe(
  scan((state, action) => {
    switch (action.type) {
      case 'INCREMENT': return { ...state, count: state.count + 1 };
      case 'RESET': return { ...state, count: 0 };
      default: return state;
    }
  }, { count: 0 })
)

// Find maximum with reduce
of(3, 7, 2, 9, 1, 5)
  .pipe(reduce((max, x) => Math.max(max, x), -Infinity))
  .subscribe(console.log);
// Output: 9
```

**scan vs reduce:**
| Aspect | scan | reduce |
|--------|------|--------|
| Emits | After every value | Only on complete |
| Count | N emissions | 1 emission |
| Use | Running totals | Final aggregation |

**Key Learnings:**
- Stateful operator pattern
- Accumulator function design
- When to use scan vs reduce
- State management patterns
- Progressive vs final calculations

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- step1-core
npm test -- step2-creation
npm test -- step3-pipe
npm test -- step4-map
npm test -- step5-filter
npm test -- step6-scan-reduce
npm test -- step7-take-skip-first-last
npm test -- step8-distinct

# Watch mode
npm run test:watch

# With UI
npm run test:ui

# With coverage
npm run test:coverage
```

## Key Implementation Patterns

### 1. Operator Pattern
All operators follow this structure:
```typescript
export function operatorName<T, R>(/* config */): OperatorFunction<T, R> {
  return (source: Observable<T>) => {
    return new Observable<R>(subscriber => {
      return source.subscribe({
        next: value => {
          // Transform value
          subscriber.next(transformedValue);
        },
        error: err => subscriber.error(err),
        complete: () => subscriber.complete()
      });
    });
  };
}
```

### 2. Subscription Management
```typescript
// In operators, return the source subscription for cleanup
return source.subscribe({
  next: value => /* handle */,
  error: err => subscriber.error(err),
  complete: () => subscriber.complete()
}); // This subscription is automatically managed
```

### 3. Early Termination
```typescript
// Check closed state before emitting
for (const value of values) {
  if (subscriber.closed) break; // Stop if unsubscribed
  subscriber.next(value);
}
if (!subscriber.closed) {
  subscriber.complete();
}
```

### 4. Teardown Functions
```typescript
// Return cleanup function from subscribe
new Observable(subscriber => {
  const handler = (e) => subscriber.next(e);
  target.addEventListener('click', handler);

  // Return teardown
  return () => target.removeEventListener('click', handler);
});
```

## Design Decisions

### Why Subscriber extends Subscription?
A Subscriber needs to be both:
1. An **Observer** (has next/error/complete methods)
2. A **Subscription** (has unsubscribe method and teardown logic)

This allows returning the Subscriber directly from `subscribe()`.

### Why use arrow functions for teardown?
```typescript
// ❌ Wrong - loses 'this' context
this._teardowns.add(teardown.unsubscribe);

// ✅ Correct - preserves context
this._teardowns.add(() => teardown.unsubscribe());
```

### Why check both isStopped and closed?
- `isStopped`: Set when error() or complete() is called (terminal events)
- `closed`: Set when unsubscribe() is called (manual cleanup)
- Both prevent further emissions

### Why for...of instead of forEach?
```typescript
// ❌ Can't break early
values.forEach(v => subscriber.next(v));

// ✅ Can check closed and break
for (const v of values) {
  if (subscriber.closed) break;
  subscriber.next(v);
}
```

#### Step 7: Take, Skip, First, Last
**Files:** `operators/take.ts`, `operators/skip.ts`, `operators/first.ts`, `operators/last.ts`

Control which values are emitted:
- First operators with early completion
- Buffering pattern for last value
- Stateful counting with closure variables
- Falsy value handling with hasValue flag

**Key Patterns:**
```typescript
// Take first N values
of(1, 2, 3, 4, 5)
  .pipe(take(3))
  .subscribe(console.log); // 1, 2, 3

// Skip first N values
of(1, 2, 3, 4, 5)
  .pipe(skip(2))
  .subscribe(console.log); // 3, 4, 5

// Get first value only
of(1, 2, 3, 4, 5)
  .pipe(first())
  .subscribe(console.log); // 1

// Get last value only
of(1, 2, 3, 4, 5)
  .pipe(last())
  .subscribe(console.log); // 5

// Get middle elements (combine skip + take)
of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
  .pipe(
    skip(3),   // Skip 1,2,3 → 4-10
    take(4)    // Take 4,5,6,7
  )
  .subscribe(console.log); // 4, 5, 6, 7
```

**Operator Comparison:**
| Operator | Completes Early? | State | Use Case |
|----------|------------------|-------|----------|
| `take(n)` | ✅ After N | Counter | Limit emissions |
| `skip(n)` | ❌ No | Counter | Skip initial values |
| `first()` | ✅ After 1 | Flag | Get first value |
| `last()` | ❌ No | Buffer | Get final value |

**Key Learnings:**
- Early completion pattern (`subscriber.complete()`)
- Counter strategies (increment vs decrement)
- Buffering with hasValue flag (handles falsy values like 0, false, "")
- Closure variables for per-subscription state

---

## Next Steps

#### Step 8: Distinct & DistinctUntilChanged
**Files:** `operators/distinct.ts`, `operators/distinctUntilChanged.ts`

Remove duplicate values:
- Two different deduplication strategies
- Set-based tracking vs single value tracking
- Memory tradeoffs: O(n) vs O(1)
- KeySelector and custom comparators

**Key Patterns:**
```typescript
// distinct() - Remove ALL duplicates
of(1, 2, 1, 3, 2, 4)
  .pipe(distinct())
  .subscribe(console.log); // 1, 2, 3, 4

// With keySelector for objects
of(
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 1, name: 'Alice Again' }
)
  .pipe(distinct(user => user.id))
  .subscribe(console.log); // Alice, Bob

// distinctUntilChanged() - Remove CONSECUTIVE duplicates
of(1, 1, 2, 2, 2, 3, 3, 1, 1)
  .pipe(distinctUntilChanged())
  .subscribe(console.log); // 1, 2, 3, 1

// Custom comparator
state$.pipe(
  distinctUntilChanged((prev, curr) => prev.id === curr.id)
)
```

**Comparison:**
| Aspect | distinct() | distinctUntilChanged() |
|--------|-----------|------------------------|
| Checks Against | All previous | Only previous |
| Memory | O(n) | O(1) |
| Input: `1,2,1,3,2` | Output: `1,2,3` | Output: `1,2,1,3,2` |
| Input: `1,1,2,2,1` | Output: `1,2` | Output: `1,2,1` |

**Key Learnings:**
- Set-based tracking with keySelector pattern
- hasValue flag ensures first value always emits
- Strict equality (`===`) by default
- Memory considerations for infinite streams

---

## Next Steps

**Phase 3: Filtering & Utility Operators** (Complete)
- ✅ Step 7: Take, Skip, First, Last
- ✅ Step 8: Distinct & DistinctUntilChanged

**Phase 4: Combination Operators** (Next)
- Step 9: Merge

See [CLAUDE.md](../CLAUDE.md) for full roadmap and progress.

## Learning Resources

- [RxJS Official Docs](https://rxjs.dev)
- [ReactiveX](http://reactivex.io/)
- [RxJS Marbles](https://rxmarbles.com/) - Visual operator diagrams
- Reference: Official RxJS source in `../rxjs/` directory

## Test Coverage

| Component | Tests | Status |
|-----------|-------|--------|
| Core Observable | 24 | ✅ All passing |
| Creation Functions | 22 | ✅ All passing |
| Pipe Operator | 18 | ✅ All passing |
| Map Operator | 20 | ✅ All passing |
| Filter Operator | 30 | ✅ All passing |
| Scan & Reduce | 33 | ✅ All passing |
| Take, Skip, First, Last | 38 | ✅ All passing |
| Distinct & DistinctUntilChanged | 34 | ✅ All passing |
| **Total** | **219** | **✅ 100%** |

---

*This is a learning project implementing RxJS concepts from scratch. Not intended for production use.*
