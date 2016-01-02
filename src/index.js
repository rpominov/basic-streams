/* @flow */

type Sink<T> = ( payload:T ) => void
type Disposer = () => void
type Stream<T> = ( s:Sink<T> ) => Disposer
type Fn<A,B> = ( x:A ) => B
type Fn2<A,B,C> = ( x:A ) => ( y:B ) => C
type Fn3<A,B,C,D> = ( x:A ) => ( y:B ) => ( z:C ) => D
type LiftedFn<A,B> = ( x:Stream<A> ) => Stream<B>
type LiftedFn2<A,B,C> = ( x:Stream<A> ) => ( y:Stream<B> ) => Stream<C>
type LiftedFn3<A,B,C,D> = ( x:Stream<A> ) => ( y:Stream<B> ) => ( z:Stream<C> ) => Stream<D>
type Maybe<T> = {type: "just", value: T} | {type: "nothing"}

// NEXT: merge, empty, fromCallback, scan, transduce





/* Creates a stream containing given value
 *
 * PROBLEM: it can be confused with Maybe's just, but `of` is a reserved word. `pure` ?
 */
export function just<A>( x:A ): Stream<A> {
  return sink => {
    sink(x)
    return () => {}
  }
}


/* Lifts function `A => B` to a function that operates
 * on streams `Stream<A> => Stream<B>`
 */
export function lift<A,B>( fn:Fn<A,B> ): LiftedFn<A,B> {
  return stream =>
    sink => stream(payload => sink(fn(payload)))
}


/* Given a predicate `A => boolean` returns a function
 * that operates on streams `Stream<A> => Stream<A>`.
 * The result function returns a stream without values that don't satisfy predicate.
 */
export function filter<A>( predicate:Fn<A,boolean> ): LiftedFn<A,A> {
  return stream =>
    sink => stream(payload => {
      if (predicate(payload)) {
        sink(payload)
      }
    })
}


/* Given a function `A => Stream<B>` returns a function
 * that operates on streams `Stream<A> => Stream<B>`.
 * The result function will spawn a `Stream<B>` for each value from `Stream<A>` using the provided function.
 * The final `Stream<B>` will contain values from all spawned streams.
 */
export function chain<A,B>( fn:Fn<A,Stream<B>> ): LiftedFn<A,B> {
  return stream =>
    sink => {
      let spawnedDisposers = []
      const mainDisposer = stream(payload => {
        spawnedDisposers.push(fn(payload)(sink))
      })
      return () => {
        spawnedDisposers.forEach(fn => fn())
        mainDisposer()
      }
    }
}


/* Same as `chain()`, except the final stream will contain
 * only that values from each spawned streams that was
 * emitted before the next stream was spawned.
 */
export function chainLatest<A,B>( fn:Fn<A,Stream<B>> ): LiftedFn<A,B> {
  return stream =>
    sink => {
      let spawnedDisposers = () => {}
      const mainDisposer = stream(payload => {
        spawnedDisposers()
        spawnedDisposers = fn(payload)(sink)
      })
      return () => {
        spawnedDisposers()
        mainDisposer()
      }
    }
}


/* Giver a stream of functions `A => B`, returns a function
 * that operates on streams `Stream<A> => Stream<B>`.
 * The result stream `Stream<B>` will contain values created by applying
 * the latest function from `Stream<A => B>` to the latest value from `Stream<A>`
 * every time one of them updates.
 */
export function ap<A,B>( streamf:Stream<Fn<A,B>> ): LiftedFn<A,B> {
  return streamv =>
    sink => {
      let latestF: Maybe<Fn<A,B>> = {type: 'nothing'}
      let latestV: Maybe<A> = {type: 'nothing'}
      const push = () => {
        if (latestF.type === 'just' && latestV.type === 'just') {
          const fn = latestF.value
          sink(fn(latestV.value))
        }
      }
      const disposef = streamf(f => {
        latestF = {type: 'just', value: f}
        push()
      })
      const disposev = streamv(v => {
        latestV = {type: 'just', value: v}
        push()
      })
      return () => {
        disposef()
        disposev()
      }
    }
}


/* Lifts a 2 arity curried function `A => B => C` to a curried function that operates
 * on streams `Stream<A> => Stream<B> => Stream<C>`
 */
export function lift2<A,B,C>( fn:Fn2<A,B,C> ): LiftedFn2<A,B,C> {
  return s1 => ap(lift(fn)(s1))
}


// function compose<A,B,C>( f1:Fn<B,C> ): Fn2<Fn<A,B>,A,C> {
//   return f2 => x => f1(f2(x))
// }

/* Lifts a 3 arity curried function `A => B => C => D` to a curried function that operates
 * on streams `Stream<A> => Stream<B> => Stream<C> => Stream<D>`
 */
export function lift3<A,B,C,D>( fn:Fn3<A,B,C,D> ): LiftedFn3<A,B,C,D> {
  return s1 => s2 => ap(lift2(fn)(s1)(s2))

  // Flow can't typecheck this properly.
  // More precisely it always thinks it's valid,
  // even if we change the type declararion above to make it invalid.
  //
  // return compose(compose(ap))(lift2(fn))
}
