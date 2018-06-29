import {EventsList, emulate, t, v} from "../emulation"
import takeWhile from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

function noop() {}

function always(x: any): true {
  return true
}

function never(x: any): false {
  return false
}

test("calls disposer of source stream when we dispose result stream erlier", () => {
  const disposer = jest.fn()
  takeWhile(always, () => disposer)(noop)()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("doesn't call disposer twice", () => {
  const disposer = jest.fn()
  takeWhile(never, cb => {
    cb(1)
    return disposer
  })(noop)()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("takes values that satisfy predicate until first value that don't then calls disposer (async)", () => {
  const cb = jest.fn()
  let inCb = null
  takeWhile(
    x => x < 3,
    _cb => {
      inCb = _cb
      return () => {
        inCb = null
      }
    },
  )(cb)
  inCb(1)
  inCb(2)
  expect(typeof inCb).toBe("function")
  inCb(3)
  expect(inCb).toBe(null)
  expect(cb.mock.calls).toMatchSnapshot()
})

test("takes values that satisfy predicate until first value that don't then calls disposer (sync)", () => {
  const disposer = jest.fn()
  const cb = jest.fn()
  takeWhile(
    x => x < 3,
    inCb => {
      inCb(1)
      inCb(2)
      inCb(3)
      inCb(1)
      return disposer
    },
  )(cb)
  expect(disposer.mock.calls).toMatchSnapshot()
  expect(cb.mock.calls).toMatchSnapshot()
})

test("return empty stream if predicate is () => false", () => {
  const result = emulate(create => {
    return takeWhile(never, create(t(10), v(1), t(10), v(2)))
  })
  expect(result).toMatchSnapshot()
})

test("contains correct values at correct time", () => {
  const result = emulate(create => {
    return takeWhile(
      x => x < 3,
      create(t(10), v(1), t(10), v(2), t(10), v(3), t(10), v(4)),
    )
  })
  expect(result).toMatchSnapshot()
})
