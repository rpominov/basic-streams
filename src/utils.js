/* @flow */

/* Pipes a value through a line of functions.
 * Allows to replace `f3(f2(f1(x)))` with `pipe(x, f1, f2, f3)`
 *
 * Note: It's not well typed with Flow, we had to resort to `any`
 */
export function pipe( value:any, ...fns:Array<(x:any) => any> ): any {
  return fns.reduce((x, fn) => fn(x), value)
}
