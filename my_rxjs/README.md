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
│   │   └── map.ts         # Transform values with projection function
│   ├── subjects/          # Subjects (coming soon)
│   └── index.ts           # Public API exports
│
└── tests/                 # Vitest test suites
    ├── step1-core.test.ts      # 24 tests - Core Observable
    ├── step2-creation.test.ts  # 22 tests - Creation functions
    └── step3-pipe.test.ts      # 18 tests - Pipe operator
```

## Implementation Status

### ✅ Phase 1: Foundation (Complete - 64/64 tests passing)
### 🔄 Phase 2: Transformation Operators (In Progress - 20/20 tests passing)

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

## Next Steps

**Phase 2: Transformation Operators** (In Progress)
- ✅ Step 4: Map operator
- Step 5: Filter operator (next)
- Step 6: Scan & Reduce operators

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
| **Total** | **84** | **✅ 100%** |

---

*This is a learning project implementing RxJS concepts from scratch. Not intended for production use.*
