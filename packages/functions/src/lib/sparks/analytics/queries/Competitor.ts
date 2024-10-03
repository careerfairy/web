export function topCompaniesByIndustry(timePeriod: string) {
   return `
      WITH GroupByIndustry AS (
         SELECT
            groupId,
            JSON_EXTRACT_SCALAR(item, '$.id') as industry,
         FROM careerfairy-e1fd9.firestore_export.groups_schema_groups_latest,
         UNNEST(JSON_EXTRACT_ARRAY(companyIndustries)) AS item
      ),

      uniqueViewers AS (
      SELECT 
         SparkEvents.sparkId,
         COUNT(DISTINCT(ifNull(userId, visitorId))) AS value
      FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
      WHERE actionType = "Played_Spark"
         AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      GROUP BY 1
      ),

      AvgWatchedPercentage AS (
         SELECT
            sparkId,
            ROUND(AVG(videoEventPositionInSeconds) / sl.video_duration, 2) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkSecondsWatched ssw
         INNER JOIN careerfairy-e1fd9.firestore_export.sparks_schema_sparks_latest sl
            ON ssw.sparkId = sl.document_id
         WHERE ssw.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId, sl.video_duration
      ),

      AvgWatchedTime AS (
         SELECT
            sparkId,
            ROUND(AVG(videoEventPositionInSeconds), 2) as seconds
         FROM careerfairy-e1fd9.SparkAnalytics.SparkSecondsWatched
         WHERE SparkSecondsWatched.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId
         HAVING seconds IS NOT NULL
      ),

      Likes AS (
         SELECT 
            sparkId, 
            COUNT(sparkId) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
         WHERE actionType = "Like"
            AND SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId
      ),

      Shares AS (
         SELECT 
            sparkId, 
            COUNT(sparkId) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
         WHERE actionType LIKE "Share_%"
            AND SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId
      ),

      Clicks AS (
         SELECT 
            sparkId, 
            COUNT(sparkId) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
         WHERE actionType LIKE "Click_%"
            AND SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId
      ),

      Views AS (
         SELECT 
            sparkId, 
            COUNT(sparkId) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
         WHERE actionType = "Played_Spark"
            AND SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId
         HAVING value IS NOT NULL
      ),

      rankedSparks AS (
         SELECT 
            DISTINCT se.sparkId,
            rank() OVER (PARTITION BY 1 ORDER BY avgwt.seconds DESC) AS watched_rank,
            rank() OVER (PARTITION BY 1 ORDER BY avgwp.value DESC) AS percentage_rank,
            rank() OVER (PARTITION BY 1 ORDER BY Likes.value DESC) AS like_rank,
            rank() OVER (PARTITION BY 1 ORDER BY Shares.value DESC) AS share_rank,
            rank() OVER (PARTITION BY 1 ORDER BY Clicks.value DESC) AS CTR_rank,
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents se
         LEFT JOIN AvgWatchedTime avgwt ON avgwt.sparkId = se.sparkId
         LEFT JOIN AvgWatchedPercentage avgwp ON avgwp.sparkId = se.sparkId
         LEFT JOIN Likes ON se.sparkId = likes.sparkId
         LEFT JOIN Shares ON se.sparkId = shares.sparkId
         LEFT JOIN Clicks ON se.sparkId = Clicks.sparkId
         WHERE se.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      ),

      weightedRank AS (
         SELECT 
            sparkId,
            (watched_rank + 0.1) + (percentage_rank * 0.3) + (like_rank * 0.15) + (share_rank * 0.225) + (CTR_rank * 0.225) AS weighted_rank
         FROM rankedSparks
         WHERE sparkId IS NOT NULL
         ORDER BY weighted_rank ASC
      ),

      Engagement AS (
      SELECT
         sparkId,
         ROUND(SUM(
            CASE 
                  WHEN SparkEvents.actionType = "Like" THEN 0.8
                  WHEN SparkEvents.actionType LIKE "Share_%" THEN 1.2
                  WHEN SparkEvents.actionType LIKE "Click_%" THEN 1.2
                  ELSE 0.0
            END
            ), 2) AS value
      FROM SparkAnalytics.SparkEvents
      WHERE sparkId IS NOT NULL
         AND SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      GROUP BY sparkId
      HAVING value IS NOT NULL
         AND value > 0.0
      )

      SELECT 
         DISTINCT SparkEvents.sparkId,
         SparkEvents.groupId,
         GroupByIndustry.industry,
         weightedRank.weighted_rank as rank,
         uniqueViewers.value as uniqueViewers,
         Views.value as plays,
         AvgWatchedTime.seconds as avg_watched_time,
         AvgWatchedPercentage.value as avg_watched_percentage,
         Engagement.value as engagement
      FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
      INNER JOIN GroupByIndustry ON SparkEvents.groupId = GroupByIndustry.groupId
      LEFT JOIN weightedRank ON SparkEvents.sparkId = weightedRank.sparkId
      LEFT JOIN uniqueViewers ON SparkEvents.sparkId = uniqueViewers.sparkId
      LEFT JOIN AvgWatchedTime ON SparkEvents.sparkId = AvgWatchedTime.sparkId
      LEFT JOIN AvgWatchedPercentage ON SparkEvents.sparkId = AvgWatchedPercentage.sparkId
      LEFT JOIN Views ON SparkEvents.sparkId = Views.sparkId
      LEFT JOIN Engagement ON SparkEvents.sparkId = Engagement.sparkId
      WHERE SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         AND AvgWatchedTime.seconds IS NOT NULL
         AND AvgWatchedPercentage.value IS NOT NULL
         AND Engagement.value IS NOT NULL
      ORDER BY rank ASC;
   `
}

