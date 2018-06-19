import {EventsList, emulate, t, v} from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

describe("emulate", () => {
  test("map", () => {
    expect(
      emulate(create => {
        return cb => create(t(10), v(1))(x => cb(x + 1))
      }),
    ).toMatchSnapshot()
  })

  test("filter", () => {
    expect(
      emulate(create => {
        return cb =>
          create(v(1), t(10), v(0), t(10), v(1))(x => {
            if (x > 0) cb(x)
          })
      }),
    ).toMatchSnapshot()
  })

  test("order of simultaneous values", () => {
    expect(
      emulate(create => {
        const a = create(t(10), v(1))
        const b = create(t(10), v(2))
        return cb => {
          const disposeA = a(cb)
          const disposeB = b(cb)
          return () => {
            disposeA()
            disposeB()
          }
        }
      }),
    ).toMatchSnapshot()
  })

  test("unsubscribe", () => {
    expect(
      emulate(create => {
        const a = create(t(10), v(1), t(10), v(0))
        const b = create(t(15), v(null))
        return cb => b(a(cb))
      }),
    ).toMatchSnapshot()
  })

  test("unsubscribe doesn't remove other values with same cb", () => {
    expect(
      emulate(create => {
        const a = create(t(10), v(1), t(10), v(0))
        const b = create(t(10), v(1), t(10), v(0))
        const unsubscriber = create(t(15), v(null))
        return cb => {
          a(cb)
          unsubscriber(b(cb))
          return () => {}
        }
      }),
    ).toMatchSnapshot()
  })
})
