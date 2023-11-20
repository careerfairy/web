export const totalViewsPastYear = `
  SELECT 
    TIMESTAMP_TRUNC(timestamp, DAY) as date,
    count(sparkId) as total_views
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 YEAR)
    AND actionType = "Played_Spark"
  GROUP BY date
  ORDER BY date
`

export const uniqueViewersPastYear = `
SELECT 
  TIMESTAMP_TRUNC(timestamp, DAY) as date,
	count(distinct(ifNull(userId, visitorId))) as unique_viewers
FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 YEAR)
  AND actionType = "Played_Spark"
GROUP BY date
ORDER BY date
`
