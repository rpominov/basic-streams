// import test from 'lobot/test'
// import {fromString as _, exec as _exec/*, toString*/} from '../src/marbles'
// import S from '../src/main'
//
// const prep = sourcesSpec => transformer => _exec(sourcesSpec, transformer)
// const testl = test.wrap('laws')
//
// /* TODO: Ideally we want to QuickCheck this stuff
//  */
//
// testl('Chain. Associativity.', 1, t => {
//   const exec = prep({
//     a: _('___.___.___.'),
//     b: _('_.____.'),
//     c: _('_1__2'),
//   })
//
//   // M.chain(g, M.chain(f, u)) ≡ M.chain(x => M.chain(g, f(x)), u)
//   t.deepEqual(
//     exec(({a, b, c}) => S.chain(() => c, S.chain(() => b, a))),
//     exec(({a, b, c}) => S.chain(() => S.chain(() => c, b), a))
//   )
// })
//
// testl('Monad. Left identity.', 1, t => {
//   const exec = prep({a: _('_1__2')})
//   const f = x => x
//
//   // M.chain(f, M.of(a)) ≡ f(a)
//   t.deepEqual(
//     exec(({a}) => S.chain(f, S.of(a))),
//     exec(({a}) => f(a))
//   )
// })
//
// testl('Monad. Right identity.', 1, t => {
//   const exec = prep({a: _('_1__2')})
//
//   // M.chain(M.of, u) ≡ u
//   t.deepEqual(
//     exec(({a}) => S.chain(S.of, a)),
//     exec(({a}) => a)
//   )
// })
//
// const ap = (uf, ux) => S.chain(f => S.map(f, ux), uf)
//
// testl('Chain. Derived Apply. Composition.', 1, t => {
//   const exec = prep({
//     v: _('____1_____2_____3'),
//     u: _('4_____5_____6'),
//     a: _('__7_____8'),
//   })
//
//   // A.ap(A.ap(A.map(f => g => x => f(g(x)), a), u), v) ≡ A.ap(a, A.ap(u, v))
//   t.deepEqual(
//     exec(s => {
//       const a = S.map(x => y => [x, y], s.a)
//       const u = S.map(x => y => [x, y], s.u)
//       const v = s.v
//       return ap(ap(S.map(f => g => x => f(g(x)), a), u), v)
//     }),
//     exec(s => {
//       const a = S.map(x => y => [x, y], s.a)
//       const u = S.map(x => y => [x, y], s.u)
//       const v = s.v
//       return ap(a, ap(u, v))
//     })
//   )
// })
//
// testl('Chain. Derived Applicative. Identity.', 1, t => {
//   const exec = prep({
//     v: _('____1_____2_____3'),
//   })
//
//   // A.ap(A.of(x => x), v) ≡ v
//   t.deepEqual(
//     exec(s => ap(S.of(x => x), s.v)),
//     exec(s => s.v)
//   )
// })
//
// testl('Chain. Derived Applicative. Homomorphism.', 1, t => {
//   const exec = prep({})
//
//   const x = 1
//   const f = y => y + 1
//
//   // A.ap(A.of(f), A.of(x)) ≡ A.of(f(x))
//   t.deepEqual(
//     exec(() => ap(S.of(f), S.of(x))),
//     exec(() => S.of(f(x)))
//   )
// })
//
// testl('Chain. Derived Applicative. Interchange.', 1, t => {
//   const exec = prep({
//     u: _('____1_____2_____3'),
//   })
//
//   const y = 1
//
//   // A.ap(u, A.of(y)) ≡ A.ap(A.of(f => f(y)), u)
//   t.deepEqual(
//     exec(s => {
//       const u = S.map(x => z => [x, z], s.u)
//       return ap(u, S.of(y))
//     }),
//     exec(s => {
//       const u = S.map(x => z => [x, z], s.u)
//       return ap(S.of(f => f(y)), u)
//     })
//   )
// })
//
// // testl('Chain. Derived Applicative. Interchange (with map).', 1, t => {
// //   const exec = prep({
// //     u: _('____1_____2_____3'),
// //     v: _('__4__5__6'),
// //   })
// //
// //   // A.ap(u, v) ≡ A.ap(A.map(x => f => f(x), v), u)
// //   t.deepEqual(
// //     toString(exec(s => {
// //       const u = S.map(x => z => [x, z], s.u)
// //       const v = s.v
// //       return ap(u, v)
// //     })),
// //     toString(exec(s => {
// //       const u = S.map(x => z => [x, z], s.u)
// //       const v = s.v
// //       return ap(S.map(x => f => f(x), v), u)
// //     }))
// //   )
// // })
