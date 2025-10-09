/**
 * My Signals - A learning implementation of reactive programming
 *
 * This is the main entry point for the library.
 * As we build each component, we'll export it from here.
 */

// Core exports
export { Observable } from './core/Observable';
export { Subscriber } from './core/Subscriber';
export { Subscription } from './core/Subscription';
export { pipe } from './core/pipe';

// Types
export * from './core/types';

// Observable creation functions
export { of } from './observable/of';
export { from } from './observable/from';
export { fromEvent } from './observable/fromEvent';
export { merge } from './observable/merge';
export { concat } from './observable/concat';

// Transformation operators
export { map } from './operators/map';
export { scan } from './operators/scan';
export { reduce } from './operators/reduce';

// Filtering & utility operators
export { filter } from './operators/filter';
export { take } from './operators/take';
export { skip } from './operators/skip';
export { first } from './operators/first';
export { last } from './operators/last';
export { distinct } from './operators/distinct';
export { distinctUntilChanged } from './operators/distinctUntilChanged';

// Combination operators
export { mergeWith } from './operators/mergeWith';
export { mergeAll } from './operators/mergeAll';
export { concatWith } from './operators/concatWith';
export { concatAll } from './operators/concatAll';

// Subjects (to be implemented)
// export { Subject } from './subjects/Subject';
