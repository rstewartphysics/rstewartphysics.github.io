#!/bin/sh
# The breadboard sibling of run.sh — same engine, the bb-*.js question banks.
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc
exec "$JSC" sbd-engine.js bb-questions.js bb-trace-questions.js bb-fault-questions.js bb-reverse-questions.js free-mode.js bb-tests.js
