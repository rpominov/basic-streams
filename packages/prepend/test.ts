import {EventsList, emulate, t, v} from "../emulation"
import prepend from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

test("preserves disposer", () => {
  const disposer = jest.fn()
  prepend(0, cb => disposer)(() => {})()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("adds a value", () => {
  const result = emulate(create => {
    return prepend(0, create(t(10), v(1), t(10), v(2)))
  })
  expect(result).toMatchSnapshot()
})
