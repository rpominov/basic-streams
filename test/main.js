import test from 'tape-catch'
import transducers from 'transducers-js'
import Stream from '../src/main'

const {
  fromLoose,
  empty,
  of,
  map,
  filter,
  chain,
  chainLatest,
  ap,
  map2,
  map3,
  concat,
  scan,
  take,
  takeWhile,
  takeUntil,
  skip,
  skipWhile,
  skipDuplicates,
  multicast,
  startWith,
  combineArray,
  transduce,
} = Stream

const noop = () => {}

/* Creates a stream containing given values
 */
function fromArray(xs) {
  return sink => {
    xs.forEach(x => {
      sink(x)
    })
    return noop
  }
}

/* Creates a pool of named streams to which we can add streams, and then
 * imperatively push values to streams by name
 */
const pool = () => {
  const sinks = {}
  return {
    add(name) {
      return sink => {
        if (sinks[name]) {
          throw new Error('in pool you can\'t have more than one subscriber to a same stream at a same time')
        }
        sinks[name] = sink
        return () => {  sinks[name] = null  }
      }
    },
    pushTo(name, value) {
      if (sinks[name]) {
        sinks[name](value)
      }
    },
    isActive(name) {
      return !!sinks[name]
    },
  }
}

/* Wraps a group of tests
 */
const wrap = (prefix, cb) => {
  cb((text, cb) => {
    test(`${prefix}. ${text}`, t => {
      cb({
        ...t,
        calledWith(...xs) {
          return (x, ...rest) => {
            if (rest.length > 0) {
              t.fail('called with more than one arg')
            }
            t.deepEqual(x, xs.shift())
          }
        },
        calledOnce() {
          let haveBeenCalled = false
          return () => {
            t.ok(!haveBeenCalled, 'called more than once')
            haveBeenCalled = true
          }
        },
      })
      t.end() // we don't have any async tests...
    })
  })
}



wrap('fromLoose', test => {

  test('sink works', t => {
    t.plan(3)
    fromLoose(fromArray([1, 2, 3]))(t.calledWith(1, 2, 3))
  })

  test('disposer works', t => {
    t.plan(1)
    fromLoose(() => t.calledOnce())(noop)()
  })

  test('fixes stream #3: It must return unsubscribe function (aka `disposer`)', t => {
    t.plan(1)
    t.equal(typeof fromLoose(() => {})(noop), 'function')
  })

  test('fixes stream #4: `sink` must be called with one argument', t => {
    t.plan(1)
    fromLoose(sink => {sink(1, 2)})(t.calledWith(1))
  })

  test('fixes stream #5: `disposer` must always return `undefined`', t => {
    t.plan(1)
    t.equal(fromLoose(() => () => 1)(noop)(), undefined)
  })

  test('fixes stream #6: After `disposer` was called, `sink` must not be called', t => {
    let sink
    const unsub = fromLoose(_sink => {sink = _sink})(t.fail)
    unsub()
    sink && sink(1)
  })

  test('fixes usage #1: `stream` must be called with one argument, `sink`', t => {
    t.plan(1)
    fromLoose((sink, extra) => {
      t.equal(extra, undefined)
    })(noop, 1)
  })

  test('fixes usage #3: `sink` must always return `undefined`', t => {
    t.plan(1)
    const subscriber = () => 1
    fromLoose(sink => {
      t.equal(sink(), undefined)
    })(subscriber)
  })

  test('fixes usage #4: `disposer` must be called with no arguments', t => {
    t.plan(1)
    fromLoose(() => (...args) => t.equal(args.length, 0))(noop)(1, 2)
  })

  test('fixes usage #5: `disposer` must be called at most once', t => {
    t.plan(1)
    const disposer = fromLoose(() => t.calledOnce())(noop)
    disposer()
    disposer()
  })

})



wrap('empty', test => {

  test('works ...', t => {
    empty()(t.fail)()
  })

})



