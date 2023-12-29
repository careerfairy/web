export function top10Countries(timePeriod: string) {
   return `
    WITH total AS (
      SELECT COUNT(distinct(userId)) AS total_count
      FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
      WHERE groupId = @groupId
        AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
        AND ifNull(universityCountry, countryCode) IS NOT NULL
    )
    SELECT
      ifNull(universityCountry, countryCode) AS label,
      COUNT(distinct(userId)) AS value,
      (COUNT(distinct(userId)) / total.total_count) * 100 AS percentage
    FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
    CROSS JOIN total
    WHERE groupId = @groupId
      AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      AND ifNull(universityCountry, countryCode) IS NOT NULL
    GROUP BY label, total.total_count
    HAVING COUNT(distinct(userId)) != 0
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
        AND universityName IS NOT NULL
    )
    SELECT
      universityName AS label,
      COUNT(distinct(userId)) AS value,
      (COUNT(distinct(userId)) / total.total_count) * 100 AS percentage
    FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
    CROSS JOIN total
    WHERE groupId = @groupId
      AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      AND universityName IS NOT NULL
    GROUP BY label, total.total_count
    HAVING COUNT(distinct(userId)) != 0
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
        AND fieldOfStudy IS NOT NULL
    )
    SELECT
      fieldOfStudy AS label,
      (COUNT(distinct(userId)) / total.total_count) * 100 AS value
    FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
    CROSS JOIN total
    WHERE groupId = @groupId
      AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      AND fieldOfStudy IS NOT NULL
    GROUP BY label, total.total_count
    HAVING COUNT(distinct(userId)) != 0
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
        AND levelOfStudy IS NOT NULL
    )
    SELECT
      levelOfStudy AS label,
      (COUNT(distinct(userId)) / total.total_count) * 100 AS value
    FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
    CROSS JOIN total
    WHERE groupId = @groupId
      AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      AND levelOfStudy IS NOT NULL
    GROUP BY label, total.total_count
    HAVING COUNT(distinct(userId)) != 0
    ORDER BY value DESC
  `
}
