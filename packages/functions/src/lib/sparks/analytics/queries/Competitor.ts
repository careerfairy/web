export function topSparksByIndustry(timePeriod: string) {
   return `
    SELECT 
      sparkId, 
      count(sparkId) as num_views
    FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents 
    WHERE actionType = "Played_Spark"
      AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
    GROUP BY sparkId
    ORDER BY count(sparkId) DESC
    LIMIT 4
  `
}

export function topSparksByAudience(timePeriod: string) {
   return `
      SELECT
         sparkId,
         SUM(
         CASE 
            WHEN actionType = "Played" THEN 0.1
            WHEN actionType = "Like" THEN 0.4
            WHEN actionType LIKE "Share_%" THEN 0.5
            ELSE 0
         END
         ) AS engagement
      FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
      WHERE timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      GROUP BY sparkId
      ORDER BY engagement DESC
      LIMIT 4
  `
}
