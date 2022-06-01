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
    is :suite.case
    ]'[
    try do
        run
    end
    do
        $ "tests failed" die
    end
end
    