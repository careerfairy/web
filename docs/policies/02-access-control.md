# Access Control & IAM

## Purpose

Protect systems and data via least privilege and strong authentication.

## Scope

Vercel, Firebase, BigQuery, Stripe, Sentry, Customer.io, and other processors.

## Controls in place

-  MFA required for all admin accounts
-  RBAC with least privilege; project- and role-based permissions
-  Joiner/Mover/Leaver: access granted by request; removed within 24h of departure
-  Service accounts scoped narrowly; keys rotated; no shared accounts
-  Periodic access reviews (quarterly)

## Evidence & Tooling

-  Access review logs; audit trails from Vercel/Firebase/GCP

## Review Cadence & Owner

-  Quarterly; Owner: Head of Engineering
