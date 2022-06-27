$ "0000000000000000000000000000000000001" var, world
110 var, rule
to tick do
    :world ' [ $ "" ] .split() ' do
        :world i^ 1- peek swap ++
        :world i^ 1+ :world len mod peek ++
        2 $>num bit :rule & 0 = iff $ "0" else $ "1"
    end map
    ' ++ fold is world
end
to printworld do
    $ ""
    :world witheach do
        $ "1" = iff do $ "[[;;white]&nbsp;]" ++ end
        else do $ "&nbsp;" ++ end
    end
    echo
end
to main do printworld tick 10 wait again end
main
