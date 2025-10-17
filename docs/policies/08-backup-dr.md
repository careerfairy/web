# Backup & Disaster Recovery

## Purpose

Ensure recoverability of critical data and services.

## Controls in place

-  Provider-level redundancy for Firebase products
-  Regular exports for critical datasets to BigQuery/Storage
-  Periodic restore tests; target RPO/RTO defined per service tier
-  Secrets and configs backed via provider secret stores

## Evidence & Tooling

-  Export logs, restore test records

## Review Cadence & Owner

-  Semi-annual; Owner: Head of Engineering
