/* eslint-disable no-unexpected-multiline */

import {readFile} from 'fs'
import {join} from 'path'
import Validation, {Success, Failure} from 'data.validation'
import R from 'ramda'
import {map, chain, sequence, of} from 'fantasy-land'
import {Stream} from '../../src/fantasy'

// This could be in data.validation
Validation.prototype[sequence] = function(of) {
  return this.fold(
    e => of(Failure(e)),
    x => x[map](Success)
  )
}
Validation.prototype[chain] = function(fn) {
  return this[map](fn).getOrElse(this)
}

const StreamV = Stream.Compose(Validation)

// Turns a NodeJS style function, to a function that returns `StreamV<[e], a>`
const liftNodeFn = nodeFn => (...args) =>
  StreamV.fromBasic(sink => {
    nodeFn(...args, (error, result) => {
      sink(error ? Failure([error]) : Success(result))
    })
  })





const readFileLifted = liftNodeFn(readFile)

const main = dir => {
  const readFileFromDir = name => readFileLifted(join(dir, name), {encoding: 'utf8'})

  const stream = readFileFromDir('index')
    [map](index => index.match(/^.*(?=\n)/gm))
    [chain](filenames => R.sequence(StreamV[of], filenames.map(readFileFromDir)))
    [map](arr => arr.join(''))

  stream.observe(v => v.fold(
    errors => {
      process.stderr.write(errors.map(e => e.message).join('\n') + '\n')
      process.exit(1)
    },
    result => {
      process.stdout.write(String(result) + '\n')
      process.exit(0)
    }
  ))

}

main('files')
