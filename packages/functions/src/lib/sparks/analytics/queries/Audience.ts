export function top10Countries(timePeriod: string) {
   return `
    WITH total AS (
      SELECT COUNT(distinct(userId)) AS total_count
      FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
      WHERE groupId = @groupId
        AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
        AND ifNull(universityCountry, countryCode) is not null
    )
    SELECT
      ifNull(universityCountry, countryCode) AS label,
      COUNT(distinct(userId)) AS value,
      (COUNT(distinct(userId)) / total.total_count) * 100 AS percentage
    FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
    CROSS JOIN total
    WHERE groupId = @groupId
      AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      AND ifNull(universityCountry, countryCode) is not null
    GROUP BY label, total.total_count
    ORDER BY value DESC
    LIMIT 10
  `
}

export function top10Universities(timePeriod: string) {
   return `
    WITH total AS (
      SELECT COUNT(distinct(userId)) AS total_count
      FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
      WHERE groupId = @groupId
        AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
        AND universityName is not null
    )
    SELECT
      universityName AS label,
      COUNT(distinct(userId)) AS value,
      (COUNT(distinct(userId)) / total.total_count) * 100 AS percentage
    FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
    CROSS JOIN total
    WHERE groupId = @groupId
      AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      AND universityName is not null
    GROUP BY label, total.total_count
    ORDER BY value DESC
    LIMIT 10
  `
}

export function top10FieldsOfStudy(timePeriod: string) {
   return `
    WITH total AS (
      SELECT COUNT(distinct(userId)) AS total_count
      FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
      WHERE groupId = @groupId
        AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
        AND fieldOfStudy is not null
    )
    SELECT
      fieldOfStudy AS label,
      (COUNT(distinct(userId)) / total.total_count) * 100 AS value
    FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
    CROSS JOIN total
    WHERE groupId = @groupId
      AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      AND fieldOfStudy is not null
    GROUP BY label, total.total_count
    ORDER BY value DESC
    LIMIT 10
  `
}

export function topLevelsOfStudy(timePeriod: string) {
   return `
    WITH total AS (
      SELECT COUNT(distinct(userId)) AS total_count
      FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
      WHERE groupId = @groupId
        AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
        AND levelOfStudy is not null
    )
    SELECT
      levelOfStudy AS label,
      (COUNT(distinct(userId)) / total.total_count) * 100 AS value
    FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
    CROSS JOIN total
    WHERE groupId = @groupId
      AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      AND levelOfStudy is not null
    GROUP BY label, total.total_count
    ORDER BY value DESC
  `
}
