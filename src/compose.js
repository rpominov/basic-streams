import S from './main'
import {fromIncomplete} from 'static-land'

export default function composeWithInnerType(I) {

  const sequenceIS = I.sequence(S)
  const joinI = I.chain(x => x)

  const Composed = fromIncomplete({

    of(x) {
      return S.of(I.of(x))
    },

    map(fn, composed) {
      return S.map(I.map(fn), composed)
    },

    ap(composedf, composedx) {
      return S.ap(S.map(I.ap, composedf), composedx)
    },

    chain(fn, composed) {
      return S.chain(inner => S.map(joinI, sequenceIS(I.map(fn, inner))), composed)
    },

  })

  return Composed

}


/*
// [composed]
chainLatest(fn) {
  // Copy-pasted from .chain, and replaced .chain -> .chainLatest
  // Not sure at all if this is correct or at least works...
  return this.withUncomposed(
    si => si.chainLatest(i => {
      const isi = i[map](x => fn(x).uncompose())
      const sii = isi[sequence](Stream.of)
      const si = sii[map](ii => ii[chain](i => i))
      return si
    })
  )
}

// [composed]
startWith(x) {
  return this.withUncomposed(stream => stream.startWith(Inner[of](x)))
}
*/
