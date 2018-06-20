import {EventsList, emulate, t, v} from "@basic-streams/emulation"
import fromLoose from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

function noop() {}

test("callback is called", () => {
  const result = emulate(create => {
    return fromLoose(create(t(10), v(1), t(10), v(2)))
  })
  expect(result).toMatchSnapshot()
})

test("disposer is called", () => {
  const disposer = jest.fn()
  fromLoose(() => disposer)(noop)()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("fixes stream #3: It must return unsubscribe function (aka `disposer`)", () => {
  expect(typeof fromLoose(() => {})(noop)).toBe("function")
})

test("fixes stream #4: `cb` must be called with one argument", () => {
  const cb = jest.fn()
  fromLoose(inCb => {
    inCb(1, 2)
  })(cb)
  expect(cb.mock.calls).toMatchSnapshot()
})

test("fixes stream #5: `disposer` must always return `undefined`", () => {
  expect(fromLoose(() => () => 1)(noop)()).toBeUndefined()
})

test("fixes stream #6: After `disposer` was called, `cb` must not be called", () => {
  const cb = jest.fn()
  let inCb
  const unsub = fromLoose(_inCb => {
    inCb = _inCb
  })(cb)
  unsub()
  inCb(1)
  expect(cb.mock.calls).toMatchSnapshot()
})

test("fixes usage #1: `stream` must be called with one argument, `cb`", () => {
  const stream = jest.fn()
  ;(fromLoose(stream) as any)(noop, 1)
  expect(stream.mock.calls).toMatchSnapshot()
})

test("fixes usage #3: `cb` must always return `undefined`", () => {
  const subscriber = () => 1
  fromLoose(cb => {
    expect(cb(0)).toBeUndefined()
  })(subscriber)
})

test("fixes usage #4: `disposer` must be called with no arguments", () => {
  const disposer = jest.fn()
  ;(fromLoose(() => disposer)(noop) as any)(1, 2)
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("fixes usage #5: `disposer` must be called at most once", () => {
  const disposer = jest.fn()
  const disposer1 = fromLoose(() => disposer)(noop)
  disposer1()
  disposer1()
  expect(disposer.mock.calls).toMatchSnapshot()
})
