import {EventsList, emulate, t, v} from "@basic-streams/emulation"
import map from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

test("preserves disposer", () => {
  const disposer = jest.fn()
  map(x => x, cb => disposer)(() => {})()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("modifies values with provided fn", () => {
  const result = emulate(create => {
    return map(x => x + 1, create(t(10), v(1), t(10), v(2)))
  })
  expect(result).toMatchSnapshot()
})
