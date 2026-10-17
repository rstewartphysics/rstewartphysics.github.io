#!/bin/sh
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc
exec "$JSC" sbd-engine.js sbd-render.js sbd-circuit.js questions.js verify.js
