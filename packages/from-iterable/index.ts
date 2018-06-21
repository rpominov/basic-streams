import {Stream} from "@basic-streams/stream"
import later from "@basic-streams/later"

function noop() {}

type IteratorResult<T> =
  | {done: true; value: undefined}
  | {done: false; value: T}

interface IteratorLike<T> {
  next(): IteratorResult<T>
}

function getIterator<T>(iterable: Iterable<T>): IteratorLike<T> {
  const maybeIteratorGetter =
    typeof Symbol === "function" && iterable[Symbol.iterator]
  if (maybeIteratorGetter) {
    return maybeIteratorGetter.call(iterable)
  }
  if (Array.isArray(iterable)) {
    let i = 0
    return {
      next() {
        return i >= iterable.length
          ? {value: undefined, done: true}
          : {value: iterable[i++], done: false}
      },
    }
  }
  throw new TypeError("a value provided to fromIterable() isn't an Iterable")
}

export default function fromIterable<T>(
  xs: Iterable<T>,
  interval?: number,
  scheduler = later,
): Stream<T> {
  return cb => {
    // without interval
    const iterator = getIterator(xs)
    if (interval === undefined) {
      let next = iterator.next()
      while (!next.done) {
        cb(next.value)
        next = iterator.next()
      }
      return noop
    }

    // with interval
    const schedulerStream = scheduler(interval)
    let inLoop = false
    let next: null | IteratorResult<T> = null
    let schedulerDisposer: null | (() => void) = null
    let firstDisposer = schedulerStream(function step() {
      next = iterator.next()
      if (inLoop) {
        return
      }
      inLoop = true
      while (next !== null) {
        if (next.done) {
          return
        }
        const {value} = next
        next = null
        schedulerDisposer = schedulerStream(step)
        cb(value)
      }
      inLoop = false
    })
    if (schedulerDisposer === null) {
      schedulerDisposer = firstDisposer
    }
    return () => {
      if (schedulerDisposer !== null) schedulerDisposer()
    }
  }
}
