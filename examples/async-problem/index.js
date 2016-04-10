const fs = require('fs')
const path = require('path')
const Validation = require('data.validation')
const Stream = require('../../lib').Stream
const SL = require('static-land')

// Convert FL Validation type to a SL type, also add two missing methods that we need
const SValidation = Object.assign({}, SL.fromFLType(Validation), SL.curryAll({
  chain(fn, validation) {
    return validation.map(fn).getOrElse(validation)
  },
  sequence(Inner, validation) {
    return validation.fold(
      error => Inner.of(Validation.Failure(error)),
      inner => Inner.map(Validation.Success, inner)
    )
  },
}))

// Combine two types
const StreamV = Stream.composeWithInnerType(SValidation)
StreamV.create = executor => {
  return Stream.fromLoose(sink => executor(
    successValue => sink(Validation.Success(successValue)),
    failureValue => sink(Validation.Failure([failureValue]))
  ))
}

// Another helper
function liftNodeFn(nodeFn) {
  return function() {
    const args = Array.prototype.slice.call(arguments)
    return StreamV.create((onSucc, onFail) => {
      const allArgs = args.concat([(error, result) => {
        if (error) {
          onFail(error)
        } else {
          onSucc(result)
        }
      }])
      nodeFn.apply(null, allArgs)
    })
  }
}


// Now goes the app logic...

const readFile = liftNodeFn(fs.readFile)

const main = dir => {
  const readFileFromDir = name => readFile(path.join(dir, name), {encoding: 'utf8'})

  const stream = SL.flow(
    readFileFromDir('index'),
    StreamV.map(index => index.match(/^.*(?=\n)/gm).map(readFileFromDir)),
    StreamV.chain(SL.SArray.sequence(StreamV)),
    StreamV.map(arr => arr.join(''))
  )

  stream(validation => validation.fold(
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
