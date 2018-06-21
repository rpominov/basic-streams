import {EventsList, emulate, t, v} from "../emulation"
import take from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

function noop() {}

test("calls disposer of source stream when we dispose result stream", () => {
  const disposer = jest.fn()
  take(1, () => disposer)(noop)()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("doesn't call disposer twice", () => {
  const disposer = jest.fn()
  take(1, cb => {
    cb(1)
    return disposer
  })(noop)()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("takes first n and then calls disposer of source stream (async)", () => {
  const cb = jest.fn()
  let inCb = null
  take(2, _inCb => {
    inCb = _inCb
    return () => {
      inCb = null
    }
  })(cb)
  inCb(1)
  expect(typeof inCb).toBe("function")
  inCb(2)
  expect(inCb).toBe(null)
  expect(cb.mock.calls).toMatchSnapshot()
})

test("takes first n and then calls disposer of source stream (sync)", () => {
  const disposer = jest.fn()
  const cb = jest.fn()
  take(2, inCb => {
    inCb(1)
    inCb(2)
    inCb(3)
    return disposer
  })(cb)
  expect(disposer.mock.calls).toMatchSnapshot()
  expect(cb.mock.calls).toMatchSnapshot()
})

test("subscribes to source even if n is 0", () => {
  const stream = jest.fn(() => noop)
  take(0, stream)(noop)
  expect(stream.mock.calls).toMatchSnapshot()
})

test("contains correct values at correct time", () => {
  const result = emulate(create => {
    return take(1, create(t(10), v(1), t(10), v(2)))
  })
  expect(result).toMatchSnapshot()
})

test("if n is 0 returns empty stream", () => {
  const result = emulate(create => {
    return take(0, create(t(10), v(1), t(10), v(2)))
  })
  expect(result).toMatchSnapshot()
})
