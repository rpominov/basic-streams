import {EventsList, emulate, t, v} from "@basic-streams/emulation"
import Stream from "./Stream"
import {
  empty,
  of,
  fromIterable,
  fromLoose,
  map,
  filter,
  chain,
  chainLatest,
  ap,
  map2,
  map3,
  combineArray,
  merge,
  scan,
  take,
  takeWhile,
  takeUntil,
  skip,
  skipWhile,
  skipDuplicates,
  startWith,
  multicast,
} from "./index"

expect.addSnapshotSerializer(EventsList.jestSerializer)

function noop() {}

function always(x: any): true {
  return true
}

function never(x: any): false {
  return false
}

function id<T>(x: T): T {
  return x
}

function append<T>(xs: T[], x: T): T[] {
  return xs.concat([x])
}

function inc(x: number): number {
  return x + 1
}

function dec(x: number): number {
  return x - 1
}

describe("empty", () => {
  test("subscriber is never called", () => {
    const cb = jest.fn()
    empty()(cb)()
    expect(cb.mock.calls).toMatchSnapshot()
  })
})

describe("of", () => {
  test("calls callback with the value", () => {
    const cb = jest.fn()
    of(1)(cb)
    expect(cb.mock.calls).toMatchSnapshot()
  })
})

describe("fromIterable", () => {
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
})

