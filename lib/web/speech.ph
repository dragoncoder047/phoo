/* >>
plain>
NOTE: This module is incomplete and there are no configuration options for pitch, rate, etc.
or to change the voice used.
*/

/* >>
word> speech.get-voices
description> Returns the list of computer voices this browser can use to speak.
sed> -- a
*/
to speech.get-voices do
    window .speechSynthesis .getVoices@
end

/* >>
word> speech.speak
description> Speak the string s out loud using the default voice.
sed> s --
*/
to speech.speak do
    nested
    window .SpeechSynthesisUtterance new
    /* TODO - add pitch, rate, etc. */
    dup
    nested
    window .speechSynthesis swap .speak() drop
end
