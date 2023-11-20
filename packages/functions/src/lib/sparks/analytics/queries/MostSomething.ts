export const mostWatched = `
  SELECT 
    sparkId, 
    count(sparkId) as num_views
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents 
  WHERE actionType = "Played_Spark"
    and timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @timePeriod)
  GROUP BY sparkId
  ORDER BY count(sparkId) DESC
  LIMIT 3
`
export const mostLiked = `
  SELECT
    sparkId,
    COUNT(sparkId) AS total_liked_Sparks
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE actionType = "Like"
    and timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @timePeriod)
  GROUP BY sparkId
  ORDER BY COUNT(sparkId) DESC
  LIMIT 3
`

export const mostShared = `
  SELECT
    sparkId,
    COUNT(sparkId) AS total_shared_Sparks
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE actionType in ("Share_Clipboard", "Share_X", 
      "Share_Facebook", "Share_LinkedIn", "Share_WhatsApp", 
      "Share_Mobile", "Share_Email", "Share_Other")
    and timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @timePeriod)
  GROUP BY sparkId
  ORDER BY COUNT(sparkId) DESC
  LIMIT 3
`

export const mostRecent = `
  SELECT spark_id
  FROM careerfairy-e1fd9.firestore_export.sparkStats_schema_sparkStats_latest
  ORDER BY spark_createdAt DESC
  LIMIT 3
`
