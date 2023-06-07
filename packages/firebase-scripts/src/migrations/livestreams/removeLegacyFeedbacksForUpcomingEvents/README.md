# Cleanup of Legacy Ratings from Future Livestreams

This is a script that fetches and removes legacy feedbacks for upcoming livestream events. The script also adds a new feedback rating that we want to be asked.

## How to Run

You can execute the script by running the following command:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/removeLegacyFeedbacksForUpcomingEvents
```

## What it does

The script performs a cleanup operation, specifically targeting legacy feedback data associated with future livestream events. This operation is intended to be a one-time migration and works by following these steps:

1. The script fetches all future livestream events and all event ratings from the repository.

2. For each rating, the script checks if it belongs to a future livestream event.

3. If the rating belongs to a future livestream, the script then checks if the rating matches one of the two predefined legacy rating structures:

   -  `overallRating`: A rating asking for the overall experience and any feedback the user might want to share.

   -  `willApplyRating`: A rating asking if the user is more likely to apply thanks to the livestream.

4. If the rating matches either of these structures, it gets queued for deletion.

5. The deletion is performed in batches for efficiency. The batch size is currently set to 200, which has been found to work consistently.

6. After all the batches have been processed, the script logs the total number of ratings read and deleted.

7. Next, the script also loops through all the future live stream events and adds a new feedback rating that we want to be asked

Please note that the deletion only happens if there's an exact match with the legacy rating structures. In the case of `willApplyRating`, there's an extra check to ensure that all words in the predefined question are included in the actual rating question because the company name is a dynamic part of the question.

---
