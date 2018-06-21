import {EventsList, emulate, t, v} from "../emulation"
import scan from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

function append<T>(xs: T[], x: T): T[] {
  return xs.concat([x])
}

test("preserves disposer", () => {
  const disposer = jest.fn()
  scan(append, [], cb => disposer)(() => {})()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("contains correct values", () => {
  const result = emulate(create => {
    return scan(append, [], create(t(10), v(1), t(10), v(2)))
  })
  expect(result).toMatchSnapshot()
})
