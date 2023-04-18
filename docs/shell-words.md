# Extra Words in the Shell

The [online Phoo shell](/) contains a few more words than are included in the "standard" library. Phoo was designed to be run in more places than just the online shell, and so the shell-specific words are separated.

### `wait` ( `n` &rarr; ) {#wait}

Pauses execution for `n` milliseconds.

### `echo` ( `s` &rarr; ) {#echo}

Echoes the string `s` to the console, on its own line.

### `echo-error` ( `s` &rarr; ) {#echo-error}

Same as [`echo`](#echo), but uses red text (as an error).

### `echo-raw` ( `s` &rarr; ) {#echo-raw}

Echoes the string `s` to the console, as a string of raw HTML (so that CSS is applied to the text).

### `alert` ( `s` &rarr; ) {#alert}

Shows the string to the user in a pop-up Javascript `:::js alert()` box.

### `confirm` ( `s` &rarr; `b` ) {#confirm}

Shows the string to the user in a pop-up Javascript `:::js confirm()` box, and returns `:::js true` or `:::js false` depending on whether the user pressed `OK` or `Cancel`.

### `prompt` ( `s` &rarr; `a` ) {#prompt}

Shows the string to the user in a pop-up Javascript `:::js prompt()` box, and returns the string they entered.

### `input` ( `s` &rarr; `a` ) {#input}

Prinst the string to the console, and allows the user to type an answer. Returns the string they entered.

### `nl` ( &rarr; ) {#nl}

Prints a newline.

### `sp` ( &rarr; ) {#sp}

Prints a space, without advancing the cursor's vertical position.

### `cc` ( &rarr; ) {#cc}

Clears the console.

### `empty` ( `*` &rarr; ) {#empty}

Removes **all** of the items from the stack.

### `load_script` ( `url` &rarr; ) {#load_script}

Adds the Javascript library at `url` to the page, and waits until it loads fully.

### `add_repo` ( `url` &rarr; ) {#add_repo}

Adds the URL to the list of base paths that `:::phoo use` will search in when importing a module.

### `echostack` ( &rarr; ) {#echostack}

Prints out the stack without altering it. This is called automatically after every input in the shell is finished running.

### `JQ()` ( `s` &rarr; `$` ) {#JQ()}

Takes the selector, HTML string, or element and turns it into a jQuery object.

### `shell.load-font` ( `n` &rarr; ) {#shell.load-font}

Takes the font name `n` and loads a CSS stylesheet to include that font from [Google Fonts](https://fonts.google.com/).

## Shell Recognized `#pragma`s

The `#pragma` word can be used to control the behavior and appearance of the shell as well as that of Phoo.

|     Pragma Name    |    Type   |       Default       | Behavior                                                                                                                           |
|:------------------:|:---------:|:-------------------:|:---------------------------------------------------------------------------------------------------------------------------------- |
|   `autocomplete`   | `boolean` |        `true`       | Enables or disables the autocomplete functionality provided by the shell.                                                          |
|    `shell.font`    |  `string` |     `"IBM Mono"`    | Changes the font used by the shell. Monospaced ones are best, but proportional-width ones work too, they just look a little wonky. |
|    `shell.size`    |  `number` |         `1`         | Scales up or down the shell font by that factor compared to 12px.                                                                  |
|   `shell.pretty`   | `boolean` |       `false`       | Enables or disables prettyprinting of the stack.                                                                                   |
|   `shell.indent`   |  `string` | `"  "` (two spaces) | Changes the indent string used by pretty-printing, if enabled.                                                                     |
|    `shell.reprd`   |  `number` |         `5`         | Sets the maximum depth at which the recursive representation ("repr") function wil bail and replace the too-deep value with `...`  |
| `shell.light-mode` | `boolean` |       `false`       | If `true`, sets the background to white and the text to black.                                                                     |
