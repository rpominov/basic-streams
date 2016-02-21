import {readFile} from 'fs'
import {join} from 'path'
import {Success, Failure} from 'data.validation'
import {map, chain, just, combineArray} from 'basic-streams'
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


// Helpers we need to work with `Stream(Validation([e], a))` type
const mapV = fn => map(v => v.map(fn))
const chainV = fn => chain(v => v.fold(e => just(Failure(e)), x => map(Success)(fn(x))))


// This could be in data.validation
const vLift2 = fn => (vA, vB) => vA.map(a => b => fn(a, b)).ap(vB)
const vCombineArray = vArr => vArr.reduce(vLift2((arr, x) => arr.concat([x])), Success([]))
const vFlatten = vv => vv.getOrElse(vv)



// Done with helpers, the folowing is our app logic

const readFileLifted = liftNodeFn(readFile)

const main = dir => {
  const readFileFromDir = name => readFileLifted(join(dir, name), {encoding: 'utf8'})

  const stream = pipe(readFileFromDir('index'),                      // Stream(Val([e], string))
    mapV(index => index.match(/^.*(?=\n)/gm).map(readFileFromDir)),  // Stream(Val([e], [Stream(Val([e], string))]))
    chainV(combineArray),                                            // Stream(Val([e], [Val([e], string)]))
    mapV(vCombineArray),                                             // Stream(Val([e], Val([e], [string])))
    map(vFlatten),                                                   // Stream(Val([e], [string]))
    mapV(arr => arr.join(''))                                        // Stream(Val([e], string))
  )

  stream(v => v.fold(
    errors => {
      process.stderr.write(errors.map(e => e.message).join('\n'))
      process.exit(1)
    },
    result => {
      process.stdout.write(String(result))
      process.exit(0)
    }
  ))

}

main('files')
