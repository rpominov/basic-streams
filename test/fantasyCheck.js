/* @flow */

import mochaAdapter from 'fantasy-check/src/adapters/mocha'
import applicative from 'fantasy-check/src/laws/applicative'
import functor from 'fantasy-check/src/laws/functor'
import monad from 'fantasy-check/src/laws/monad'
import test from 'tape-catch'
import {Stream} from '../src/fantasy'

/* Takes all values pushed synchronously from a stream,
 * and returns them as an array
 */
const drainToArray = stream => {
  const result = []
  const dispose = stream.observe(x => {result.push(x)})
  dispose()
  return result
}

const describe = (title, testFactory, factoryArgs) => {
  test(`fantasy-check. ${title}`, t => {
    // mochaAdapter just throws, and we can work with that
    try {
      testFactory(mochaAdapter).apply(null, factoryArgs)()
    } catch (e) {
      t.fail(e.message)
    }
    t.end()
  })
}

// Applicative Functor tests
describe('All (Applicative)', applicative.laws, [Stream, drainToArray])
describe('Identity (Applicative)', applicative.identity, [Stream, drainToArray])
describe('Composition (Applicative)', applicative.composition, [Stream, drainToArray])
describe('Homomorphism (Applicative)', applicative.homomorphism, [Stream, drainToArray])
describe('Interchange (Applicative)', applicative.interchange, [Stream, drainToArray])

// Functor tests
describe('All (Functor)', functor.laws, [Stream.of, drainToArray])
describe('Identity (Functor)', functor.identity, [Stream.of, drainToArray])
describe('Composition (Functor)', functor.composition, [Stream.of, drainToArray])

// Monad tests
describe('All (Monad)', monad.laws, [Stream, drainToArray])
describe('Left Identity (Monad)', monad.leftIdentity, [Stream, drainToArray])
describe('Right Identity (Monad)', monad.rightIdentity, [Stream, drainToArray])
describe('Associativity (Monad)', monad.associativity, [Stream, drainToArray])
