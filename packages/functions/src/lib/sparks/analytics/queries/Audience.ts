export function top10Countries(timePeriod: string) {
   return `
    WITH filtered_events AS (
      SELECT 
        ifNull(universityCountry, countryCode) as label,
        COUNT(distinct(userId)) AS counting,
      FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
      WHERE groupId = @groupId
        AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), ${timePeriod}))
        AND ifNull(universityCountry, countryCode) IS NOT NULL
        AND ifNull(universityCountry, countryCode) != "OTHER"
        AND userId IS NOT NULL
      GROUP BY label
      HAVING COUNT(distinct(userId)) != 0
    ), total AS (
      SELECT SUM(counting) AS total_count FROM (
        SELECT counting
        FROM filtered_events
      )
    )
    
    SELECT
      fe.label,
      fe.counting AS value,
      (fe.counting / total.total_count) * 100 AS percentage
    FROM filtered_events fe
    CROSS JOIN total
    ORDER BY value DESC
    LIMIT 10
  `
}

export function top10Universities(timePeriod: string) {
   return `
    WITH filtered_events AS (
      SELECT
        universityName AS label,
        COUNT(distinct(userId)) AS counting,
      FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
      WHERE groupId = @groupId
        AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
        AND universityName IS NOT NULL
      GROUP BY label
      HAVING COUNT(distinct(userId)) != 0
    ), total AS (
      SELECT SUM(counting) AS total_count
      FROM filtered_events
    )
    
    SELECT
      fe.label,
      fe.counting AS value,
      (fe.counting / total.total_count) * 100 AS percentage
    FROM filtered_events fe
    CROSS JOIN total
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
