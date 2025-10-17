# Change & Release Management

## Purpose

Ensure reliable changes with auditability and rollback.

## Controls in place

-  All changes via PR with linked issue/context
-  CI checks: lint, tests, type-check, build
-  Preview deployments (Vercel) for review; staging before prod when needed
-  Protected main branch; tagged releases; automated changelog where applicable
-  Rollback via previous deployment / revert merge
-  Emergency change protocol with post-change review

## Evidence & Tooling

-  Git history, PRs, Vercel deployment logs

## Review Cadence & Owner

-  Quarterly; Owner: Head of Engineering
