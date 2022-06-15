/* >>
word> when
lookahead> event handler
description> Attach handler as a listener for event on object o.
sed> o --
*/
to when do
    ]'[ name
    ]'[ functionize
    2 pack
    swap
    dup .on $ "function" isa? iff do
        swap .on()
    end
    else do
        swap .addEventListener()
    end
    drop
end

{} dup true .once= var, oncetrue

/* >>
word> after
lookahead> event handler
description> Attach handler as a listener for event on object o, that will be called at most once.
sed> o --
*/
to after do
    ]'[ name
    ]'[ functionize
    2 pack
    swap
    dup .once $ "function" isa? iff do
        swap .once()
    end
    else do
        swap :oncetrue concat .addEventListener()
    end
    drop
end

/* >>
word> waitfor
lookahead> event
description> Waits for the event to fire on the object o, then pushes the event detail that fired.

**Warning**: if the event never fires, your code will hang.
sed> o --
*/
to waitfor do
    promise nip temp put
    swap
    ]'[ name
    ' [ nested temp take call ] functionize
    2 pack
    swap
    dup .once $ "function" isa? iff do
        swap .once()
    end
    else do
        swap :oncetrue concat .addEventListener()
    end
    drop
    await
end
