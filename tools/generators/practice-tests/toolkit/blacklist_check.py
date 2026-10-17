#!/usr/bin/env python3
"""Check a test's own quantities against the blacklist, mechanically.

Plan §5.3: "checked mechanically against the blacklist before ship, not from
memory". A hit is not automatically fatal — the same voltage in a different key
area is fine — but it must be looked at and either changed or justified in the
run notes.
"""
import importlib.util
import json
import os
import sys
import types

HERE = os.path.dirname(os.path.abspath(__file__))
# The blacklists list what the real tests and decks use, so they stay on the Mac and out of
# this public repo. Without them (CI) the check is skipped, not failed.
MAC = os.path.expanduser("~/claude-work/practice-tests")
_DEFAULT = object()


def load(name="blacklist-higher.json"):
    for d in (HERE, os.path.join(MAC, "toolkit")):
        if os.path.exists(os.path.join(d, name)):
            return json.load(open(os.path.join(d, name), encoding="utf-8"))
    return None


def mac_module(rel):
    """A blacklist module kept on the Mac, or a stand-in that skips the check."""
    path = os.path.join(MAC, rel)
    if not os.path.exists(path):
        return types.SimpleNamespace(report=lambda qs: _skipped(qs))
    spec = importlib.util.spec_from_file_location(os.path.basename(rel)[:-3], path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _skipped(quantities):
    print("blacklist: not on this machine, %d quantities not checked" % len(quantities))
    return 0


def check(quantities, bl=_DEFAULT):
    """`quantities` is a list of "<value> <unit>" strings, as the blacklist
    stores them. Returns [(quantity, source), …]."""
    bl = load() if bl is _DEFAULT else bl
    hits = []
    for q in quantities:
        for src, used in bl["sources"].items():
            if q in used:
                hits.append((q, src))
    return hits


def report(quantities, bl=_DEFAULT):
    bl = load() if bl is _DEFAULT else bl
    if bl is None:
        return _skipped(quantities)
    hits = check(quantities, bl)
    if not hits:
        print("blacklist: %d quantities checked, no clashes" % len(quantities))
        return 0
    for q, src in hits:
        print("blacklist CLASH  %-14s already used in  %s" % (q, src))
    return len(hits)


if __name__ == "__main__":
    sys.exit(1 if report(sys.argv[1:]) else 0)
