import {EventsList, emulate, t, v} from "@basic-streams/emulation"
import merge from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

test("preserves disposers", () => {
  const disposer1 = jest.fn()
  const disposer2 = jest.fn()
  const disposer3 = jest.fn()
  merge([() => disposer1, () => disposer2, () => disposer3])(() => {})()
  expect(disposer1.mock.calls).toMatchSnapshot()
  expect(disposer2.mock.calls).toMatchSnapshot()
  expect(disposer3.mock.calls).toMatchSnapshot()
})

test("result stream contains values from sources", () => {
  const result = emulate(create => {
    return merge([
      create(t(7), v(1), t(7), v(2)),
      create(t(6), v(3), t(6), v(4)),
      create(t(10), v(5), t(10), v(6)),
    ])
  })
  expect(result).toMatchSnapshot()
})