wrap('of', test => {

  test('calls callback with the value', t => {
    t.plan(1)
    of(1)(t.calledWith(1))
  })

})



wrap('map', test => {

  const lifted = s => map(x => x + 1, s)

  test('modifies values with provided fn', t => {
    t.plan(1)
    lifted(of(1))(t.calledWith(2))
  })

  test('preserves disposer', t => {
    t.plan(1)
    lifted(() => t.calledOnce())(noop)()
  })

})



wrap('filter', test => {

  const lifted = s => filter(x => x > 1, s)

  test('removes values', t => {
    t.plan(2)
    lifted(fromArray([1, 2, 3, 0]))(t.calledWith(2, 3))
  })

  test('preserves disposer', t => {
    t.plan(1)
    lifted(() => t.calledOnce())(noop)()
  })

})



wrap('chain', test => {

  const lifted = s => chain(x => fromArray([x, x]), s)

  test('result stream contains values from spawned', t => {
    t.plan(4)
    lifted(fromArray([1, 2]))(t.calledWith(1, 1, 2, 2))
  })

  test('preserves disposer of main sream', t => {
    t.plan(1)
    lifted(() => t.calledOnce())(noop)()
  })

  test('preserves disposer of spawned streams', t => {
    t.plan(2)
    chain(() => {
      return () => t.calledOnce()
    }, fromArray([1, 2]))(noop)()
  })

})



wrap('chainLatest', test => {

  const lifted = s => chainLatest(x => fromArray([x, x]), s)

  test('result stream contains values from spawned', t => {
    t.plan(4)
    lifted(fromArray([1, 2]))(t.calledWith(1, 1, 2, 2))
  })

  test('result stream contain only values that was emited before next spawned & disposers called correctly', t => {
    t.plan(6)
    const p = pool()
    const unsub = chainLatest(p.add, p.add('main'))(t.calledWith(1, 2, 3))
    p.pushTo('main', 'aaa')
    p.pushTo('aaa', 1)
    p.pushTo('aaa', 2)
    p.pushTo('main', 'bbb')
    t.equal(p.isActive('aaa'), false)
    p.pushTo('bbb', 3)
    unsub()
    t.equal(p.isActive('bbb'), false)
    t.equal(p.isActive('main'), false)
  })

})



wrap('ap', test => {

  test('updates result when inputs update', t => {
    t.plan(3)
    const p = pool()
    ap(p.add('ofF'), p.add('ofV'))(t.calledWith(3, 4, 6))
    p.pushTo('ofF', x => x + 1)
    p.pushTo('ofV', 2)
    p.pushTo('ofF', x => x * 2)
    p.pushTo('ofV', 3)
  })

  test('preserves disposers...', t => {
    t.plan(2)
    ap(() => t.calledOnce(), () => t.calledOnce())(noop)()
  })

})



wrap('map2', test => {

  test('works with of', t => {
    t.plan(1)
    map2((x, y) => [x, y], of(5), of(3))(t.calledWith([5, 3]))
  })

  test('disposers work', t => {
    t.plan(2)
    map2((x, y) => [x, y], () => t.calledOnce(), () => t.calledOnce())(noop)()
  })

})


wrap('map3', test => {

  test('works with of', t => {
    t.plan(1)
    map3((x, y, z) => [x, y, z], of(5), of(3), of(2))(t.calledWith([5, 3, 2]))
  })

  test('disposers work', t => {
    t.plan(3)
    const stream = map3((x, y, z) => [x, y, z], () => t.calledOnce(), () => t.calledOnce(), () => t.calledOnce())
    stream(noop)()
  })

})



wrap('concat', test => {

  test('result stream contains values from sources (using of)', t => {
    t.plan(2)
    concat([of(1), of(2)])(t.calledWith(1, 2))
  })

  test('result stream contains values from sources (using pool)', t => {
    t.plan(4)
    const p = pool()
    concat([p.add('a'), p.add('b')])(t.calledWith(1, 2, 3, 4))
    p.pushTo('a', 1)
    p.pushTo('b', 2)
    p.pushTo('a', 3)
    p.pushTo('b', 4)
  })

  test('disposers called properly', t => {
    t.plan(3)
    concat([() => t.calledOnce(), () => t.calledOnce(), () => t.calledOnce()])(noop)()
  })

})



