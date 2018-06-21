import {EventsList, emulate, t, v} from "../emulation"
import empty from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

test("subscriber is never called", () => {
  const cb = jest.fn()
  empty()(cb)()
  expect(cb.mock.calls).toMatchSnapshot()
})
