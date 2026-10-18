#!/usr/bin/env python3
"""Re-run every page generator, then fail if any committed page changed.

    python3 tools/generators/regen_all.py           re-run them all
    python3 tools/generators/regen_all.py --check   ... and exit 1 if git sees a change (CI)

A generated page is only safe to re-run while it is exactly what its generator
emits.  A hand edit to the page, or a generator edit that was never re-run, is
caught here instead of being lost at the next re-run (OPEN-JOBS job 2, part 3).

Run it from a clean tree: --check reports every change git sees, whoever made it.
"""
import os
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
GEN = os.path.join(ROOT, "tools", "generators")
PT = os.path.join(GEN, "practice-tests")

# (folder, script, args) — the table in README.md
RUNS = [
    ("programmable-control", "build_page.py", []),
    ("mcq-bank", "build_all.py", []),
    ("stripboard/page", "build.py", []),
    ("practice-tests/n5-physics/electricity1", "build.py", []),
    ("practice-tests/n5-physics/electricity1", "build_b.py", []),
    ("practice-tests/n5-physics/electricity1", "build_graphing.py", []),
    ("practice-tests/s3-engineering/test1", "build.py", ["a"]),
    ("practice-tests/s3-engineering/test1", "build.py", ["b"]),
    ("practice-tests/higher-physics/electricity", "build.py", []),
    ("practice-tests/higher-physics/electricity", "build_b.py", []),
    ("practice-tests/higher-physics/forces-on-charged-particles", "build.py", []),
    ("practice-tests/higher-physics/forces-on-charged-particles", "build_b.py", []),
    ("practice-tests/advanced-higher-physics/simple-harmonic-motion", "build.py", []),
    ("practice-tests/advanced-higher-physics/simple-harmonic-motion", "build_b.py", []),
    ("practice-tests/advanced-higher-physics/stellar-physics", "build.py", ["a"]),
    ("practice-tests/advanced-higher-physics/stellar-physics", "build.py", ["b"]),
]


def main():
    # no __pycache__ folders, which --check would report as new files
    env = dict(os.environ, PYTHONDONTWRITEBYTECODE="1")
    failed = []
    for folder, script, args in RUNS:
        cwd = os.path.join(GEN, folder)
        name = " ".join([folder + "/" + script] + args)
        r = subprocess.run([sys.executable, script] + args, cwd=cwd, env=env,
                           stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        print(("ok    " if r.returncode == 0 else "FAIL  ") + name)
        if r.returncode:
            print(r.stdout)
            failed.append(name)
    if failed:
        print(f"\n{len(failed)} generator(s) failed to run.")
        return 1
    if "--check" not in sys.argv:
        return 0
    # tracked files that changed, and new files git does not ignore
    status = subprocess.run(["git", "status", "--porcelain", "--untracked-files=all"],
                            cwd=ROOT, stdout=subprocess.PIPE, text=True, check=True).stdout
    if not status.strip():
        print(f"\nAll {len(RUNS)} generators re-run to the committed pages.")
        return 0
    print("\nA re-run changed these files. Either a generated page was edited by hand (move the")
    print("edit into its generator) or a generator was changed and not re-run (re-run it and commit):\n")
    print(status)
    subprocess.run(["git", "--no-pager", "diff", "--stat"], cwd=ROOT)
    subprocess.run(["git", "--no-pager", "diff", "-U1"], cwd=ROOT)
    return 1


if __name__ == "__main__":
    sys.exit(main())
