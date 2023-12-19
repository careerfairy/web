export function top10Countries(timePeriod: string) {
   return `
    SELECT
      ifNull(universityCountry, countryCode) AS label,
      COUNT(distinct(userId)) AS value
    FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
    WHERE groupId = @groupId
      AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      AND ifNull(universityCountry, countryCode) is not null
    GROUP BY Country
    ORDER BY total_talent DESC
    LIMIT 10
  `
}

export function top10Universities(timePeriod: string) {
   return `
    SELECT
      universityName AS lable,
      COUNT(distinct(userId)) AS value
    FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
    WHERE groupId = @groupId
      AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      AND universityName is not null
    GROUP BY universityName
    ORDER BY total_talent DESC
    LIMIT 10
  `
}

export function top10FieldsOfStudy(timePeriod: string) {
   return `
    SELECT
      fieldOfStudy AS label,
      COUNT(distinct(userId)) AS value
    FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
    WHERE groupId = @groupId
      AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      AND fieldOfStudy is not null
    GROUP BY field_of_study
    ORDER BY total_talent DESC
    LIMIT 10
  `
}
export function topLevelsOfStudy(timePeriod: string) {
   return `
    SELECT
      levelOfStudy AS label,
      COUNT(distinct(userId)) AS value
    FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
    WHERE groupId = @groupId
      AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      AND levelOfStudy is not null
    GROUP BY level_of_study
    ORDER BY total_talent
  `
}
