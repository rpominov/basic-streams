import {EventsList, emulate, t, v} from "@basic-streams/emulation"
import fromIterable from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

test("works with array", () => {
  const cb = jest.fn()
  fromIterable([1, 2, 3])(cb)
  expect(cb.mock.calls).toMatchSnapshot()
})

test("works with generator", () => {
  const cb = jest.fn()
  fromIterable(
    (function*() {
      yield 1
      yield 2
      yield 3
    })(),
  )(cb)
  expect(cb.mock.calls).toMatchSnapshot()
})
