# Create Registered Livestreams Documents

This script creates a document for each user under the `registeredLivestreams` collection. The document ID is the user's authId, and it contains information about all the live streams the user has registered for, including the registration timestamps.

## What it does

1. Queries all `userLivestreamData` documents using a collection group query.
2. Processes these documents, creating a map of user IDs to another map of livestream IDs and their registration timestamps.
3. Creates a document for each user in the `registeredLivestreams` collection, with the document ID being the user's auth ID.
4. Each document contains the user's auth ID, a map of livestream IDs to registration timestamps, and the size of the map for further processing if needed.

## How to run

Execute the following command:

```shell
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/createRegisteredLivestreamsDocuments
```

## Output

The script will create documents in the `registeredLivestreams` collection. Each document will have the following structure:

```javascript
{
userId: "user_auth_id",
registeredLivestreams: {
      "livestream_id_1": Timestamp,
      "livestream_id_2": Timestamp,
      // ... more live streams
      },
      size: 2,
}
```
