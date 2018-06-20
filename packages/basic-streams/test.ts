import {EventsList, emulate, t, v} from "@basic-streams/emulation"

expect.addSnapshotSerializer(EventsList.jestSerializer)

test("", () => {
  expect(null).toBe(null)
})
