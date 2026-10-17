#!/bin/sh
# node is not installed on this machine; macOS ships JavaScriptCore, which runs
# the same engine.js that gets inlined into the page. No second implementation.
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc
exec "$JSC" sbd-engine.js questions.js trace-questions.js fault-questions.js reverse-questions.js free-mode.js tests.js
