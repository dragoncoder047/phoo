use _fmath
use _imath

to _M [ stack ]
window .Math _M put /* get the global Math object */
to Math [ _M share ]

to _const_factory do 
    ]'[ Math nested
    over name nested
    ' [ get ] concat concat
    ]define[
end

to _func1_factory do 
    ]'[ Math nested
    over name nested
    ' [ get dip nested call ] concat concat
    ]define[
end

to _func2_factory do 
    ]'[ Math nested
    over name nested
    ' [ get dip [ 2 pack ] call ] concat concat
    ]define[
end

to _funca_factory do 
    ]'[ Math nested
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
_func2_factory pow
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
forget Math
forget _M
