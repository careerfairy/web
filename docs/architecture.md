# CareerFairy Architecture (Serverless)

This overview reflects our production stack and data flows adapted to our serverless setup on Vercel and Firebase, with external processors and consent-gated services.

```mermaid
flowchart LR
  %% Users
  B[Web Browser]:::user
  M[Mobile App (iOS/Android - Expo)]:::user

  %% Frontend Web
  subgraph VERCEL[Web App (Next.js on Vercel)]
    VX[Next.js Pages/SSR/ISR]
  end

  %% Firebase/Core Backend
  subgraph FB[Firebase (EU - europe-west1)]
    AUTH[Auth]
    FS[(Firestore)]
    STG[(Storage)]
    FUN[Cloud Functions]
  end

  %% Realtime/Streaming
  AG[Agora RTC]

  %% Data/Content/Search
  HY[Hygraph CMS]
  ALG[Algolia]
  MAP[Mapbox]
  IK[ImageKit CDN]

  %% Payments
  ST[Stripe]

  %% Analytics/Consent/Support (opt-in via Usercentrics)
  UC[Usercentrics CMP]
  GA[Google Analytics 4]
  HJ[Hotjar]
  SA[Simple Analytics]
  CR[Crisp Chat]

  %% Notifications & Comms
  CIO[Customer.io]
  PM[Postmark]
  MG[Mailgun]

  %% Error Monitoring
  SEN[Sentry]

  %% Data Platform / Internal
  BQ[BigQuery]
  SLK[Slack Webhooks]

  %% ATS via Merge
  MR[Merge.dev]
  ATS[(ATS: Greenhouse / Workable / SmartRecruiters / Teamtailor)]

  %% User flows
  B -->|HTTPS| VX
  M -->|HTTPS| AUTH
  M -->|SDK| FS
  M -->|SDK| STG
  M -->|HTTPS| FUN
  M -->|RTC| AG

  VX -->|Auth SDK| AUTH
  VX -->|Firestore SDK| FS
  VX -->|Storage SDK| STG
  VX -->|Serverless API| FUN

  %% Content & Search
  VX --> HY
  VX --> ALG
  VX --> MAP

  %% Media Delivery
  STG -->|Origin| IK
  VX -->|Images/Video via loader| IK

  %% Payments
  VX -->|Checkout/Elements| ST
  ST -->|Webhooks| FUN

  %% Streaming tokens
  FUN -->|Create RTC tokens| AG
  B -->|RTC| AG

  %% Notifications
  FUN --> CIO
  FUN --> PM
  FUN --> MG

  %% Analytics/Consent/Support (opt-in)
  VX --> UC
  VX --> GA
  VX --> HJ
  VX --> SA
  VX --> CR

  %% Error monitoring
  VX --> SEN
  M --> SEN
  FUN --> SEN

  %% Data platform & internal comms
  FS --> BQ
  FUN --> BQ
  FUN --> SLK

  %% ATS integrations
  VX --> MR
  FUN --> MR
  MR --> ATS

  classDef user fill:#eef,stroke:#4b6,stroke-width:1px
```

## PII Touchpoints (high level)

-  Authentication data: Firebase Auth
-  User profiles, registrations, chat metadata: Firestore
-  Media uploads: Firebase Storage (delivered via ImageKit CDN)
-  Payments: Stripe (minimal data; tokens; webhooks to Functions)
-  Notifications: Customer.io, Postmark, Mailgun
-  Monitoring: Sentry (error metadata), Hotjar/GA/Simple Analytics (consent-gated)
-  Support: Crisp Chat (consent-gated)
-  ATS integrations via Merge.dev (on demand, per customer)
