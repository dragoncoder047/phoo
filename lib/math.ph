/* >>
plain>

This module contains Phoo bindings for most all of the functions defined
on the global [`Math`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)
object.

### Constants ( &rarr; `num` ) : {#consts}

* `PI`
* `E`
* `LN2`
* `LN10`
* `LOG2E`
* `LOG10E`
* `SQRT2`
* `SQRT1_2`

### One-argument functions ( `a` &rarr; `b` ) : {#1arg}

* `acos`
* `acosh`
* `asin`
* `asinh`
* `atan`
* `atanh`
* `cbrt`
* `ceil`
* `clz32`
* `cos`
* `cosh`
* `exp`
* `expm1`
* `floor`
* `fround`
* `imul`
* `log`
* `log1p`
* `log10`
* `log2`
* `round`
* `sign`
* `sin`
* `sqrt`
* `tan`
* `tanh`
* `trunc`

### `atan2` ( `x` `y` &rarr; `v` ) {#atan2}

### `hypot` ( `a`* array of lengths*{.description} &rarr; `h`*hypotenuse*{.description} ) {#hypot}

`abs`, `max`, `min`, `pow`, and `random` are omitted.

[`abs`](builtins.html#abs), [`max`](builtins.html#max), [`pow`](_builtins.html#%2a%2a),
and [`min`](builtins.html#min) are included in the [standard builtins](builtins.html),
and a better-quality, seedable random number generator is included in the [`random`](random.html) module.
*/

window .Math var, Math /* get the global Math object */

to _const_factory do 
    ]'[ :Math nested
    over name nested
    ' [ get ] concat concat
    ]define[
end

to _func1_factory do 
    ]'[ :Math nested
    over name nested
    ' [ get dip nested call ] concat concat
    ]define[
end

to _func2_factory do 
    ]'[ :Math nested
    over name nested
    ' [ get dip [ 2 pack ] call ] concat concat
    ]define[
end

to _funca_factory do 
    ]'[ :Math nested
    over name nested
    ' [ get call ] concat concat
    ]define[
end

_const_factory PI
_const_factory E
_const_factory LN2
_const_factory LN10
_const_factory LOG2E
_const_factory LOG10E
_const_factory SQRT2
_const_factory SQRT1_2
/* omitting abs */
_func1_factory acos
_func1_factory acosh
_func1_factory asin
_func1_factory asinh
_func1_factory atan
_func1_factory atanh
_func2_factory atan2
_func1_factory cbrt
_func1_factory ceil
_func1_factory clz32
_func1_factory cos
_func1_factory cosh
_func1_factory exp
_func1_factory expm1
_func1_factory floor
_func1_factory fround
_funca_factory hypot
_func1_factory imul
_func1_factory log
_func1_factory log1p
_func1_factory log10
_func1_factory log2
/* omitting max */
/* omitting min */
/* omitting random */
_func1_factory round
_func1_factory sign
_func1_factory sin
_func1_factory sqrt
_func1_factory tan
_func1_factory tanh
_func1_factory trunc

forget _func1_factory
forget _func2_factory
forget _funca_factory
forget var_Math
forget :Math
