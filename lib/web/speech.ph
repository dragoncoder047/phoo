to get-voices do
    window .speechSynthesis .getVoices@
end

to speak do
    nested
    window .SpeechSynthesisUtterance new()
    // TODO - add pitch, rate, etc.
    dup
    nested
    window .speechSynthesis .speak() drop
end