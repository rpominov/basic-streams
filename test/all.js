/* @flow */

import test from 'tape-catch'
import {stub} from 'sinon'
import {
  just,
  lift,
  filter,
  chain,
  chainLatest,
  ap,
  lift2,
  lift3,
} from '../src'


/* Creates a stream containing given values
 */
const fromArray = arr =>
  sink => {
    let disposed = false
    arr.forEach(x => {
      if (!disposed) {
        sink(x)
      }
    })
    return () => {
      disposed = true
    }
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
    add(name) {
      return sink => {
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
// What if some stream activated twice?!

/* Wraps a group of tests
 */
const wrap = (prefix, cb) => {
  cb((text, opts, cb) => {
    if (typeof text === 'string') {
      test(`${prefix}. ${text}`, opts, cb)
    } else {
      test(prefix, text, opts)
    }
  })
}

/* Applies given function to give value
 */
const pipe = (x, ...fs:Array<(x:any) => any>) => {
  return fs.reduce((r, f) => f(r), x)
}

/* Usable in pipe...
 */
const thrush = x => f => f(x)



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

  // 1. a.map(f => g => x => f(g(x))).ap(u).ap(v) is equivalent to a.ap(u.ap(v)) (composition)
  test('1st law of FL\'s Apply', t => {
    t.plan(2)
    const a = just(x => x + 1)
    const u = just(x => x * 2)
    const v = just(3)
    const stream1 = pipe(a, lift(f => g => x => f(g(x))), ap, thrush(u), ap, thrush(v))
    const stream2 = ap(a)(ap(u)(v))
    stream1(x => {
      t.equal(x, 7)
    })
    stream2(x => {
      t.equal(x, 7)
    })
  })

  // 1. a.of(x => x).ap(v) is equivalent to v (identity)
  test('1st law of FL\'s Applicative', t => {
    t.plan(2)
    const a = just(x => x)
    const v = just(3)
    ap(a)(v)(x => {
      t.equal(x, 3)
    })
    v(x => {
      t.equal(x, 3)
    })
  })

  // 2. a.of(f).ap(a.of(x)) is equivalent to a.of(f(x)) (homomorphism)
  test('2nd law of FL\'s Applicative', t => {
    t.plan(2)
    const f = y => y + 1
    const x = 3
    const stream1 = ap(just(f))(just(x))
    const stream2 = just(f(x))
    stream1(x => {
      t.equal(x, 4)
    })
    stream2(x => {
      t.equal(x, 4)
    })
  })

  // 3. u.ap(a.of(y)) is equivalent to a.of(f => f(y)).ap(u) (interchange)
  test('3rd law of FL\'s Applicative', t => {
    t.plan(2)
    const u = just(x => x + 1)
    const y = 3
    const stream1 = ap(u)(just(y))
    const stream2 = ap(just(f => f(y)))(u)
    stream1(x => {
      t.equal(x, 4)
    })
    stream2(x => {
      t.equal(x, 4)
    })
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
    const stream = lift2(x => y => [x, y])(just(5))(just(3))
    stream(z => {
      t.deepEqual(z, [5, 3])
    })
  })

  test('disposers work', t => {
    t.plan(2)
    const disposer1 = stub()
    const disposer2 = stub()
    const stream = lift2(x => y => [x, y])(() => disposer1)(() => disposer2)
    stream(() => {})()
    t.deepEqual(disposer1.args, [[]])
    t.deepEqual(disposer2.args, [[]])
  })

})



wrap('lift3', test => {

  test('works with just', t => {
    t.plan(1)
    const stream = lift3(x => y => z => [x, y, z])(just(5))(just(3))(just(2))
    stream(a => {
      t.deepEqual(a, [5, 3, 2])
    })
  })

  test('disposers work', t => {
    t.plan(3)
    const disposer1 = stub()
    const disposer2 = stub()
    const disposer3 = stub()
    const stream = lift3(x => y => z => [x, y, z])(() => disposer1)(() => disposer2)(() => disposer3)
    stream(() => {})()
    t.deepEqual(disposer1.args, [[]])
    t.deepEqual(disposer2.args, [[]])
    t.deepEqual(disposer3.args, [[]])
  })

})
