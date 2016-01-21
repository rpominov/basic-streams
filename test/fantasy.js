import test from 'tape-catch'
import {stub} from 'sinon'
import transducers from 'transducers-js'
import {Stream} from '../src/fantasy'

/* Wraps a group of tests
 */
const wrap = (prefix, cb) => {
  cb((text, opts, cb) => {
    test(`FL wrapper. ${prefix}. ${text}`, opts, cb)
  })
}


wrap('constructor', test => {
  test('puts basic stream to .observe', t => {
    t.plan(1)
    const stream = new Stream(sink => {
      sink(1)
      return () => {}
    })
    stream.observe(x => {
      t.equal(x, 1)
    })
  })
})


wrap('of', test => {
  test('creates stream of value (static method)', t => {
    t.plan(1)
    Stream.of(1).observe(x => {
      t.equal(x, 1)
    })
  })
  test('creates stream of value (instance method)', t => {
    t.plan(1)
    Stream.of(0).of(1).observe(x => {
      t.equal(x, 1)
    })
  })
})


wrap('concat', test => {
  test('works with of + empty', t => {
    t.plan(1)
    Stream.of(1).concat(Stream.empty()).observe(x => {
      t.equal(x, 1)
    })
  })
  test('works with empty + of', t => {
    t.plan(1)
    Stream.empty().concat(Stream.of(1)).observe(x => {
      t.equal(x, 1)
    })
  })
  test('works with of + of', t => {
    t.plan(1)
    const results = []
    Stream.of(1).concat(Stream.of(2)).observe(x => {
      results.push(x)
    })
    t.deepEqual(results, [1, 2])
  })
})


wrap('empty', test => {
  test('returns empty stream (static method)', t => {
    Stream.empty().observe(() => {
      t.fail()
    })
    t.end()
  })
  test('returns empty stream (instance method)', t => {
    Stream.of(1).empty().observe(() => {
      t.fail()
    })
    t.end()
  })
})


wrap('map', test => {
  test('works fine with of', t => {
    t.plan(1)
    Stream.of(1).map(x => x + 1).observe(x => {
      t.equal(x, 2)
    })
  })
})


wrap('ap', test => {
  test('works fine with of', t => {
    t.plan(1)
    Stream.of(x => x + 1).ap(Stream.of(2)).observe(x => {
      t.equal(x, 3)
    })
  })
})


wrap('chain', test => {
  test('works fine with of', t => {
    t.plan(1)
    Stream.of(1).chain(x => Stream.of(x + 2)).observe(x => {
      t.equal(x, 3)
    })
  })
})


wrap('filter', test => {
  test('works fine with of', t => {
    t.plan(1)
    Stream.of(1).filter(x => x !== 1).observe(() => {
      t.fail()
    })
    Stream.of(1).filter(x => x === 1).observe(x => {
      t.equal(x, 1)
    })
  })
})


wrap('scan', test => {
  test('works fine with of', t => {
    t.plan(1)
    const listener = stub()
    Stream.of(1).scan((r, x) => r.concat([x]), []).observe(listener)
    t.deepEqual(listener.args, [ [ [] ], [ [1] ] ])
  })
})


wrap('chainLatest', test => {
  test('works fine with of', t => {
    t.plan(1)
    Stream.of(1).chainLatest(x => Stream.of(x + 2)).observe(x => {
      t.equal(x, 3)
    })
  })
})


wrap('take', test => {
  test('works fine with of', t => {
    t.plan(1)
    Stream.of(1).take(0).observe(() => {
      t.fail()
    })
    Stream.of(1).take(1).observe(x => {
      t.equal(x, 1)
    })
  })
})


wrap('takeWhile', test => {
  test('works fine with of', t => {
    t.plan(1)
    Stream.of(1).takeWhile(() => false).observe(() => {
      t.fail()
    })
    Stream.of(1).takeWhile(() => true).observe(x => {
      t.equal(x, 1)
    })
  })
})


wrap('skip', test => {
  test('works fine with of', t => {
    t.plan(1)
    Stream.of(1).skip(1).observe(() => {
      t.fail()
    })
    Stream.of(1).skip(0).observe(x => {
      t.equal(x, 1)
    })
  })
})


wrap('skipWhile', test => {
  test('works fine with of', t => {
    t.plan(1)
    Stream.of(1).skipWhile(() => true).observe(() => {
      t.fail()
    })
    Stream.of(1).skipWhile(() => false).observe(x => {
      t.equal(x, 1)
    })
  })
})


wrap('join', test => {
  test('works fine with of', t => {
    t.plan(1)
    const listener = stub()
    Stream.join([Stream.of(1), Stream.of(2)]).observe(listener)
    t.deepEqual(listener.args, [ [ 1 ], [ 2 ] ])
  })
})


wrap('lift2', test => {
  test('works fine with of', t => {
    t.plan(1)
    Stream.lift2((x, y) => x + y)(Stream.of(1), Stream.of(2)).observe(x => {
      t.equal(x, 3)
    })
  })
})


wrap('lift3', test => {
  test('works fine with of', t => {
    t.plan(1)
    Stream.lift3((x, y, z) => x + y + z)(Stream.of(1), Stream.of(2), Stream.of(3)).observe(x => {
      t.equal(x, 6)
    })
  })
})


wrap('multicast', test => {
  test('works fine with of', t => {
    t.plan(1)
    Stream.of(1).multicast().observe(x => {
      t.equal(x, 1)
    })
  })
})


wrap('transduce', test => {
  test('works fine with of', t => {
    t.plan(1)
    Stream.of(1).transduce(transducers.map(x => x + 1)).observe(x => {
      t.equal(x, 2)
    })
  })
})

