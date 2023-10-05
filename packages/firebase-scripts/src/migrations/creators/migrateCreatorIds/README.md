Migrate Creator IDs:

npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/creators/migrateCreatorIds

What it does:

This script performs two main tasks:

1. It iterates over all creators in the careerCenterData/[groupId]/creators collection. For each creator, it generates a new Firestore ID and updates the id field of the creator document with this new ID. The old creator document, which used the creator's email as the ID, is then deleted.

2. For each updated creator, the script finds all sparks in the sparks collection that reference that creator. It then updates the embedded creator data in each of these sparks to reflect the new ID of the creator.

This migration is necessary because the creators were initially using their emails as their document IDs and id fields, which is not ideal. This script replaces these email IDs with Firestore-generated IDs.
Example Output:

The script does not produce any output, but after running the script, the id field of each creator document and the id field of the embedded creator data in each spark document will be a Firestore-generated ID, rather than an email.
Important Notes:

-  Please replace [groupId] with the actual group ID before running the script.
-  This script makes irreversible changes to your Firestore database. It's a good idea to make a backup of your Firestore database before running the script.
-  Test this script thoroughly before running it on your production database.
-  This script assumes that the id field of the creator object embedded in each spark is the same as the document ID of the creator. If this is not the case, you may need to adjust the script accordingly.
-  This script uses Firestore's batched writes, so it will work as long as the total number of creators and sparks is less than 500. If you have more than 500 creators or sparks, you will need to modify the script to handle this.
