import {EventsList, emulate, t, v} from "@basic-streams/emulation"
import chainLatest from "./index"
import of from "../of/index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

function noop() {}

test("preserves disposer of main sream", () => {
  const disposer = jest.fn()
  chainLatest(x => of(x), cb => disposer)(noop)()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("preserves disposer of spawned streams", () => {
  const disposer = jest.fn()
  chainLatest(() => cb => disposer, of(null))(noop)()
  expect(disposer.mock.calls).toMatchSnapshot()
})

test("result stream contains values from spawned at correct time", () => {
  const result = emulate(create => {
    return chainLatest(
      x => create(t(1), v(x * 2), t(1), v(x * 3)),
      create(t(10), v(1), t(10), v(2)),
    )
  })
  expect(result).toMatchSnapshot()
})

test("doesn't contain values emited from old spawned streams", () => {
  const result = emulate(create => {
    return chainLatest(
      x => create(t(6), v(x * 2), t(6), v(x * 3)),
      create(t(10), v(1), t(10), v(2)),
    )
  })
  expect(result).toMatchSnapshot()
})