export function topSparksByIndustry(timePeriod: string) {
   return `
      WITH GroupByIndustry AS (
         SELECT
            groupId,
            JSON_EXTRACT_SCALAR(item, '$.id') as industry,
         FROM careerfairy-e1fd9.firestore_export.groups_schema_groups_latest,
         UNNEST(JSON_EXTRACT_ARRAY(companyIndustries)) AS item
      ),

      AvgWatchedPercentage AS (
         SELECT
            sparkId,
            ROUND(AVG(videoEventPositionInSeconds) / sl.video_duration, 2) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkSecondsWatched ssw
         INNER JOIN careerfairy-e1fd9.firestore_export.sparks_schema_sparks_latest sl
            ON ssw.sparkId = sl.document_id
         WHERE ssw.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId, sl.video_duration
      ),

      AvgWatchedTime AS (
         SELECT
            sparkId,
            ROUND(AVG(videoEventPositionInSeconds), 2) as seconds
         FROM careerfairy-e1fd9.SparkAnalytics.SparkSecondsWatched
         WHERE SparkSecondsWatched.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId
      ),

      Likes AS (
         SELECT 
            sparkId, 
            COUNT(sparkId) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
         WHERE actionType = "Like"
           AND SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId
      ),

      Shares AS (
         SELECT 
            sparkId, 
            COUNT(sparkId) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
         WHERE actionType LIKE "Share_%"
           AND SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId
      ),

      Clicks AS (
         SELECT 
            sparkId, 
            COUNT(sparkId) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
         WHERE actionType LIKE "Click_%"
           AND SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId
      ),

      Views AS (
         SELECT 
            sparkId, 
            COUNT(sparkId) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
         WHERE actionType = "Played_Spark"
           AND SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId
      ),

      rankedSparks AS (
         SELECT 
            DISTINCT se.sparkId,
            rank() OVER (PARTITION BY 1 ORDER BY avgwt.seconds DESC) AS watched_rank,
            rank() OVER (PARTITION BY 1 ORDER BY avgwp.value DESC) AS percentage_rank,
            rank() OVER (PARTITION BY 1 ORDER BY Likes.value DESC) AS like_rank,
            rank() OVER (PARTITION BY 1 ORDER BY Shares.value DESC) AS share_rank,
            rank() OVER (PARTITION BY 1 ORDER BY Clicks.value DESC) AS CTR_rank,
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents se
         LEFT JOIN AvgWatchedTime avgwt ON avgwt.sparkId = se.sparkId
         LEFT JOIN AvgWatchedPercentage avgwp ON avgwp.sparkId = se.sparkId
         LEFT JOIN Likes ON se.sparkId = likes.sparkId
         LEFT JOIN Shares ON se.sparkId = shares.sparkId
         LEFT JOIN Clicks ON se.sparkId = Clicks.sparkId
         WHERE se.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      ),

      weightedRank AS (
         SELECT 
            sparkId,
            (watched_rank + 0.1) + (percentage_rank * 0.3) + (like_rank * 0.15) + (share_rank * 0.225) + (CTR_rank * 0.225) AS weighted_rank
         FROM rankedSparks
         WHERE sparkId IS NOT NULL
         ORDER BY weighted_rank ASC
      )

      SELECT 
         SparkEvents.sparkId,
         GroupByIndustry.industry,
         weightedRank.weighted_rank as rank,
         Views.value as plays,
         AvgWatchedTime.seconds as avg_watched_time,
         AvgWatchedPercentage.value as avg_watched_percentage,
         ROUND(SUM(
            CASE 
               WHEN SparkEvents.actionType = "Like" THEN 0.8
               WHEN SparkEvents.actionType LIKE "Share_%" THEN 1.2
               WHEN SparkEvents.actionType LIKE "Click_%" THEN 1.2
               ELSE 0.0
            END
         ), 2) AS engagement
      FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
      INNER JOIN GroupByIndustry
         ON SparkEvents.groupId = GroupByIndustry.groupId
      LEFT JOIN weightedRank
         ON SparkEvents.sparkId = weightedRank.sparkId
      LEFT JOIN AvgWatchedTime
         ON SparkEvents.sparkId = AvgWatchedTime.sparkId
      LEFT JOIN AvgWatchedPercentage
         ON SparkEvents.sparkId = AvgWatchedPercentage.sparkId
      LEFT JOIN Views
         ON SparkEvents.sparkId = Views.sparkId
      WHERE SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      GROUP BY SparkEvents.sparkId, GroupByIndustry.industry, weightedRank.weighted_rank, Views.value, AvgWatchedTime.seconds, AvgWatchedPercentage.value
      HAVING plays IS NOT NULL
         AND avg_watched_time IS NOT NULL
         AND engagement IS NOT NULL
         AND engagement > 0.0
      ORDER BY rank DESC;  
  `
}

