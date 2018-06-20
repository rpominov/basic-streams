import {EventsList, emulate, t, v} from "@basic-streams/emulation"
import of from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

test("calls callback with the value", () => {
  const cb = jest.fn()
  of(1)(cb)
  expect(cb.mock.calls).toMatchSnapshot()
})
