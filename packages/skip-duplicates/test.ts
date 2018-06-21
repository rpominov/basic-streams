import {EventsList, emulate, t, v} from "../emulation"
import skipDuplicates from "./index"
import of from "../of/index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

function close(x: number, y: number): boolean {
  return Math.abs(x - y) < 1
}

test("preserves disposer", () => {
  const disposer = jest.fn()
  skipDuplicates(() => false, cb => disposer)(() => {})()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("doesn't apply comparator to the first element", () => {
  const comparator = jest.fn(close)
  skipDuplicates(comparator, of(1))(() => {})
  expect(comparator.mock.calls).toMatchSnapshot()
})

test("removes duplicates", () => {
  const result = emulate(create => {
    return skipDuplicates(
      close,
      create(t(10), v(1), t(10), v(1.5), t(10), v(3)),
    )
  })
  expect(result).toMatchSnapshot()
})
