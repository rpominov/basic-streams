import {EventsList, emulate, t, v} from "../emulation"
import later from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

test("calls cb after the given time", () => {
  const cb = jest.fn()
  later(10)(cb)
  jest.advanceTimersByTime(9)
  expect(cb.mock.calls).toMatchSnapshot()
  jest.advanceTimersByTime(10)
  expect(cb.mock.calls).toMatchSnapshot()
})

test("doesn't call cb after unsusbcribe", () => {
  const cb = jest.fn()
  const unsubscribe = later(10)(cb)
  jest.advanceTimersByTime(9)
  unsubscribe()
  jest.advanceTimersByTime(10)
  expect(cb.mock.calls).toMatchSnapshot()
})
