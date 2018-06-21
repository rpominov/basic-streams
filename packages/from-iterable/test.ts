import {EventsList, emulate, t, v, laterMock} from "../emulation"
import fromIterable from "./index"
import take from "../take"

expect.addSnapshotSerializer(EventsList.jestSerializer)

test("works with array", () => {
  const cb = jest.fn()
  const array = [1, 2, 3]
  if (typeof Symbol === "function" && array[Symbol.iterator]) {
    array[Symbol.iterator] = undefined
  }
  fromIterable(array)(cb)
  expect(cb.mock.calls).toMatchSnapshot()
})

test("works with generator", () => {
  const cb = jest.fn()
  fromIterable(
    (function*() {
      yield 1
      yield 2
      yield 3
    })(),
  )(cb)
  expect(cb.mock.calls).toMatchSnapshot()
})

test("when interval provided spreads values in time", () => {
  const result = emulate(create => {
    return fromIterable([1, 2, 3], 10, laterMock(create))
  })
  expect(result).toMatchSnapshot()
})

test("when interval provided disposer works", () => {
  function unsafeTakeOne(stream) {
    return cb => {
      let disposer = stream(x => {
        cb(x)
        disposer()
      })
      return disposer
    }
  }
  const result = emulate(create => {
    return unsafeTakeOne(fromIterable([1, 2, 3], 10, laterMock(create)))
  })
  expect(result).toMatchSnapshot()
})

test("doesn't blow up call stack when scheduler is synchronous", () => {
  function scheduler(time, value) {
    return cb => {
      cb(value)
      return () => {}
    }
  }
  function* generator() {
    for (let i = 0; i <= 1000000; i++) {
      yield i
    }
  }
  const stream = fromIterable(generator(), 10, scheduler)
  let count = 0
  let latestValue = null
  function cb(value) {
    count++
    latestValue = value
  }
  expect(() => stream(cb)).not.toThrow()
  expect({count, latestValue}).toMatchSnapshot()
})

test("correctly handles disposers when scheduler runs synchronously only first time", () => {
  const disposer = jest.fn()
  let runned = false
  function scheduler(time, value) {
    return cb => {
      if (!runned) {
        runned = true
        cb(value)
        return () => {}
      }
      return disposer
    }
  }
  fromIterable([1, 2], 0, scheduler)(() => {})()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("doesn't drain iterable eagerly", () => {
  function* generator() {
    yield 1
    throw new Error("should not be reached")
  }
  expect(() =>
    emulate(create => {
      return take(1, fromIterable(generator(), 10, laterMock(create)))
    }),
  ).not.toThrow()
})
