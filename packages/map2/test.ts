import {EventsList, emulate, t, v} from "@basic-streams/emulation"
import map2 from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

test("preserves disposers", () => {
  const disposer1 = jest.fn()
  const disposer2 = jest.fn()
  map2((x, y) => null, () => disposer1, () => disposer2)(() => {})()
  expect(disposer1.mock.calls).toMatchSnapshot()
  expect(disposer2.mock.calls).toMatchSnapshot()
})

test("updates result when inputs update", () => {
  const result = emulate(create => {
    return map2(
      (x, y) => x + y / 10,
      create(t(6), v(1), t(6), v(2)),
      create(t(10), v(3), t(10), v(4)),
    )
  })
  expect(result).toMatchSnapshot()
})
