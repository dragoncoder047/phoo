to speech.get-voices do
    window .speechSynthesis .getVoices@
end

to speech.speak do
    nested
    window .SpeechSynthesisUtterance new
    /* TODO - add pitch, rate, etc. */
    dup
    nested
    window .speechSynthesis swap .speak() drop
end