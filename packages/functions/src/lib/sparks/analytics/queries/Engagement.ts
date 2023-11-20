export const timeseriesLikesPastYear = `
  SELECT
    TIMESTAMP_TRUNC(timestamp, DAY) as date,
    COUNT(sparkId) AS total_liked_Sparks
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 YEAR)
    AND actionType = "Like"
  GROUP BY date
  ORDER BY date
`

export const timeseriesSharesPastYear = `
SELECT
  TIMESTAMP_TRUNC(timestamp, DAY) as date,
  COUNT(sparkId) AS total_shared_Sparks
FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 YEAR)
  AND actionType LIKE 'Share_%'
GROUP BY date
ORDER BY date
`

export const timeseriesRegistrationsPastYear = `
  SELECT
    TIMESTAMP_TRUNC(timestamp, DAY) as date,
    COUNT(sparkId) AS total_registrations
  FROM \`careerfairy-e1fd9.firestore_export.userLivestreamData_schema_userLivestreamData_latest\` 
  WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 YEAR)
    AND sparkId is not null
  GROUP BY date
  ORDER BY date
`

export const timeseriesPageClicksPastYear = `
  SELECT
    TIMESTAMP_TRUNC(timestamp, DAY) as date,
    COUNT(sparkId) AS total_click_Sparks
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 YEAR)
    AND actionType = "Click_CareerPageCTA"
  GROUP BY date
  ORDER BY date
`
