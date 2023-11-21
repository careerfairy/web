export const totalViewsPastYear = `
  SELECT 
    TIMESTAMP_TRUNC(timestamp, DAY) AS x,
    COUNT(sparkId) AS y
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE groupId = @groupId
    AND actionType = "Played_Spark"
    AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR))
  GROUP BY x
  ORDER BY x
`

export const uniqueViewersPastYear = `
  SELECT 
    TIMESTAMP_TRUNC(timestamp, DAY) AS x,
    COUNT(distinct(ifNull(userId, visitorId))) AS y
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE groupId = @groupId
    AND actionType = "Played_Spark"
    AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR))
  GROUP BY x
  ORDER BY x
`
