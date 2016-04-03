import test from 'tape-catch'
import {pipe} from '../src/utils'

/* Wraps a group of tests
 */
const wrap = (prefix, cb) => {
  cb((text, opts, cb) => {
    test(`utils. ${prefix}. ${text}`, opts, cb)
  })
}


wrap('pipe', test => {

  test('works fine with no args', t => {
    t.equal(pipe(), undefined)
    t.end()
  })

  test('works fine with one arg', t => {
    t.equal(pipe(1), 1)
    t.end()
  })

  test('works fine with two args', t => {
    t.equal(pipe(1, x => x + 1), 2)
    t.end()
  })

  test('works fine with three args', t => {
    t.equal(pipe(1, x => x + 1, x => x / 10, x => x * 100), 20)
    t.end()
  })

})
