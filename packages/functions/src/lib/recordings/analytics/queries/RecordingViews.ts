export const recordingViews = `
  SELECT 
    COUNT(*) as total_views,
    COUNT(DISTINCT userId) as unique_viewers
  FROM careerfairy-e1fd9.firestore_export.recordingStatsUser_schema_recordingUserStats_latest
  WHERE 
    livestreamId = @livestreamId
    AND minutesWatched >= 1
`
