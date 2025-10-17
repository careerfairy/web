# Logging, Monitoring & Alerting

## Purpose

Ensure observability for security and reliability.

## Controls in place

-  Structured app logs (web/functions) with correlation IDs where applicable
-  Error tracking via Sentry; privacy filters; minimal PII
-  Performance and usage metrics via GA/Simple Analytics (consent-gated)
-  Access logs retained per provider defaults and legal requirements
-  Alert thresholds for critical flows (auth, payments, livestream start)

## Evidence & Tooling

-  Sentry dashboards, provider logs, alert configurations

## Review Cadence & Owner

-  Quarterly; Owner: Head of Engineering
