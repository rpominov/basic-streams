import {EventsList, emulate, t, v} from "../emulation"
import skipWhile from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

test("preserves disposer", () => {
  const disposer = jest.fn()
  skipWhile(() => false, cb => disposer)(() => {})()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("skips first items that satisfy predicate", () => {
  const result = emulate(create => {
    return skipWhile(x => x < 3, create(t(10), v(1), t(10), v(2), t(10), v(3)))
  })
  expect(result).toMatchSnapshot()
})

test("returns equivalent stream if predicate is () => false", () => {
  const result = emulate(create => {
    return skipWhile(() => false, create(t(10), v(1), t(10), v(2), t(10), v(3)))
  })
  expect(result).toMatchSnapshot()
})

test("returns empty stream if predicate is () => true", () => {
  const result = emulate(create => {
    return skipWhile(() => true, create(t(10), v(1), t(10), v(2), t(10), v(3)))
  })
  expect(result).toMatchSnapshot()
})
