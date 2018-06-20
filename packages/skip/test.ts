import {EventsList, emulate, t, v} from "@basic-streams/emulation"
import skip from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

test("preserves disposer", () => {
  const disposer = jest.fn()
  skip(0, cb => disposer)(() => {})()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("skips first N items", () => {
  const result = emulate(create => {
    return skip(2, create(t(10), v(1), t(10), v(2), t(10), v(3)))
  })
  expect(result).toMatchSnapshot()
})

test("returns equivalent stream if N is 0", () => {
  const result = emulate(create => {
    return skip(0, create(t(10), v(1), t(10), v(2), t(10), v(3)))
  })
  expect(result).toMatchSnapshot()
})
