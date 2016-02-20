import {readFile} from 'fs'
import {join} from 'path'
import {Success, Failure} from 'data.validation'
import {map, chain, just, combineArray} from 'basic-streams'
import {pipe} from 'basic-streams/lib/utils'


// Turns a NodeJS style function, to a function that returns `Stream(Validation(a))`
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


// Helpers we need to work with `Stream(Validation(a))` type
const vSubscribe = ({value, error}) => v => { v.fold(error, value) }
const vChain = fn => v => v.fold(
                              e => just(Failure(e)) ,
                              x => map(Success)(fn(x)) )
const vMap = fn => v => v.map(fn)


// This could be in data.validation
const vAppend = (vArr, vX) => vArr.map(arr => x => arr.concat([x])).ap(vX)
const vCombineArray = vArr => vArr.reduce(vAppend, Success([]))



// Done with helpers, the folowing is our app logic

const readFileLifted = liftNodeFn(readFile)

const main = dir => {
  const readFileFromDir = name => readFileLifted(join(dir, name), {encoding: 'utf8'})

  const stream = pipe(readFileFromDir('index'),
    chain(vChain(index =>
      combineArray(index.match(/^.*(?=\n)/gm).map(readFileFromDir)))),
    map(vMap(vCombineArray)),
    map(vv => vv.getOrElse(vv)),
    map(vMap(arr => arr.join('')))
  )

  stream(vSubscribe({
    value(result) {
      process.stdout.write(String(result))
      process.exit(0)
    },
    error(errors) {
      // console.log(errors.map(e => e.message))
      process.stderr.write(errors.map(e => e.message).join('\n') + '\n')
      process.exit(1)
    },
  }))

}

main('files')
