export const top10Countries = `
  SELECT
    ifNull(universityCountry, countryCode) as Country,
    COUNT(distinct(userId)) AS total_talent
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @timePeriod)
    and ifNull(universityCountry, countryCode) is not null
  GROUP BY Country
  ORDER BY total_talent DESC
  LIMIT 10
`

export const top10Universities = `
  SELECT
    universityName as university,
    COUNT(distinct(userId)) AS total_talent
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @timePeriod)
    and universityName is not null
  GROUP BY universityName
  ORDER BY total_talent DESC
  LIMIT 10
`

export const top10FieldsOfStudy = `
  SELECT
    fieldOfStudy as field_of_study,
    COUNT(distinct(userId)) AS total_talent
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @timePeriod)
    and fieldOfStudy is not null
  GROUP BY field_of_study
  ORDER BY total_talent DESC
  LIMIT 10
`
export const topLevelsOfStudy = `
  SELECT
    levelOfStudy as level_of_study,
    COUNT(distinct(userId)) AS total_talent
  FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
  WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @timePeriod)
    and levelOfStudy is not null
  GROUP BY level_of_study
  ORDER BY total_talent
`
