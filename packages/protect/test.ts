import {EventsList, emulate, t, v} from "@basic-streams/emulation"
import protect from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

function noop() {}

test("fixes usage #1: `stream` must be called with one argument, `cb`", () => {
  const stream = jest.fn()
  protect(stream)(noop, 1)
  expect(stream.mock.calls).toMatchSnapshot()
})

test("fixes usage #3: `cb` must always return `undefined`", () => {
  const subscriber = () => 1
  protect(cb => {
    expect(cb(0)).toBeUndefined()
    return () => {}
  })(subscriber)
})

test("fixes usage #4: `disposer` must be called with no arguments", () => {
  const disposer = jest.fn()
  protect(() => disposer)(noop)(1, 2)
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("fixes usage #5: `disposer` must be called at most once", () => {
  const disposer = jest.fn()
  const disposer1 = protect(() => disposer)(noop)
  disposer1()
  disposer1()
  expect(disposer.mock.calls).toMatchSnapshot()
})
