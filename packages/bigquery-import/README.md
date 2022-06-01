# BigQuery Imports (KPIs)

We're using Google BigQuery to perform KPIs queries.

mermaid diagram
firestore -> bigquery -> grafana

grafana link

# How are we importing data into BigQuery

We're streaming updates from certain collections into BigQuery using the extension: https://firebase.google.com/products/extensions/firebase-firestore-bigquery-export
We've made an initial bulk import to backfill the existing data using the script: https://github.com/firebase/extensions/blob/master/firestore-bigquery-export/guides/IMPORT_EXISTING_DOCUMENTS.md
