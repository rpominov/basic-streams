const Monad = require('burrido').default
const Stream = require('../../lib').Stream

const StreamMonad = Monad({
  pure: Stream.of,
  bind: (s, f) => Stream.chain(f, s),
})

/* Creates a Stream that produces given `values` with given `interval`
 */
const sequentially = (values, interval) =>
  sink => {
    const id = setInterval(() => {
      sink(values.shift())
      if (values.length === 0) {
        clearInterval(id)
      }
    }, interval)
    return () => {
      clearInterval(id)
    }
  }

const log = name => x => {
  console.log(name, x) // eslint-disable-line
}



const source = sequentially([1, 2, 3], 1000)

// with chain

// const result1 = Stream.chain(
//   x => sequentially([x + 10, x + 20, x + 30], 600),
//   source
// )
// result1(log('with chain:'))


// with do

const result2 = StreamMonad.Do(function*() {
  const x = yield source
  const y = yield sequentially([x + 10, x + 20, x + 30], 600)
  return y
})
result2(log('with do:'))
