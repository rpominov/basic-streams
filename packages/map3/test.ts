import {EventsList, emulate, t, v} from "../emulation"
import map3 from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

function noop() {}

test("preserves disposers", () => {
  const disposer1 = jest.fn()
  const disposer2 = jest.fn()
  const disposer3 = jest.fn()
  map3(
    (x, y, z) => [x, y, z],
    () => disposer1,
    () => disposer2,
    () => disposer3,
  )(noop)()
  expect(disposer1.mock.calls).toMatchSnapshot()
  expect(disposer2.mock.calls).toMatchSnapshot()
  expect(disposer3.mock.calls).toMatchSnapshot()
})

test("updates result when inputs update", () => {
  const result = emulate(create => {
    return map3(
      (x, y, z) => [x, y, z],
      create(t(7), v(1), t(7), v(2)),
      create(t(6), v(3), t(6), v(4)),
      create(t(10), v(5), t(10), v(6)),
    )
  })
  expect(result).toMatchSnapshot()
})
