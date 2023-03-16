# Back-fill Livestreams with Search trigrams

Will fetch all livestreams, generate the trigrams from the livestream title & company name and save this new field.

No other fields will be updated.

## Run

Since we have several cloud functions that trigger when the `livestream`
document is updated, and this change doesn't require any side effects, it's
best to disable the following functions while running this migration:

-  `syncLivestreams`
-  `automaticallyRecordLivestream`
-  `notifySlackWhenALivestreamStarts`
-  `ext-firestore-bigquery-export-4umz-fsexportbigquery`

**This means we'll stop the side effects for brief moments, it's best to run this during a period of low activity (night).**

To disable the functions, edit on the gcloud and update the trigger Document Path from `livestreams/{documentId}` to `livestreams2/{documentId}` temporarily.

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/backFillLivestreamsTriGrams
```
