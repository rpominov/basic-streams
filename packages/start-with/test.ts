import {EventsList, emulate, t, v} from "@basic-streams/emulation"
import startWith from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

test("preserves disposer", () => {
  const disposer = jest.fn()
  startWith(0, cb => disposer)(() => {})()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("adds a value", () => {
  const result = emulate(create => {
    return startWith(0, create(t(10), v(1), t(10), v(2)))
  })
  expect(result).toMatchSnapshot()
})
