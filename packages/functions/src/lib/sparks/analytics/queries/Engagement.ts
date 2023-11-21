export const timeseriesLikesPastYear = `
  SELECT
    TIMESTAMP_TRUNC(timestamp, DAY) AS x,
    COUNT(sparkId) AS y
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE groupId = @groupId
    AND actionType = "Like"
    AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR))
  GROUP BY x
  ORDER BY x
`

export const timeseriesSharesPastYear = `
  SELECT
    TIMESTAMP_TRUNC(timestamp, DAY) AS x,
    COUNT(sparkId) AS y
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE groupId = @groupId
    AND actionType LIKE 'Share_%'
    AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR))
  GROUP BY x
  ORDER BY x
`

export const timeseriesRegistrationsPastYear = `
  SELECT
    TIMESTAMP_TRUNC(timestamp, DAY) AS x,
    COUNT(sparkId) AS y
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE groupId = @groupId
    AND actionType = "Register_Event"
    AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR))
  GROUP BY x
  ORDER BY x
;
`

export const timeseriesPageClicksPastYear = `
  SELECT
    TIMESTAMP_TRUNC(timestamp, DAY) AS x,
    COUNT(sparkId) AS y
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE groupId = @groupId
    AND actionType = "Click_CareerPageCTA"
    AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR))
  GROUP BY x
  ORDER BY x
`
