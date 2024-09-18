import { MostSomethingStatsKeys } from "@careerfairy/shared-lib/sparks/analytics"

function mostSomething(timePeriod: string, indexer: MostSomethingStatsKeys) {
   return `
      SELECT
      SparkEvents.sparkId,
      COUNT(CASE
         WHEN SparkEvents.actionType = 'Played_Spark' THEN 1
         ELSE CAST(NULL as INT64)
      END) AS num_views,
      COUNT(CASE
         WHEN SparkEvents.actionType = 'Like' THEN 1
         ELSE CAST(NULL as INT64)
      END) AS num_likes,
      COUNT(CASE
         WHEN SparkEvents.actionType LIKE 'Share_%' THEN 1
         ELSE CAST(NULL as INT64)
      END) AS num_shares,
      COUNT(CASE
         WHEN SparkEvents.actionType LIKE 'Click_%' THEN 1
         ELSE CAST(NULL as INT64)
      END) AS num_clicks
      FROM
      careerfairy-e1fd9.SparkAnalytics.SparkEvents AS SparkEvents
      WHERE SparkEvents.groupId = @groupId
      AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      GROUP BY 1
      ORDER BY ${indexer} DESC
      LIMIT 3;
   `
}

export function mostWatched(timePeriod: string) {
   return mostSomething(timePeriod, "num_views")
}

export function mostLiked(timePeriod: string) {
   return mostSomething(timePeriod, "num_likes")
}

export function mostShared(timePeriod: string) {
   return mostSomething(timePeriod, "num_shares")
}

export function mostRecent(timePeriod: string) {
   return `
      WITH most_recent AS (
         SELECT 
            spark_id AS sparkId,
            spark_createdAt AS createdAt
         FROM careerfairy-e1fd9.firestore_export.sparkStats_schema_sparkStats_latest
         WHERE spark_group_id = @groupId
         AND deleted = FALSE
         ORDER BY spark_createdAt DESC
         LIMIT 3
      )

      SELECT
         SparkEvents.sparkId,
         most_recent.createdAt,
         COUNT(CASE
            WHEN SparkEvents.actionType = 'Played_Spark' THEN 1
            ELSE CAST(NULL as INT64)
         END) AS num_views,
         COUNT(CASE
            WHEN SparkEvents.actionType = 'Like' THEN 1
            ELSE CAST(NULL as INT64)
         END) AS num_likes,
         COUNT(CASE
            WHEN SparkEvents.actionType LIKE 'Share_%' THEN 1
            ELSE CAST(NULL as INT64)
         END) AS num_shares,
         COUNT(CASE
            WHEN SparkEvents.actionType LIKE 'Click_%' THEN 1
            ELSE CAST(NULL as INT64)
         END) AS num_clicks
      FROM
      careerfairy-e1fd9.SparkAnalytics.SparkEvents AS SparkEvents
      INNER JOIN most_recent
      ON SparkEvents.sparkId = most_recent.sparkId
      WHERE SparkEvents.groupId = @groupId
      AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      GROUP BY 1, 2
      ORDER BY most_recent.createdAt DESC
   `
}
