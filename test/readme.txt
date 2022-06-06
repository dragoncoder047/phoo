This directory contains some old dead code that I was fooling around with trying to make a test suite.

I modelled it after Chai using the concepts of grouping everything into a test suite, and then running
individial test cases and making assertions that must pass.

Generally the tests would look something like this:

    $ "test suite name" test.suite do

        $ "test case name" test.case do

            // do some tests
            // make assertions
            assert.equal $ "Failure message"

        end

        $ "another test case name" test.case do

            // do some tests
            // make assertions
            assert $ "Failure message"

        end
    end

I had set up this to run using Node.js on a GitHub Actions runner, but I could not get it to work. I
probably won't get back to this anytime soon.