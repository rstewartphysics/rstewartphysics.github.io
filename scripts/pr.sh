#!/usr/bin/env bash
# One path from approved change to open PR (website audit Phase 1, 19 Nov 2026).
# Run from inside a git worktree, never the shared checkout (several sessions share its HEAD).
#
#   scripts/pr.sh <new-branch> <commit-message-file> <pr-title> <pr-body-file>
#
# Stages everything in the worktree, refuses on main or on anything that looks like pupil data,
# branches off the current HEAD, commits, pushes and opens the PR. Prints the PR URL.
set -euo pipefail

if [ $# -ne 4 ]; then
  echo "usage: scripts/pr.sh <new-branch> <commit-message-file> <pr-title> <pr-body-file>" >&2
  exit 2
fi
branch=$1 msg=$2 title=$3 body=$4

die() { echo "pr.sh: $*" >&2; exit 1; }

[ -f "$msg" ] || die "no commit message file: $msg"
[ -f "$body" ] || die "no PR body file: $body"
case "$branch" in main|master|origin/*|"") die "refusing branch name '$branch'";; esac

top=$(git rev-parse --show-toplevel)
# The shared checkout's .git is a directory; a worktree's is a file.
[ -f "$top/.git" ] || die "run this from a git worktree, not the shared checkout ($top)"

git fetch -q origin main
git add -A
staged=$(git diff --cached --name-only)
[ -n "$staged" ] || die "nothing to commit"

# Pupil data never leaves the Mac (global CLAUDE.md section 5). Names alone, so a false alarm
# costs a rename, and a real list is stopped before the push.
pupilish=$(printf '%s\n' "$staged" | grep -iE '(class.?list|pupil|roster|register|mark.?book|\.xlsx?$|\.csv$)' \
  | grep -vE '^(_data/|tools/generators/.*\.csv$|legacy-wip-audit\.csv$|progress-hooks-audit\.csv$)' || true)
private=$(printf '%s\n' "$staged" | grep -E '(^|/)(secure|centre-data|New Tracking)/' || true)
if [ -n "$pupilish$private" ]; then
  printf '%s\n' "$pupilish" "$private" | sed '/^$/d' >&2
  die "staged files look like pupil or private data; unstage them, or rename if this is a false alarm"
fi

current=$(git branch --show-current)
[ "$current" = "main" ] && [ "$branch" = "main" ] && die "refusing to commit to main"
if [ "$current" != "$branch" ]; then
  git switch -q -c "$branch"
fi
[ "$(git branch --show-current)" = "$branch" ] || die "not on $branch"

git commit -q -F "$msg"
echo "committed $(git rev-parse --short HEAD) on $branch: $(printf '%s\n' "$staged" | wc -l | tr -d ' ') files"
git push -q -u origin "$branch"
gh pr create --base main --head "$branch" --title "$title" --body-file "$body"
