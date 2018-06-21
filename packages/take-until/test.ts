import {EventsList, emulate, t, v} from "../emulation"
import takeUntil from "./index"
import of from "../of/index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

function noop() {}

test("calls disposers when we dispose result stream erlier", () => {
  const disposer1 = jest.fn()
  const disposer2 = jest.fn()
  takeUntil(() => disposer1, () => disposer2)(noop)()
  expect(disposer1.mock.calls).toMatchSnapshot()
  expect(disposer2.mock.calls).toMatchSnapshot()
})

test("calls disposers after first value in controller", () => {
  const disposer1 = jest.fn()
  const disposer2 = jest.fn()
  takeUntil(cb => {
    cb(0)
    return disposer1
  }, () => disposer2)(noop)()
  expect(disposer1.mock.calls).toMatchSnapshot()
  expect(disposer2.mock.calls).toMatchSnapshot()
})

test("calls disposers properly (async value in controller)", () => {
  const disposer1 = jest.fn()
  const disposer2 = jest.fn()
  let cb = null
  const controller = _cb => {
    cb = _cb
    return disposer1
  }
  const disposer = takeUntil(controller, () => disposer2)(noop)
  cb && cb(0)
  disposer() // should't cause additional call of disposers
  expect(disposer1.mock.calls).toMatchSnapshot()
  expect(disposer2.mock.calls).toMatchSnapshot()
})

test("doesn't contain values after value from controller", () => {
  const result = emulate(create => {
    return takeUntil(
      create(t(25), v(1)),
      create(t(10), v(1), t(10), v(2), t(10), v(3)),
    )
  })
  expect(result).toMatchSnapshot()
})

test("doesn't contain values after sync value from controller", () => {
  const result = emulate(create => {
    return takeUntil(of(null), create(t(10), v(1), t(10), v(2), t(10), v(3)))
  })
  expect(result).toMatchSnapshot()
})

test("subscribes first to controller and then to source", () => {
  const cb = jest.fn()
  takeUntil(of(null), of(1))
  expect(cb.mock.calls).toMatchSnapshot()
})