wrap('scan', test => {

  const lifted = s => scan((r, x) => r.concat([x]), [], s)

  test('contains correct values', t => {
    t.plan(4)
    lifted(fromArray([1, 2, 3]))(t.calledWith([], [1], [1,2], [1,2,3]))
  })

  test('preserves disposer', t => {
    t.plan(1)
    lifted(() => t.calledOnce())(noop)()
  })

})



wrap('take', test => {

  const lifted = s => take(2, s)

  test('take(0) return empty stream', t => {
    take(0, of(1))(t.fail)
  })

  test('subscribes to source even if n=0', t => {
    t.plan(1)
    const stream = () => {
      t.calledOnce()()
      return noop
    }
    take(0, stream)(noop)

  })

  test('takes first n and then calls disposer of source stream (async)', t => {
    t.plan(4)
    let sink = null
    const stream = lifted(_sink => {
      sink = _sink
      return () => {sink = null}
    })
    stream(t.calledWith(1, 2))
    sink && sink(1)
    t.equal(typeof sink, 'function')
    sink && sink(2)
    t.equal(sink, null)
  })

  test('takes first n and then calls disposer of source stream (sync)', t => {
    t.plan(3)
    lifted(sink => {
      sink(1)
      sink(2)
      sink(3)
      return t.calledOnce()
    })(t.calledWith(1, 2))
  })

  test('calls disposer of source stream when we dispose result stream erlier', t => {
    t.plan(1)
    lifted(() => t.calledOnce())(noop)()
  })

})



wrap('takeWhile', test => {

  const lifted = s => takeWhile(x => x < 3, s)

  test('takeWhile(() => false) return empty stream', t => {
    takeWhile(() => false, of(1))(t.fail)
  })

  test('takes values that satisfy predicate until first value that don\'t then calls disposer (async)', t => {
    t.plan(4)
    let sink = null
    const stream = lifted(_sink => {
      sink = _sink
      return () => {sink = null}
    })
    stream(t.calledWith(1, 2))
    sink && sink(1)
    sink && sink(2)
    t.deepEqual(typeof sink, 'function')
    sink && sink(3)
    t.deepEqual(sink, null)
  })

  test('takes values that satisfy predicate until first value that don\'t then calls disposer (sync)', t => {
    t.plan(3)
    lifted(sink => {
      sink(1)
      sink(2)
      sink(3)
      return t.calledOnce()
    })(t.calledWith(1, 2))
  })

  test('calls disposer of source stream when we dispose result stream erlier', t => {
    t.plan(1)
    const stream = lifted(() => t.calledOnce())
    stream(noop)()
  })

})



wrap('takeUntil', test => {

  test('takes async values from source until async value from controller', t => {
    t.plan(2)
    const p = pool()
    takeUntil(p.add('controller'), p.add('source'))(t.calledWith(1, 2))
    p.pushTo('source', 1)
    p.pushTo('source', 2)
    p.pushTo('controller', 0)
    p.pushTo('source', 3)
  })

  test('controller has sync value: contains sync values from source', t => {
    t.plan(2)
    takeUntil(of(1), fromArray([1, 2]))(t.calledWith(1, 2))
  })

  test('controller has sync value: doesn\'t contain async values from source', t => {
    const p = pool()
    takeUntil(of(1), p.add('source'))(t.fail)
    p.pushTo('source', 1)
  })

  test('controller has sync value: calls disposers', t => {
    t.plan(2)
    const controller = sink => {
      sink(1)
      return t.calledOnce()
    }
    takeUntil(controller, () => t.calledOnce())(noop)
  })

  test('calls disposers properly (async value in controller)', t => {
    t.plan(2)
    let sink = null
    const controller = _sink => {
      sink = _sink
      return t.calledOnce()
    }
    const resultDis = takeUntil(controller, () => t.calledOnce())(noop)
    sink && sink(0)
    resultDis() // should't cause additional call of disposers
  })

  test('calls disposers when we dispose result stream erlier', t => {
    t.plan(2)
    takeUntil(() => t.calledOnce(), () => t.calledOnce())(noop)()
  })

})



