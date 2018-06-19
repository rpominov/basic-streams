import {EventsList, emulate, t, v} from "@basic-streams/emulation"
import ap from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

test("preserves disposers", () => {
  const disposer1 = jest.fn()
  const disposer2 = jest.fn()
  ap(() => disposer1, () => disposer2)(() => {})()
  expect(disposer1.mock.calls).toMatchSnapshot()
  expect(disposer2.mock.calls).toMatchSnapshot()
})

test("updates result when inputs update", () => {
  const result = emulate(create => {
    return ap(
      create(t(6), v(x => x + 1), t(6), v(x => x - 1)),
      create(t(10), v(10), t(10), v(5)),
    )
  })
  expect(result).toMatchSnapshot()
})
