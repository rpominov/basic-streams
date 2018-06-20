import {Stream} from "@basic-streams/stream"

function noop() {}

export default function takeUntil<T>(
  controller: Stream<any>,
  stream: Stream<T>,
): Stream<T> {
  return cb => {
    let disposed = false
    let mainDisposer: (() => void) | null = null
    let ctrlDisposer: (() => void) | null = null
    const dispose = () => {
      if (disposed) {
        return
      }
      disposed = true
      if (mainDisposer !== null) {
        mainDisposer()
        mainDisposer = null
      }
      if (ctrlDisposer !== null) {
        ctrlDisposer()
        ctrlDisposer = null
      }
    }

    ctrlDisposer = controller(dispose)

    if (disposed && ctrlDisposer !== null) {
      ctrlDisposer()
    }

    if (disposed) {
      // subscribe anyway for consistency
      stream(noop)()
    } else {
      mainDisposer = stream(cb)
    }

    return dispose
  }
}
