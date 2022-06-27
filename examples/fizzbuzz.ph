to fizzbuzz do /* a n -- */
    temp put
    $ "" swap
    witheach do
        unpack swap
        temp copy swap mod 0 = iff ++
        else drop
    end
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
