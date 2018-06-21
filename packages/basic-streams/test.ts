import {EventsList, emulate, t, v} from "../emulation"

expect.addSnapshotSerializer(EventsList.jestSerializer)

test("", () => {
  expect(null).toBe(null)
})
