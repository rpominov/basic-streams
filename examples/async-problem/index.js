import {readFile} from 'fs'
import {join} from 'path'
import Validation, {Success, Failure} from 'data.validation'
import R from 'ramda'
import * as BS from 'basic-streams'
import {pipe} from 'basic-streams/lib/utils'


// Turns a NodeJS style function, to a function that returns `Stream(Validation([e], a))`
const liftNodeFn = nodeFn => (...args) =>
  sink => {
    let disposed = false
    nodeFn(...args, (error, result) => {
      if (!disposed) {
        sink(error ? Failure([error]) : Success(result))
      }
    })
    return () => {disposed = true}
  }


// This could be in data.validation
Validation.prototype.sequence = function(of) {
  return this.fold(
    e => of(Failure(e)),
    x => BS.map(Success)(x)  // nevermind specialisation for BS here, we will use FL wrapper for BS
  )
}
Validation.prototype.chain = function(fn) {
  return this.map(fn).getOrElse(this)
}


// Helpers we need to work with `Stream(Validation([e], a))` type
const mapInner = fn => BS.map(R.map(fn))
const combineArrayInner = of => arr => BS.map(R.sequence(of))(BS.combineArray(arr))
const chainInner = fn => s =>
                            BS.chain(v => {
                              const vsv = v.map(fn)
                              const svv = vsv.sequence(BS.just)
                              const sv = BS.map(vv => vv.chain(x => x))(svv)
                              return sv
                            })(s)


// Done with helpers, the folowing is our app logic

const readFileLifted = liftNodeFn(readFile)

const main = dir => {
  const readFileFromDir = name => readFileLifted(join(dir, name), {encoding: 'utf8'})

  const stream = pipe(readFileFromDir('index'),                          // Stream(Val([e], string))
    mapInner(index => index.match(/^.*(?=\n)/gm).map(readFileFromDir)),  // Stream(Val([e], [Stream(Val([e], string))]))
    chainInner(combineArrayInner(Success)),                              // Stream(Val([e], [string]))
    mapInner(arr => arr.join(''))                                        // Stream(Val([e], string))
  )

  stream(v => v.fold(
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
