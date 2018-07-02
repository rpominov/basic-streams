import {EventsList, emulate, t, v} from "../emulation"
import multicast from "./index"
import ofMany from "../of-many"

expect.addSnapshotSerializer(EventsList.jestSerializer)

function noop() {}

test("first subscribers gets sync events", () => {
  const cb = jest.fn()
  multicast(ofMany([1, 2]))(cb)
  expect(cb.mock.calls).toMatchSnapshot()
})

test("second subscriber doesn't get sync events", () => {
  const cb = jest.fn()
  const stream = multicast(ofMany([1, 2]))
  stream(noop)
  stream(cb)
  expect(cb.mock.calls).toMatchSnapshot()
})

test("first and second sunscribers get same async events", () => {
  const cb1 = jest.fn()
  const cb2 = jest.fn()
  let inCb = null
  const stream = multicast(_inCb => {
    inCb = _inCb
    return () => {
      inCb = null
    }
  })
  stream(cb1)
  stream(cb2)
  inCb(1)
  inCb(2)
  expect(cb1.mock.calls).toMatchSnapshot()
  expect(cb2.mock.calls).toMatchSnapshot()
})

test("subscriber doesn't get event after unsub() in response to that event", () => {
  const cb = jest.fn()
  let inCb = null
  let stream = multicast(_inCb => {
    inCb = _inCb
    return () => {
      inCb = null
    }
  })
  let unsub = null
  stream(x => {
    if (x === 2) {
      unsub && unsub()
    }
  })
  unsub = stream(cb)
  inCb(1)
  inCb(2)
  inCb(3)
  expect(cb.mock.calls).toMatchSnapshot()
})

test("preserves disposer (single subscriber)", () => {
  const disposer = jest.fn()
  multicast(cb => disposer)(noop)()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("preserves disposer (two subscribers)", () => {
  const disposer = jest.fn()
  const stream = multicast(cb => disposer)
  const unsub1 = stream(noop)
  const unsub2 = stream(noop)
  unsub1()
  unsub2()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("unsub doesn't remove another version of same subscriber", () => {
  const subscriber = jest.fn()
  let inCb = null
  const stream = multicast(_inCb => {
    inCb = _inCb
    return () => {
      inCb = null
    }
  })
  const unsub = stream(subscriber)
  stream(subscriber)
  unsub()
  unsub() // should be noop
  inCb(1)
  expect(subscriber.mock.calls).toMatchSnapshot()
})
