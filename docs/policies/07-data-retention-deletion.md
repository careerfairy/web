# Data Retention & Deletion

## Purpose

Define how long we keep data and how we delete it.

## Controls in place

-  Retention aligned with business/legal needs; defaults applied in Firestore where feasible
-  User deletion flows propagate to Firebase, Customer.io, and analytics where applicable
-  Backups follow separate lifecycle (see Backup & DR)

## Evidence & Tooling

-  Deletion requests, scripts, and audit logs

## Review Cadence & Owner

-  Semi-annual; Owner: Head of Engineering