export function topSparksByAudience(timePeriod: string) {
   return `
      WITH AvgWatchedPercentage AS (
         SELECT
            sparkId,
            ROUND(AVG(videoEventPositionInSeconds) / sl.video_duration, 2) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkSecondsWatched ssw
         INNER JOIN careerfairy-e1fd9.firestore_export.sparks_schema_sparks_latest sl
            ON ssw.sparkId = sl.document_id
         WHERE ssw.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId, sl.video_duration
      ),
      
      AvgWatchedTime AS (
         SELECT
            sparkId,
            ROUND(AVG(videoEventPositionInSeconds), 2) as seconds
         FROM careerfairy-e1fd9.SparkAnalytics.SparkSecondsWatched
         WHERE SparkSecondsWatched.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId
      ),

      Views AS (
         SELECT 
            sparkId, 
            COUNT(sparkId) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
         WHERE actionType = "Played_Spark"
           AND SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId
      ),

      Likes AS (
         SELECT 
            sparkId, 
            COUNT(sparkId) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
         WHERE actionType = "Like"
           AND SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId
      ),

      Shares AS (
         SELECT 
            sparkId, 
            COUNT(sparkId) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
         WHERE actionType LIKE "Share_%"
           AND SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId
      ),

      Clicks AS (
         SELECT 
            sparkId, 
            COUNT(sparkId) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
         WHERE actionType LIKE "Click_%"
           AND SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY sparkId
      ),

      rankedSparks AS (
         SELECT 
            DISTINCT se.sparkId,
            rank() OVER (PARTITION BY 1 ORDER BY avgwt.seconds DESC) AS watched_rank,
            rank() OVER (PARTITION BY 1 ORDER BY avgwp.value DESC) AS percentage_rank,
            rank() OVER (PARTITION BY 1 ORDER BY Likes.value DESC) AS like_rank,
            rank() OVER (PARTITION BY 1 ORDER BY Shares.value DESC) AS share_rank,
            rank() OVER (PARTITION BY 1 ORDER BY Clicks.value DESC) AS CTR_rank,
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents se
         LEFT JOIN AvgWatchedTime avgwt ON avgwt.sparkId = se.sparkId
         LEFT JOIN AvgWatchedPercentage avgwp ON avgwp.sparkId = se.sparkId
         LEFT JOIN Likes ON se.sparkId = likes.sparkId
         LEFT JOIN Shares ON se.sparkId = shares.sparkId
         LEFT JOIN Clicks ON se.sparkId = Clicks.sparkId
         WHERE se.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      ),

      weightedRank AS (
         SELECT 
            sparkId,
            (watched_rank + 0.1) + (percentage_rank * 0.3) + (like_rank * 0.15) + (share_rank * 0.225) + (CTR_rank * 0.225) AS weighted_rank
         FROM rankedSparks
         WHERE sparkId IS NOT NULL
         ORDER BY weighted_rank ASC
      ) 

      SELECT 
         SparkEvents.sparkId,
         CASE
            WHEN userData.fieldOfStudy_id 
               IN ("business_administration_economics", "finance", "law", "luxury_fashion", "marketing", "military_sciences", "public_administration", "transportation") 
               THEN "business-plus"
            WHEN userData.fieldOfStudy_id 
               IN ("business_engineering", "chemical_engineering", "civil_engineering", "electrical_engineering", "materials_science_and_engineering", "mechanical_engineering", "space_sciences") 
               THEN "engineering"
            WHEN userData.fieldOfStudy_id 
               IN ("computer_science", "mathematics") 
               THEN "it-and-mathematics"
            WHEN userData.fieldOfStudy_id 
               IN ("astronomy", "biology", "chemistry", "earth_sciences", "environmental_studies_and_forestry", "geography", "life_sciences", "medicine", "physics", "systems_science") 
               THEN "natural-sciences"
            WHEN userData.fieldOfStudy_id 
               IN ("anthropology", "archaeology", "architecture_and_design", "divinity", "education", "history", "human_physical_performance_recreation", "journalism_media_studies_and_communication", "linguistics_and_languages", "literature_arts", "Philosophy", "political_science", "psychology", "religion", "sociology")
               THEN "social-sciences"
            ELSE "other"
         END as audience,
         weightedRank.weighted_rank as rank,
         Views.value as plays,
         AvgWatchedTime.seconds as avg_watched_time,
         AvgWatchedPercentage.value as avg_watched_percentage,
         ROUND(SUM(
            CASE 
               WHEN SparkEvents.actionType = "Like" THEN 0.8
               WHEN SparkEvents.actionType LIKE "Share_%" THEN 1.2
               WHEN SparkEvents.actionType LIKE "Click_%" THEN 1.2
               ELSE 0.0
            END
         ), 2) AS engagement
      FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents as SparkEvents
      INNER JOIN careerfairy-e1fd9.firestore_export.userData_schema_userData_latest as userData
         ON SparkEvents.userId = userData.authId
      LEFT JOIN weightedRank
         ON SparkEvents.sparkId = weightedRank.sparkId
      LEFT JOIN AvgWatchedTime
         ON SparkEvents.sparkId = AvgWatchedTime.sparkId
      LEFT JOIN AvgWatchedPercentage
         ON SparkEvents.sparkId = AvgWatchedPercentage.sparkId
      LEFT JOIN Views
         ON SparkEvents.sparkId = Views.sparkId
      WHERE SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         AND userData.fieldOfStudy_id IS NOT NULL
      GROUP BY SparkEvents.sparkId, Views.value, weightedRank.weighted_rank, AvgWatchedTime.seconds, AvgWatchedPercentage.value, audience
      HAVING engagement > 0.0
      ORDER BY rank ASC;
   `
}
