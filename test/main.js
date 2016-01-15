/* @flow */

import test from 'tape-catch'
import {stub} from 'sinon'
import {
  empty,
  just,
  lift,
  filter,
  chain,
  chainLatest,
  ap,
  lift2,
  lift3,
  join,
  scan,
  take,
  skip,
  multicast,
} from '../src'
import type {Stream} from '../src'


/* Creates a stream containing given values
 */
const fromArray = arr =>
  sink => {
    arr.forEach(x => {
      sink(x)
    })
    return () => {}
  }

/* Takes all values pushed synchronously from a stream,
 * and returns them as an array
 */
const drainToArray = stream => {
  const result = []
  const dispose = stream(x => {result.push(x)})
  dispose()
  return result
}

/* Creates a pool of named streams to which we can add streams, and then
 * imperatively push values to streams by name
 */
const namedStreamsPool = () => {
  const sinks = {}
  return {
    add(name): Stream<any> {
      return sink => {
        if (sinks[name]) {
          throw new Error('in namedStreamsPool you can\'t have more than one subscriber to a same stream at a same time')
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
  cb((text, opts, cb) => {
    test(`${prefix}. ${text}`, opts, cb)
  })
}




wrap('empty', test => {

  test('works ...', t => {
    t.plan(1)
    const sink = stub()
    const dispose = empty(sink)
    dispose()
    t.deepEqual(sink.args, [])
  })

})


wrap('just', test => {

  test('calls callback with the value', t => {
    t.plan(1)
    just(1)(x => {
      t.equal(x, 1)
    })
  })

})



wrap('lift', test => {

  const lifted = lift(x => x + 1)

  test('modifies values with provided fn', t => {
    t.plan(1)
    const stream = just(1)
    const stream2 = lifted(stream)
    stream2(payload => {
      t.equal(payload, 2)
    })
  })

  test('preserves disposer', t => {
    t.plan(1)
    const disposer = stub()
    const stream = () => disposer
    const stream2 = lifted(stream)
    stream2(() => {})() // subscribe & immediately unsubscribe
    t.deepEqual(disposer.args, [[]])
  })

})



wrap('filter', test => {

  const lifted = filter(x => x > 1)

  test('removes values', t => {
    t.plan(1)
    const stream = fromArray([1, 2, 3, 0])
    const result = drainToArray(lifted(stream))
    t.deepEqual(result, [2, 3])
  })

  test('preserves disposer', t => {
    t.plan(1)
    const disposer = stub()
    const stream = () => disposer
    const stream2 = lifted(stream)
    stream2(() => {})() // subscribe & immediately unsubscribe
    t.deepEqual(disposer.args, [[]])
  })

})



wrap('chain', test => {

  const lifted = chain(x => fromArray([x, x]))

  test('result stream contains values from spawned', t => {
    t.plan(1)
    const stream = fromArray([1, 2])
    const result = drainToArray(lifted(stream))
    t.deepEqual(result, [1, 1, 2, 2])
  })

  test('preserves disposer of main sream', t => {
    t.plan(1)
    const disposer = stub()
    const stream = () => disposer
    const stream2 = lifted(stream)
    stream2(() => {})() // subscribe & immediately unsubscribe
    t.deepEqual(disposer.args, [[]])
  })

  test('preserves disposer of spawned streams', t => {
    t.plan(2)
    const disposers = []
    const lifted = chain(() => {
      const disposer = stub()
      disposers.push(disposer)
      return () => disposer
    })
    const stream = fromArray([1, 2])
    const stream2 = lifted(stream)
    stream2(() => {})() // subscribe & immediately unsubscribe
    disposers.forEach(disposer => {
      t.deepEqual(disposer.args, [[]])
    })
  })

})



wrap('chainLatest', test => {

  const lifted = chainLatest(x => fromArray([x, x]))

  test('result stream contains values from spawned', t => {
    t.plan(1)
    const stream = fromArray([1, 2])
    const result = drainToArray(lifted(stream))
    t.deepEqual(result, [1, 1, 2, 2])
  })

  test('result stream contain only values that was emited before next spawned & disposers called correctly', t => {
    t.plan(4)
    const pool = namedStreamsPool()
    const lifted = chainLatest(pool.add)
    const main = pool.add('main')
    const stream2 = lifted(main)
    const listener = stub()
    const unsub = stream2(listener)
    pool.pushTo('main', 'aaa')
    pool.pushTo('aaa', 1)
    pool.pushTo('aaa', 2)
    pool.pushTo('main', 'bbb')
    t.equal(pool.isActive('aaa'), false)
    pool.pushTo('bbb', 3)
    unsub()
    t.equal(pool.isActive('bbb'), false)
    t.equal(pool.isActive('main'), false)
    t.deepEqual(listener.args, [[1], [2], [3]])
  })

})




wrap('ap', test => {

  test('updates result when inputs update', t => {
    t.plan(1)
    const pool = namedStreamsPool()
    const ofF = pool.add('ofF')
    const ofV = pool.add('ofV')
    const result = ap(ofF)(ofV)
    const listener = stub()
    result(listener)
    pool.pushTo('ofF', x => x + 1)
    pool.pushTo('ofV', 2)
    pool.pushTo('ofF', x => x * 2)
    pool.pushTo('ofV', 3)
    t.deepEqual(listener.args, [[3], [4], [6]])
  })

  test('preserves disposers...', t => {
    t.plan(2)
    const disposer1 = stub()
    const disposer2 = stub()
    const stream = ap(() => disposer1)(() => disposer2)
    stream(() => {})()
    t.deepEqual(disposer1.args, [[]])
    t.deepEqual(disposer2.args, [[]])
  })

})



wrap('lift2', test => {

  test('works with just', t => {
    t.plan(1)
    const stream = lift2((x, y) => [x, y])(just(5), just(3))
    stream(z => {
      t.deepEqual(z, [5, 3])
    })
  })

  test('disposers work', t => {
    t.plan(2)
    const disposer1 = stub()
    const disposer2 = stub()
    const stream = lift2((x, y) => [x, y])(() => disposer1, () => disposer2)
    stream(() => {})()
    t.deepEqual(disposer1.args, [[]])
    t.deepEqual(disposer2.args, [[]])
  })

})



wrap('lift3', test => {

  test('works with just', t => {
    t.plan(1)
    const stream = lift3((x, y, z) => [x, y, z])(just(5), just(3), just(2))
    stream(a => {
      t.deepEqual(a, [5, 3, 2])
    })
  })

  test('disposers work', t => {
    t.plan(3)
    const disposer1 = stub()
    const disposer2 = stub()
    const disposer3 = stub()
    const stream = lift3((x, y, z) => [x, y, z])(() => disposer1, () => disposer2, () => disposer3)
    stream(() => {})()
    t.deepEqual(disposer1.args, [[]])
    t.deepEqual(disposer2.args, [[]])
    t.deepEqual(disposer3.args, [[]])
  })

})



wrap('join', test => {

  test('result stream contains values from sources (using just)', t => {
    t.plan(1)
    const result = drainToArray(join([just(1), just(2)]))
    t.deepEqual(result, [1, 2])
  })

  test('result stream contains values from sources (using namedStreamsPool)', t => {
    t.plan(1)
    const pool = namedStreamsPool()
    const a = pool.add('a')
    const b = pool.add('b')
    const joined = join([a, b])
    const sink = stub()
    joined(sink)
    pool.pushTo('a', 1)
    pool.pushTo('b', 2)
    pool.pushTo('a', 3)
    pool.pushTo('b', 4)
    t.deepEqual(sink.args, [[1], [2], [3], [4]])
  })

  test('disposers called properly', t => {
    t.plan(3)
    const disposer1 = stub()
    const disposer2 = stub()
    const disposer3 = stub()
    const stream = join([() => disposer1, () => disposer2, () => disposer3])
    stream(() => {})()
    t.deepEqual(disposer1.args, [[]])
    t.deepEqual(disposer2.args, [[]])
    t.deepEqual(disposer3.args, [[]])
  })

})



wrap('scan', test => {

  const lifted = scan((r, x) => r.concat([x]), [])

  test('contains correct values', t => {
    t.plan(1)
    const stream = fromArray([1, 2, 3])
    const result = drainToArray(lifted(stream))
    t.deepEqual(result, [[], [1], [1,2], [1,2,3]])
  })

  test('preserves disposer', t => {
    t.plan(1)
    const disposer = stub()
    const stream = () => disposer
    const stream2 = lifted(stream)
    stream2(() => {})() // subscribe & immediately unsubscribe
    t.deepEqual(disposer.args, [[]])
  })

})



wrap('take', test => {

  const lifted = take(2)

  test('take(0) return empty stream', t => {
    t.plan(1)
    const stream = take(0)(just(1))
    const sink = stub()
    const dispose = stream(sink)
    dispose()
    t.deepEqual(sink.args, [])
  })

  test('takes first n and then calls disposer of source stream (async)', t => {
    t.plan(3)
    const disposer = stub()
    const subscriber = stub()
    let sink
    const stream = lifted(_sink => {
      sink = _sink
      return disposer
    })
    stream(subscriber)
    sink && sink(1)
    t.deepEqual(disposer.args, [])
    sink && sink(2)
    t.deepEqual(disposer.args, [[]])
    // since disposer is called at this point, we're not alowed to do `sink(3)` here
    t.deepEqual(subscriber.args, [[1], [2]])
  })

  test('takes first n and then calls disposer of source stream (sync)', t => {
    t.plan(2)
    const disposer = stub()
    const stream = lifted(sink => {
      sink(1)
      sink(2)
      sink(3)
      return disposer
    })
    const result = drainToArray(stream)
    t.deepEqual(result, [1, 2])
    t.deepEqual(disposer.args, [[]])
  })

  test('calls disposer of source stream when we sispose result stream erlier', t => {
    t.plan(1)
    const disposer = stub()
    const stream = () => disposer
    const stream2 = lifted(stream)
    stream2(() => {})() // subscribe & immediately unsubscribe
    t.deepEqual(disposer.args, [[]])
  })

})



wrap('skip', test => {

  const lifted = skip(2)

  test('skips first N items', t => {
    t.plan(1)
    const stream = fromArray([1, 2, 3, 4])
    const result = drainToArray(lifted(stream))
    t.deepEqual(result, [3, 4])
  })

  test('returns equivalent stream if N=0', t => {
    t.plan(1)
    const stream = fromArray([1, 2, 3, 4])
    const result = drainToArray(skip(0)(stream))
    t.deepEqual(result, [1, 2, 3, 4])
  })

  test('preserves disposer', t => {
    t.plan(1)
    const disposer = stub()
    const stream = () => disposer
    const stream2 = lifted(stream)
    stream2(() => {})() // subscribe & immediately unsubscribe
    t.deepEqual(disposer.args, [[]])
  })

})



wrap('multicast', test => {

  test('first subscribers gets sync events', t => {
    t.plan(1)
    const stream = fromArray([1, 2])
    const result = drainToArray(multicast(stream))
    t.deepEqual(result, [1, 2])
  })

  test('second subscribers doesn\'t get sync events (unfortunately)', t => {
    t.plan(1)
    const stream = fromArray([1, 2])
    const stream2 = multicast(stream)
    stream2(() => {})
    const result = drainToArray(stream2)
    t.deepEqual(result, [])
  })

  test('first and second sunscribers get same async events', t => {
    t.plan(2)
    let sink = null
    let stream = multicast(_sink => {
      sink = _sink
      return () => {sink = null}
    })
    const sub1 = stub()
    const sub2 = stub()
    stream(sub1)
    stream(sub2)
    sink && sink(1)
    sink && sink(2)
    t.deepEqual(sub1.args, [[1], [2]])
    t.deepEqual(sub2.args, [[1], [2]])
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
    const sub = stub()
    unsub = stream(sub)
    sink && sink(1)
    sink && sink(2)
    sink && sink(3)
    t.deepEqual(sub.args, [[1]])
  })

  test('preserves disposer (single subscriber)', t => {
    t.plan(1)
    const disposer = stub()
    const stream = () => disposer
    const stream2 = multicast(stream)
    stream2(() => {})() // subscribe & immediately unsubscribe
    t.deepEqual(disposer.args, [[]])
  })

  test('preserves disposer (two subscribers)', t => {
    t.plan(1)
    const disposer = stub()
    const stream = () => disposer
    const stream2 = multicast(stream)
    const unsub1 = stream2(() => {})
    const unsub2 = stream2(() => {})
    unsub1()
    unsub2()
    t.deepEqual(disposer.args, [[]])
  })

  test('unsub doesn\'t remove another version of same subscriber', t => {
    t.plan(1)
    let sink = null
    let stream = multicast(_sink => {
      sink = _sink
      return () => {sink = null}
    })
    const sub = stub()
    const unsub = stream(sub)
    stream(sub)
    unsub()
    unsub() // should be noop
    sink && sink(1)
    t.deepEqual(sub.args, [[1]])
  })

})
