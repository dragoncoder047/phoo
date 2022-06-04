/* >>
hidemodule>
*/

$ "stack ops" test.suite do
    $ "dup equal" test.case do
        1 dup
        assert.equal $ "Did not dup properly!"
        2drop
    end
    $ "drop should remove top item" test.case do
        1 2 3 drop
        2 pack ' [ 1 2 ]
        assert.equal $ "Dropped wrong item!"
    end
end