describe("fromLoose", () => {
  test("callback is called", () => {
    const result = emulate(create => {
      return fromLoose(create(t(10), v(1), t(10), v(2)))
    })
    expect(result).toMatchSnapshot()
  })

  test("disposer is called", () => {
    const disposer = jest.fn()
    fromLoose(() => disposer)(noop)()
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("fixes stream #3: It must return unsubscribe function (aka `disposer`)", () => {
    expect(typeof fromLoose(() => {})(noop)).toBe("function")
  })

  test("fixes stream #4: `cb` must be called with one argument", () => {
    const cb = jest.fn()
    fromLoose(inCb => {
      inCb(1, 2)
    })(cb)
    expect(cb.mock.calls).toMatchSnapshot()
  })

  test("fixes stream #5: `disposer` must always return `undefined`", () => {
    expect(fromLoose(() => () => 1)(noop)()).toBeUndefined()
  })

  test("fixes stream #6: After `disposer` was called, `cb` must not be called", () => {
    const cb = jest.fn()
    let inCb
    const unsub = fromLoose(_inCb => {
      inCb = _inCb
    })(cb)
    unsub()
    inCb(1)
    expect(cb.mock.calls).toMatchSnapshot()
  })

  test("fixes usage #1: `stream` must be called with one argument, `cb`", () => {
    const stream = jest.fn()
    ;(fromLoose(stream) as any)(noop, 1)
    expect(stream.mock.calls).toMatchSnapshot()
  })

  test("fixes usage #3: `cb` must always return `undefined`", () => {
    const subscriber = () => 1
    fromLoose(cb => {
      expect(cb(0)).toBeUndefined()
    })(subscriber)
  })

  test("fixes usage #4: `disposer` must be called with no arguments", () => {
    const disposer = jest.fn()
    ;(fromLoose(() => disposer)(noop) as any)(1, 2)
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("fixes usage #5: `disposer` must be called at most once", () => {
    const disposer = jest.fn()
    const disposer1 = fromLoose(() => disposer)(noop)
    disposer1()
    disposer1()
    expect(disposer.mock.calls).toMatchSnapshot()
  })
})

describe("map", () => {
  test("preserves disposer", () => {
    const disposer = jest.fn()
    map(id, cb => disposer)(noop)()
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("modifies values with provided fn", () => {
    const result = emulate(create => {
      return map(inc, create(t(10), v(1), t(10), v(2)))
    })
    expect(result).toMatchSnapshot()
  })
})

describe("filter", () => {
  test("preserves disposer", () => {
    const disposer = jest.fn()
    filter(always, cb => disposer)(noop)()
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("removes values", () => {
    const result = emulate(create => {
      return filter(x => x !== 1, create(t(10), v(1), t(10), v(2)))
    })
    expect(result).toMatchSnapshot()
  })
})

describe("chain", () => {
  test("preserves disposer of main sream", () => {
    const disposer = jest.fn()
    chain(x => of(x), cb => disposer)(noop)()
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("preserves disposer of spawned streams", () => {
    const disposer = jest.fn()
    chain(() => cb => disposer, of(null))(noop)()
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("result stream contains values from spawned at correct time", () => {
    const result = emulate(create => {
      return chain(
        x => create(t(1), v(x * 2), t(1), v(x * 3)),
        create(t(10), v(1), t(10), v(2)),
      )
    })
    expect(result).toMatchSnapshot()
  })
})

describe("chainLatest", () => {
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
})

describe("ap", () => {
  test("preserves disposers", () => {
    const disposer1 = jest.fn()
    const disposer2 = jest.fn()
    ap(() => disposer1, () => disposer2)(noop)()
    expect(disposer1.mock.calls).toMatchSnapshot()
    expect(disposer2.mock.calls).toMatchSnapshot()
  })

  test("updates result when inputs update", () => {
    const result = emulate(create => {
      return ap(
        create(t(6), v(inc), t(6), v(dec)),
        create(t(10), v(10), t(10), v(5)),
      )
    })
    expect(result).toMatchSnapshot()
  })
})

describe("map2", () => {
  test("preserves disposers", () => {
    const disposer1 = jest.fn()
    const disposer2 = jest.fn()
    map2((x, y) => [x, y], () => disposer1, () => disposer2)(noop)()
    expect(disposer1.mock.calls).toMatchSnapshot()
    expect(disposer2.mock.calls).toMatchSnapshot()
  })

  test("updates result when inputs update", () => {
    const result = emulate(create => {
      return map2(
        (x, y) => [x, y],
        create(t(6), v(1), t(6), v(2)),
        create(t(10), v(3), t(10), v(4)),
      )
    })
    expect(result).toMatchSnapshot()
  })
})

describe("map3", () => {
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
})

describe("combineArray", () => {
  test("preserves disposers", () => {
    const disposer1 = jest.fn()
    const disposer2 = jest.fn()
    const disposer3 = jest.fn()
    combineArray([() => disposer1, () => disposer2, () => disposer3])(noop)()
    expect(disposer1.mock.calls).toMatchSnapshot()
    expect(disposer2.mock.calls).toMatchSnapshot()
    expect(disposer3.mock.calls).toMatchSnapshot()
  })

  test("result stream contains values from sources", () => {
    const result = emulate(create => {
      return combineArray([
        create(t(7), v(1), t(7), v(2)),
        create(t(6), v(3), t(6), v(4)),
        create(t(10), v(5), t(10), v(6)),
        create(v(7)),
      ])
    })
    expect(result).toMatchSnapshot()
  })

  test("works with one stream", () => {
    const result = emulate(create => {
      return combineArray([create(t(7), v(1), t(7), v(2))])
    })
    expect(result).toMatchSnapshot()
  })

  test("works with zero streams", () => {
    const result = emulate(create => {
      return combineArray([])
    })
    expect(result).toMatchSnapshot()
  })
})

describe("merge", () => {
  test("preserves disposers", () => {
    const disposer1 = jest.fn()
    const disposer2 = jest.fn()
    const disposer3 = jest.fn()
    merge([() => disposer1, () => disposer2, () => disposer3])(noop)()
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
})

describe("scan", () => {
  test("preserves disposer", () => {
    const disposer = jest.fn()
    scan(append, [], cb => disposer)(noop)()
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("contains correct values", () => {
    const result = emulate(create => {
      return scan(append, [], create(t(10), v(1), t(10), v(2)))
    })
    expect(result).toMatchSnapshot()
  })
})

describe("take", () => {
  test("calls disposer of source stream when we dispose result stream", () => {
    const disposer = jest.fn()
    take(1, () => disposer)(noop)()
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("doesn't call disposer twice", () => {
    const disposer = jest.fn()
    take(1, cb => {
      cb(1)
      return disposer
    })(noop)()
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("takes first n and then calls disposer of source stream (async)", () => {
    const cb = jest.fn()
    let inCb = null
    take(2, _inCb => {
      inCb = _inCb
      return () => {
        inCb = null
      }
    })(cb)
    inCb(1)
    expect(typeof inCb).toBe("function")
    inCb(2)
    expect(inCb).toBe(null)
    expect(cb.mock.calls).toMatchSnapshot()
  })

  test("takes first n and then calls disposer of source stream (sync)", () => {
    const disposer = jest.fn()
    const cb = jest.fn()
    take(2, inCb => {
      inCb(1)
      inCb(2)
      inCb(3)
      return disposer
    })(cb)
    expect(disposer.mock.calls).toMatchSnapshot()
    expect(cb.mock.calls).toMatchSnapshot()
  })

  test("subscribes to source even if n is 0", () => {
    const stream = jest.fn(() => noop)
    take(0, stream)(noop)
    expect(stream.mock.calls).toMatchSnapshot()
  })

  test("contains correct values at correct time", () => {
    const result = emulate(create => {
      return take(1, create(t(10), v(1), t(10), v(2)))
    })
    expect(result).toMatchSnapshot()
  })

  test("if n is 0 returns empty stream", () => {
    const result = emulate(create => {
      return take(0, create(t(10), v(1), t(10), v(2)))
    })
    expect(result).toMatchSnapshot()
  })
})

describe("takeWhile", () => {
  test("calls disposer of source stream when we dispose result stream erlier", () => {
    const disposer = jest.fn()
    takeWhile(always, () => disposer)(noop)()
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("doesn't call disposer twice", () => {
    const disposer = jest.fn()
    takeWhile(never, cb => {
      cb(1)
      return disposer
    })(noop)()
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("takes values that satisfy predicate until first value that don't then calls disposer (async)", () => {
    const cb = jest.fn()
    let inCb = null
    takeWhile(
      x => x < 3,
      _cb => {
        inCb = _cb
        return () => {
          inCb = null
        }
      },
    )(cb)
    inCb(1)
    inCb(2)
    expect(typeof inCb).toBe("function")
    inCb(3)
    expect(inCb).toBe(null)
    expect(cb.mock.calls).toMatchSnapshot()
  })

  test("takes values that satisfy predicate until first value that don't then calls disposer (sync)", () => {
    const disposer = jest.fn()
    const cb = jest.fn()
    takeWhile(
      x => x < 3,
      inCb => {
        inCb(1)
        inCb(2)
        inCb(3)
        inCb(4)
        return disposer
      },
    )(cb)
    expect(disposer.mock.calls).toMatchSnapshot()
    expect(cb.mock.calls).toMatchSnapshot()
  })

  test("return empty stream if predicate is () => false", () => {
    const result = emulate(create => {
      return takeWhile(never, create(t(10), v(1), t(10), v(2)))
    })
    expect(result).toMatchSnapshot()
  })

  test("contains correct values at correct time", () => {
    const result = emulate(create => {
      return takeWhile(
        x => x < 3,
        create(t(10), v(1), t(10), v(2), t(10), v(3), t(10), v(4)),
      )
    })
    expect(result).toMatchSnapshot()
  })
})

describe("takeUntil", () => {
  test("calls disposers when we dispose result stream erlier", () => {
    const disposer1 = jest.fn()
    const disposer2 = jest.fn()
    takeUntil(() => disposer1, () => disposer2)(noop)()
    expect(disposer1.mock.calls).toMatchSnapshot()
    expect(disposer2.mock.calls).toMatchSnapshot()
  })

  test("calls disposers after first value in controller", () => {
    const disposer1 = jest.fn()
    const disposer2 = jest.fn()
    takeUntil(cb => {
      cb(0)
      return disposer1
    }, () => disposer2)(noop)()
    expect(disposer1.mock.calls).toMatchSnapshot()
    expect(disposer2.mock.calls).toMatchSnapshot()
  })

  test("calls disposers properly (async value in controller)", () => {
    const disposer1 = jest.fn()
    const disposer2 = jest.fn()
    let cb = null
    const controller = _cb => {
      cb = _cb
      return disposer1
    }
    const disposer = takeUntil(controller, () => disposer2)(noop)
    cb && cb(0)
    disposer() // should't cause additional call of disposers
    expect(disposer1.mock.calls).toMatchSnapshot()
    expect(disposer2.mock.calls).toMatchSnapshot()
  })

  test("doesn't contain values after value from controller", () => {
    const result = emulate(create => {
      return takeUntil(
        create(t(25), v(1)),
        create(t(10), v(1), t(10), v(2), t(10), v(3)),
      )
    })
    expect(result).toMatchSnapshot()
  })

  test("doesn't contain values after sync value from controller", () => {
    const result = emulate(create => {
      return takeUntil(of(null), create(t(10), v(1), t(10), v(2), t(10), v(3)))
    })
    expect(result).toMatchSnapshot()
  })

  test("subscribes first to controller and then to source", () => {
    const cb = jest.fn()
    takeUntil(of(null), of(1))
    expect(cb.mock.calls).toMatchSnapshot()
  })
})

describe("skip", () => {
  test("preserves disposer", () => {
    const disposer = jest.fn()
    skip(0, cb => disposer)(noop)()
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("skips first N items", () => {
    const result = emulate(create => {
      return skip(2, create(t(10), v(1), t(10), v(2), t(10), v(3)))
    })
    expect(result).toMatchSnapshot()
  })

  test("returns equivalent stream if N is 0", () => {
    const result = emulate(create => {
      return skip(0, create(t(10), v(1), t(10), v(2), t(10), v(3)))
    })
    expect(result).toMatchSnapshot()
  })
})

describe("skipWhile", () => {
  test("preserves disposer", () => {
    const disposer = jest.fn()
    skipWhile(never, cb => disposer)(noop)()
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("skips first items that satisfy predicate", () => {
    const result = emulate(create => {
      return skipWhile(
        x => x < 3,
        create(t(10), v(1), t(10), v(2), t(10), v(3)),
      )
    })
    expect(result).toMatchSnapshot()
  })

  test("returns equivalent stream if predicate is () => false", () => {
    const result = emulate(create => {
      return skipWhile(never, create(t(10), v(1), t(10), v(2), t(10), v(3)))
    })
    expect(result).toMatchSnapshot()
  })

  test("returns empty stream if predicate is () => true", () => {
    const result = emulate(create => {
      return skipWhile(always, create(t(10), v(1), t(10), v(2), t(10), v(3)))
    })
    expect(result).toMatchSnapshot()
  })
})

describe("skipDuplicates", () => {
  function close(x: number, y: number): boolean {
    return Math.abs(x - y) < 1
  }

  test("preserves disposer", () => {
    const disposer = jest.fn()
    skipDuplicates(never, cb => disposer)(noop)()
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("doesn't apply comparator to the first element", () => {
    const comparator = jest.fn(close)
    skipDuplicates(comparator, of(1))(noop)
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
})

describe("startWith", () => {
  test("preserves disposer", () => {
    const disposer = jest.fn()
    startWith(0, cb => disposer)(noop)()
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("adds a value", () => {
    const result = emulate(create => {
      return startWith(0, create(t(10), v(1), t(10), v(2)))
    })
    expect(result).toMatchSnapshot()
  })
})

describe("multicast", () => {
  test("first subscribers gets sync events", () => {
    const cb = jest.fn()
    multicast(fromIterable([1, 2]))(cb)
    expect(cb.mock.calls).toMatchSnapshot()
  })

  test("second subscribers doesn't get sync events", () => {
    const cb = jest.fn()
    const stream = multicast(fromIterable([1, 2]))
    stream(noop)
    stream(cb)
    expect(cb.mock.calls).toMatchSnapshot()
  })

  test("first and second sunscribers get same async events", () => {
    const cb1 = jest.fn()
    const cb2 = jest.fn()
    let inCb = null
    const stream = multicast(_inCb => {
      inCb = _inCb
      return () => {
        inCb = null
      }
    })
    stream(cb1)
    stream(cb2)
    inCb(1)
    inCb(2)
    expect(cb1.mock.calls).toMatchSnapshot()
    expect(cb2.mock.calls).toMatchSnapshot()
  })

  test("subscriber doesn't get event after unsub() in response to that event", () => {
    const cb = jest.fn()
    let inCb = null
    let stream = multicast(_inCb => {
      inCb = _inCb
      return () => {
        inCb = null
      }
    })
    let unsub = null
    stream(x => {
      if (x === 2) {
        unsub && unsub()
      }
    })
    unsub = stream(cb)
    inCb(1)
    inCb(2)
    inCb(3)
    expect(cb.mock.calls).toMatchSnapshot()
  })

  test("preserves disposer (single subscriber)", () => {
    const disposer = jest.fn()
    multicast(cb => disposer)(noop)()
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("preserves disposer (two subscribers)", () => {
    const disposer = jest.fn()
    const stream = multicast(cb => disposer)
    const unsub1 = stream(noop)
    const unsub2 = stream(noop)
    unsub1()
    unsub2()
    expect(disposer.mock.calls).toMatchSnapshot()
  })

  test("unsub doesn't remove another version of same subscriber", () => {
    const subscriber = jest.fn()
    let inCb = null
    const stream = multicast(_inCb => {
      inCb = _inCb
      return () => {
        inCb = null
      }
    })
    const unsub = stream(subscriber)
    stream(subscriber)
    unsub()
    unsub() // should be noop
    inCb(1)
    expect(subscriber.mock.calls).toMatchSnapshot()
  })
})
