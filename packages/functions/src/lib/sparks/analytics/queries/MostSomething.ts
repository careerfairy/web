export const mostWatched = `
  SELECT 
    sparkId, 
    count(sparkId) as num_views
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents 
  WHERE groupId = @groupId
    AND actionType = "Played_Spark"
    AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @timePeriod)
  GROUP BY sparkId
  ORDER BY count(sparkId) DESC
  LIMIT 3
`
export const mostLiked = `
  SELECT
    sparkId,
    COUNT(sparkId) AS total_liked_Sparks
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE groupId = @groupId
    AND actionType = "Like"
    AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @timePeriod)
  GROUP BY sparkId
  ORDER BY COUNT(sparkId) DESC
  LIMIT 3
`

export const mostShared = `
  SELECT
    sparkId,
    COUNT(sparkId) AS total_shared_Sparks
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE groupId = @groupId
    AND actionType LIKE 'Share_%'
    AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @timePeriod)
  GROUP BY sparkId
  ORDER BY COUNT(sparkId) DESC
  LIMIT 3
`

export const mostRecent = `
  SELECT spark_id
  FROM careerfairy-e1fd9.firestore_export.sparkStats_schema_sparkStats_latest
  WHERE spark_group_id = @groupId
  ORDER BY spark_createdAt DESC
  LIMIT 3
`
