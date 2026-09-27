# DELIVERY

Hand-off record for the approved delivery. This is the first thing a person
reads when they pick the change up cold, and the last thing they check when they
want to know what they are allowed to trust.

It is deliberately a whole document rather than a diff or a chat log: whoever
inherits the work should not have to reconstruct the reasoning from a pull
request, a commit message, or a person's memory.

## 1. How to use this file

Keep it current. It is part of the deliverable, not a scratchpad that is
correct once and then quietly wrong.

When you touch anything below:

1. Update the relevant section in the same commit as the code change.
2. Add a line to the [Change log](#12-change-log).
3. If you defer something, move it into [Known gaps and follow-ups](#8-known-gaps-and-follow-ups)
   with an owner, rather than deleting the line.
4. When a gap is closed, record the resolution in the same table and then remove
   it from the follow-ups list.

Sections marked **Complete before merge** are not optional. A delivery with
those fields empty is not finished, however good the code is.

## 2. Delivery at a glance

| Field | Value |
| --- | --- |
| Change | <one line: what is different for a user of this repository> |
| Type | <feature / fix / change / removal / documentation> |
| Approved plan | <link to the approved plan> |
| Breaking | <yes / no — if yes, point at the section that explains the migration> |
| Requires migration steps | <yes / no> |
| Can be reverted cleanly | <yes / no — see [Revert and rollback](#7-revert-and-rollback)> |
| Touched paths | <every top-level path the change affects> |

## 3. Scope delivered

State the boundary, because most disputes about a delivery are scope disputes.

**In scope**

- <behaviour that now works>
- <behaviour that now fails earlier or more clearly>
- <tests, fixtures, tooling shipped with it>

**Explicitly out of scope**

- <thing a reader might reasonably expect that this change does not do>
- <the next increment, if this is the first of several>

**Deliberately not done, and why**

- <item> — <reason: separate plan, not enough information, deferring on purpose>

## 4. What lives where

| Path | Role | New or changed |
| --- | --- | --- |
| `<path>` | <what it is for> | <new / modified / removed> |

Explain any entry a newcomer would not guess. A file that exists only to hold a
value, or only to satisfy a tool, is worth a sentence.

## 5. How to verify it

Ordered, and runnable from a clean checkout. Every step should be something the
reader can copy and paste.

**Pre-flight**

```
<install / bootstrap command>
```

**Build**

```
<build command>
```

**Tests**

```
<full test command>
```

**Focused check for this change** — the smallest command that fails without this
change and passes with it. This is the most valuable line in the file: it is the
difference between a five-second confirmation and an afternoon.

```
<targeted test command>
```

**Manual smoke test**

1. <step a human performs>
2. <step a human performs>
3. <what they should see, stated as the observable result, not the intention>

## 6. Configuration and environment

| Name | Required | Default | Effect | Where it is read |
| --- | --- | --- | --- | --- |
| `<NAME>` | <yes/no> | <value> | <what changes if it is set differently> | `<file:line>` |

Notes on environment differences, ordering requirements, and anything that must
exist before start-up — local machine, CI, staging, production. Call out any
secret handling here; never the secret itself.

## 7. Behaviour, compatibility and rollback

- **Before:** <the behaviour as it was, in terms someone can observe>
- **After:** <the behaviour as it is now>
- **Data:** <does the change write, move, or delete data? How is existing data handled?>
- **Compatibility:** <what continues to work unchanged; what a caller must now do differently>
- **Migration steps:** <numbered, or "none">

**Revert and rollback**

- <how to undo it, in the order the steps must be performed>
- <what cannot be undone automatically, and the manual repair if it goes wrong>
- <how to tell, after the fact, whether a revert is needed>

## 8. Known gaps and follow-ups

Leave a row here rather than a surprise later.

| # | Gap | Why it is open | Owner | Target |
| --- | --- | --- | --- | --- |
| 1 | <what is not done> | <reason> | <who> | <when> |

## 9. Documentation map

Where a reader should look for what, beyond this file:

| Question | Answer lives in |
| --- | --- |
| <question> | `<path>` |

If a question is answered nowhere, that is itself a gap — add it to the table
above and fix the documentation.

## 10. Ownership and support

- **Maintained by:** <team or person>
- **Review expectations:** <what a reviewer checks on a change to this area>
- **Support window:** <how long questions are expected, or "no window">

## 11. Sign-off

| Check | By | Date | Result |
| --- | --- | --- | --- |
| Plan implemented as approved | | | |
| Tests added or updated and passing | | | |
| Verified from a clean checkout | | | |
| No undocumented behaviour change | | | |
| Follow-ups recorded with owners | | | |

## 12. Change log

Newest first. One line per meaningful update to this delivery.

| Date | Change |
| --- | --- |
| <date> | Initial delivery recorded. |
