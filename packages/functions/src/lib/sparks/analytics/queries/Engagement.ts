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
DECLARE start_date TIMESTAMP DEFAULT TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR));

SELECT 
  TIMESTAMP_TRUNC(uld.timestamp, DAY) AS x,
  COUNT(uld.registered_sparkId) AS y
FROM \`careerfairy-e1fd9.firestore_export.userLivestreamData_schema_userLivestreamData_latest\` uld
INNER JOIN \`careerfairy-e1fd9.firestore_export.livestreams_schema_livestreams_latest\` l
  ON uld.livestreamId = l.document_id
WHERE l.author_groupId = @groupId
  AND uld.timestamp >= start_date
  AND uld.registered_sparkId is not null
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
