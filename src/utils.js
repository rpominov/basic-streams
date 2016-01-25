/* @flow */

/* Pipes a value through a line of functions.
 * Allows to replace `f3(f2(f1(x)))` with `pipe(x, f1, f2, f3)`
 *
 * Note: It's not well typed with Flow, we had to resort to `mixed`
 */
export function pipe( value:mixed, ...fns:Array<(x:mixed) => mixed> ): mixed {
  return fns.reduce((x, fn) => fn(x), value)
}
