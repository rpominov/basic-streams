import {EventsList, emulate, t, v} from "../emulation"
import filter from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

test("preserves disposer", () => {
  const disposer = jest.fn()
  filter(() => true, cb => disposer)(() => {})()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("removes values", () => {
  const result = emulate(create => {
    return filter(x => x !== 1, create(t(10), v(1), t(10), v(2)))
  })
  expect(result).toMatchSnapshot()
})
