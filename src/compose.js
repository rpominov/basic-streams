// import {map, chain, sequence, of, ap} from 'fantasy-land'
// import {Stream} from './fantasy'

// export default function Compose(Inner) {

//   return class Composed {


//     // We accept Stream<Inner> in constructor ...
//     constructor(stream) {
//       this._stream = stream
//     }

//     // ... but you can use fromBasic to reduce boilerplate, it takes BasicStream<Inner>
//     static fromBasic(basicStream) {
//       return new Composed(new Stream(basicStream))
//     }

//     withStream(fn) {
//       return new Composed(fn(this._stream))
//     }



//     // FL methods

//     static [of](x) {
//       return new Composed(Stream[of](Inner[of](x)))
//     }

//     [map](fn) {
//       return this.withStream(
//         stream => stream[map](inn => inn[map](fn))
//       )
//     }

//     // fn :: X => Composed<Y>
//     [chain](fn) {
//       const result = this.withStream(
//         si => si[chain](i => {
//           const isi = i[map](x => fn(x)._stream)
//           const sii = isi[sequence](Stream.of)
//           const si = sii[map](ii => ii[chain](i => i))
//           return si
//         })
//       )
//       return result
//     }

//     // composedX :: Composed<X>
//     [ap](composedX) {
//       // this :: Composed<X => Y>
//       const result = this.withStream(
//         s_i_fxy => {
//           const s_fixy = s_i_fxy[map](i_fxy => ix => i_fxy[ap](ix))
//           const siy = s_fixy[ap](composedX._stream)
//           return siy
//         }
//       )
//       return result
//     }



//     // Custom methods

//     // [not composed] fn gets Inner
//     observe(fn) {
//       return this._stream.observe(fn)
//     }

//   }

// }
