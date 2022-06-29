to fizzbuzz do /* a n -- */
    temp put
    ' do
        unpack swap
        temp copy swap mod 0 = iff noop
        else drop
    end map
    ' ++ fold
    dup len 0 != iff do
        temp release
        echo
    end
    else do
        drop
        temp take
        echo
    end
end

10 times do
    ' [ [ 3 $ "fizz" ]
        [ 5 $ "buzz" ] ] i^ 1+ fizzbuzz
end
