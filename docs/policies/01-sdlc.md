# Secure Development Lifecycle (SDLC)

## Purpose

Ensure secure, compliant delivery for web (Vercel) and mobile (Expo) backed by Firebase.

## Scope

All product code, infrastructure-as-config, CI/CD pipelines, and dependencies.

## Roles & Responsibilities

-  Engineering: implement controls, code reviews, tests
-  Security/Eng: maintain tooling, advise on risks
-  Owners: approve scope changes and risk acceptances

## Controls in place

-  Threat modeling for impactful changes (auth, payments, PII flows)
-  Mandatory PR reviews (2-eyes), status checks (lint, unit, e2e where applicable)
-  Dependency scanning and weekly updates
-  Secrets never in VCS; stored in Vercel/Firebase/CI secret stores
-  Environment separation: dev/staging/prod; least-privilege access
-  E2E tests (Playwright) for critical flows; unit tests (Jest)
-  SAST/ESLint rules; TypeScript strictness

## Evidence & Tooling

-  GitHub PR history and required checks
-  Playwright/Jest reports
-  Vercel/Firebase secret stores audit logs

## Review Cadence & Owner

-  Quarterly review; Owner: Head of Engineering
