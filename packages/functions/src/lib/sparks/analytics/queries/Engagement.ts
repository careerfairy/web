export const timeseriesLikesPastYear = `
  SELECT
    TIMESTAMP_TRUNC(timestamp, DAY) AS x,
    COUNT(sparkId) AS y
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR))
    AND actionType = "Like"
  GROUP BY x
  ORDER BY x
`

export const timeseriesSharesPastYear = `
  SELECT
    TIMESTAMP_TRUNC(timestamp, DAY) AS x,
    COUNT(sparkId) AS y
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR))
    AND actionType LIKE 'Share_%'
  GROUP BY x
  ORDER BY x
`

export const timeseriesRegistrationsPastYear = `
  SELECT
    TIMESTAMP_TRUNC(timestamp, DAY) AS x,
    COUNT(sparkId) AS y
  FROM \`careerfairy-e1fd9.firestore_export.userLivestreamData_schema_userLivestreamData_latest\` 
  WHERE timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR))
    AND sparkId is not null
  GROUP BY x
  ORDER BY x
`

export const timeseriesPageClicksPastYear = `
  SELECT
    TIMESTAMP_TRUNC(timestamp, DAY) AS x,
    COUNT(sparkId) AS y
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR))
    AND actionType = "Click_CareerPageCTA"
  GROUP BY x
  ORDER BY x
`