wrap('skip', test => {

  const lifted = s => skip(2, s)

  test('skips first N items', t => {
    t.plan(2)
    lifted(fromArray([1, 2, 3, 4]))(t.calledWith(3, 4))
  })

  test('returns equivalent stream if N=0', t => {
    t.plan(2)
    skip(0, fromArray([1, 2]))(t.calledWith(1, 2))
  })

  test('preserves disposer', t => {
    t.plan(1)
    lifted(() => t.calledOnce())(noop)()
  })

})



wrap('skipWhile', test => {

  const lifted = s => skipWhile(x => x < 3, s)

  test('skips first items that satisfy predicate', t => {
    t.plan(2)
    lifted(fromArray([1, 2, 3, 4]))(t.calledWith(3, 4))
  })

  test('returns equivalent stream if predicate is () => false', t => {
    t.plan(2)
    skipWhile(() => false, fromArray([1, 2]))(t.calledWith(1, 2))
  })

  test('preserves disposer', t => {
    t.plan(1)
    lifted(() => t.calledOnce())(noop)()
  })

})



wrap('skipDuplicates', test => {

  const lifted = s => skipDuplicates((x, y) => Math.round(x) === Math.round(y), s)

  test('first element always comes through', t => {
    t.plan(1)
    lifted(of(1))(t.calledWith(1))
  })

  test('removes duplicates', t => {
    t.plan(3)
    lifted(fromArray([1, 1, 1, 2.1, 2, 3]))(t.calledWith(1, 2.1, 3))
  })

  test('preserves disposer', t => {
    t.plan(1)
    lifted(() => t.calledOnce())(noop)()
  })

})



wrap('multicast', test => {

  test('first subscribers gets sync events', t => {
    t.plan(2)
    multicast(fromArray([1, 2]))(t.calledWith(1, 2))
  })

  test('second subscribers doesn\'t get sync events (unfortunately)', t => {
    const stream = multicast(fromArray([1, 2]))
    stream(noop)
    stream(t.fail)
  })

  test('first and second sunscribers get same async events', t => {
    t.plan(4)
    const p = pool()
    let stream = multicast(p.add('source'))
    stream(t.calledWith(1, 2))
    stream(t.calledWith(1, 2))
    p.pushTo('source', 1)
    p.pushTo('source', 2)
  })

  test('subscriber doesn\'t get event after unsub() in response to that event', t => {
    t.plan(1)
    let sink = null
    let stream = multicast(_sink => {
      sink = _sink
      return () => {sink = null}
    })
    let unsub = null
    stream(x => {
      if (x === 2) {
        unsub && unsub()
      }
    })
    unsub = stream(t.calledWith(1))
    sink && sink(1)
    sink && sink(2)
    sink && sink(3)
  })

  test('preserves disposer (single subscriber)', t => {
    t.plan(1)
    multicast(() => t.calledOnce())(noop)()
  })

  test('preserves disposer (two subscribers)', t => {
    t.plan(1)
    const stream = multicast(() => t.calledOnce())
    const unsub1 = stream(noop)
    const unsub2 = stream(noop)
    unsub1()
    unsub2()
  })

  test('unsub doesn\'t remove another version of same subscriber', t => {
    t.plan(1)
    const p = pool()
    let stream = multicast(p.add('main'))
    const sub = t.calledWith(1)
    const unsub = stream(sub)
    stream(sub)
    unsub()
    unsub() // should be noop
    p.pushTo('main', 1)
  })

})



