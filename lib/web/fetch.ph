/* >>
plain>
This module implements short wrappers around the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
to fetch text or JSON (GET method).
*/

/* >>
word> fetchText
description> Fetch the URL, and return the text content.
sed> url -- text
*/
to fetchText do
    nested
    window swap .fetch() await
    .text@ await
end

/* >>
word> fetchJSON
description> Fetch the URL, parse it as JSON, and return the resultant object.
sed> url -- obj
*/
to fetchJSON do
    nested
    window swap .fetch() await
    .json@ await
end