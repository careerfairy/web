# Secure Configuration & Secrets

## Purpose

Protect secrets and ensure secure default configurations.

## Controls in place

-  Secrets stored only in provider secret stores (Vercel/Firebase/GCP); never in VCS
-  Rotations on compromise or role change; least-privilege service accounts
-  TLS everywhere; encryption at rest by providers; strict CSP on web
-  Config reviews during PRs; no debug flags in production

## Evidence & Tooling

-  Secret store audit logs; PR templates/checklists

## Review Cadence & Owner

-  Quarterly; Owner: Head of Engineering