wrap('startWith', test => {
  const lifted = s => startWith(0, s)

  test('adds a value', t => {
    t.plan(2)
    lifted(of(1))(t.calledWith(0, 1))
  })

  test('preserves disposer', t => {
    t.plan(1)
    lifted(() => t.calledOnce())(noop)()
  })
})



// TODO: reimplement, we had it for free from static-land
wrap('combineArray', test => {

  test('works fine with of()', t => {
    t.plan(1)
    combineArray([
      of(1),
      of(2),
      of(3),
    ])(t.calledWith([1, 2, 3]))
  })

  test('works fine with regular (not of) streams', t => {
    t.plan(4)
    const p = pool()
    combineArray([
      p.add('a'),
      p.add('b'),
      p.add('c'),
    ])(t.calledWith(
      [1, 2, 3],
      [4, 2, 3],
      [4, 5, 3],
      [4, 5, 6]
    ))
    p.pushTo('a', 1)
    p.pushTo('b', 2)
    p.pushTo('c', 3)
    p.pushTo('a', 4)
    p.pushTo('b', 5)
    p.pushTo('c', 6)
  })

  test('disposers work', t => {
    t.plan(3)
    combineArray([
      () => t.calledOnce(),
      () => t.calledOnce(),
      () => t.calledOnce(),
    ])(noop)()
  })

})



wrap('transduce. map', test => {

  const lifted = s => transduce(transducers.map(x => x + 1), s)

  test('modifies values', t => {
    t.plan(1)
    const stream = of(1)
    const stream2 = lifted(stream)
    stream2(payload => {
      t.equal(payload, 2)
    })
  })

  test('preserves disposer', t => {
    t.plan(1)
    lifted(() => t.calledOnce())(noop)()
  })

})

wrap('transduce. take', test => {

  const lifted = s => transduce(transducers.take(2), s)

  test('takes first n and then calls disposer of source stream (async)', t => {
    t.plan(4)
    let sink
    const stream = lifted(_sink => {
      sink = _sink
      return () => {sink = null}
    })
    stream(t.calledWith(1, 2))
    sink && sink(1)
    sink && sink(2)
    t.equal(typeof sink, 'function')
    sink && sink(3)
    t.equal(sink, null)
  })

  test('takes first n and then calls disposer of source stream (sync)', t => {
    t.plan(3)
    lifted(sink => {
      sink(1)
      sink(2)
      sink(3)
      sink(4)
      return t.calledOnce()
    })(t.calledWith(1, 2))
  })

  test('calls disposer of source stream when we dispose result stream erlier', t => {
    t.plan(1)
    lifted(() => t.calledOnce())(noop)()
  })

})

wrap('transduce. cat+take', test => {

  const lifted = s => transduce(transducers.comp(transducers.cat, transducers.take(3)), s)

  test('works... (sync)', t => {
    t.plan(3)
    lifted(fromArray([ [1, 2], [3, 4] ]))(t.calledWith(1, 2, 3))
  })

})

wrap('transduce. cat', test => {

  const lifted = s => transduce(transducers.cat, s)

  test('works... (sync)', t => {
    t.plan(4)
    lifted(fromArray([ [1, 2], [3, 4] ]))(t.calledWith(1, 2, 3, 4))
  })

  test('does not call subscriber after unsub', t => {
    t.plan(3)
    const p = pool()
    const results = t.calledWith(1, 2, 3)
    const unsub = lifted(p.add('main'))(x => {
      results(x)
      if (x === 3) {
        unsub()
      }
    })
    p.pushTo('main', [1, 2])
    p.pushTo('main', [3, 4])
  })

})

wrap('transduce. take+partitionAll', test => {
  const lifted = s => transduce(transducers.comp(transducers.take(3), transducers.partitionAll(2)), s)
  test('works... (sync)', t => {
    t.plan(2)
    lifted(fromArray([1, 2, 3, 4, 5]))(t.calledWith([1, 2], [3]))
  })
})
