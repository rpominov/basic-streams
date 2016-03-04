/* This is a wrapper that represents a Stream of another Fantasy Land type T.
 * Depending on which methods of wrapper you want to use the inner type
 * T must implement certain FL specs. For example, if you want to use map(),
 * T must also have map(), and if you want to use chain(), T must have map(),
 * sequence(), and chain().
 *
 * This is somewhat similar to monad transformers, but not quite.
 */

import {map, chain, sequence, of, ap} from 'fantasy-land'
import {Stream} from './fantasy'

export class StreamT {

  constructor(stream) {
    this._stream = stream
  }

  [map](fn) {
    return new StreamT(
      this._stream[map](t => t[map](fn))
    )
  }

  [chain](fn) {
    return new StreamT(
      this._stream[chain](t => {
        const tst = t[map](fn)
        const stt = tst[sequence](Stream.of)
        const st = stt[map](tt => tt[chain](t => t))
        return st
      })
    )
  }

  [ap](s_t_x) {
    const s_t_fnxy = this
    const s_fntxy = s_t_fnxy._stream.map(t_fnxy => t_x => t_fnxy[ap](t_x))
    const s_t_y = s_fntxy[ap](s_t_x)
    return s_t_y
  }


  // Custom methods

  fromBasic(bs) {
    return new StreamT(new Stream(bs))
  }

  observe(fn) {
    // fn will get values of type T
    return this._stream.observe(fn)
  }

}

StreamT.genOf = innerOf => x => Stream[of](innerOf(x))
