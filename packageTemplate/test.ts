import {EventsList, emulate, t, v} from "@basic-streams/emulation"
import exportName from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

test("returns null", () => {
  expect(exportName()).toBe(null)
})
