to output do
    nested window .console swap .log()
end

to output.err do
    nested window .console swap .error()
end

to test.suite do
    in_scope do
        var, suite.name
        0 var, suite.fails
        0 var, suite.successes
        $ "" var, suite.case

        $ "Running test suite: " :suite.name ++ output
        ]'[ run

        :suite.fails :suite.successes +
        dup 0 = iff do
            $ "No tests!" die
        end
        else do
            :suite.fails 0 > iff do
                $ "tests: " ++ :suite.fails ++ $ " failing." output.err
                :suite.fails $ " tests failed." ++ die
            end
            else do
                $ "tests: All passed." ++ output
            end
        end
    end
end

to test.case do
    is suite.case
    false
    ]'[
    try do
        run
    end
    do
        $ "Test case failed: " :suite.case ++ output.err
        dup output.err
        nip
    end
    dup iff do
        :suite.fails 1+ is suite.fails
    end
    else do
        :suite.successes 1+ is suite.successes
    end
end

to assert do
    ]'[ temp put
    not if do
        $ "Assertion failed! " temp take ++ die
    end
    temp release
end

to assert.equal do
    ]'[ temp put
    2dup != if do
        stringify swap stringify swap
        $ " == " ++ swap ++ $ " was false! " ++ temp take ++
        die
    end
    temp release
end

to assert.lt do
    ]'[ temp put
    2dup >= if do
        stringify swap stringify swap
        $ " < " ++ swap ++ $ " was false! " ++ temp take ++
        die
    end
    temp release
end