import {Value, TimeSpan, Schedule, emulate, t, v} from "../source/emulation"

describe("Schedule", () => {
  describe("merge", () => {
    test("empty", () => {
      const a = new Schedule([])
      const b = new Schedule([])
      expect(a.merge(b)).toMatchSnapshot()
    })

    test("two values", () => {
      const a = new Schedule([new Value(1)])
      const b = new Schedule([new Value(2)])
      expect(a.merge(b)).toMatchSnapshot()
    })

    test("two spans", () => {
      const a = new Schedule([new TimeSpan(10)])
      const b = new Schedule([new TimeSpan(5)])
      expect(a.merge(b)).toMatchSnapshot()
    })

    test("complex", () => {
      const a = new Schedule([new TimeSpan(10), new Value(3)])
      const b = new Schedule([
        new Value(1),
        new TimeSpan(5),
        new Value(2),
        new TimeSpan(5),
        new Value(4),
      ])
      expect(a.merge(b)).toMatchSnapshot()
    })
  })

  describe("constructor", () => {
    test("removes time tail", () => {
      expect(new Schedule([new Value(1), new TimeSpan(10)])).toMatchSnapshot()
    })

    test("removes 0s", () => {
      expect(
        new Schedule([new TimeSpan(0), new Value(1), new TimeSpan(0)]),
      ).toMatchSnapshot()
    })

    test("fuses time spans", () => {
      expect(
        new Schedule([new TimeSpan(5), new TimeSpan(10), new Value(1)]),
      ).toMatchSnapshot()
    })
  })
})

describe("emulate", () => {
  test("map", () => {
    expect(
      emulate(create => {
        return sink => create(t(10), v(1))(x => sink(x + 1))
      }),
    ).toMatchSnapshot()
  })

  test("filter", () => {
    expect(
      emulate(create => {
        return sink =>
          create(v(1), t(10), v(0), t(10), v(1))(x => {
            if (x > 0) sink(x)
          })
      }),
    ).toMatchSnapshot()
  })

  test("order of simultaneous values", () => {
    expect(
      emulate(create => {
        const a = create(t(10), v(1))
        const b = create(t(10), v(2))
        return sink => {
          const disposeA = a(sink)
          const disposeB = b(sink)
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
        return sink => b(a(sink))
      }),
    ).toMatchSnapshot()
  })
})
