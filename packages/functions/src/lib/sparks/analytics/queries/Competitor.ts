export function topCompaniesByIndustry(timePeriod: string) {
   return `
      WITH GroupByIndustry AS (
         SELECT
            DISTINCT g.groupId,
            SparkEvents.sparkId,
            JSON_EXTRACT_SCALAR(item, '$.id') as industry,
         FROM careerfairy-e1fd9.firestore_export.groups_schema_groups_latest g,
         UNNEST(JSON_EXTRACT_ARRAY(companyIndustries)) AS item
         INNER JOIN careerfairy-e1fd9.SparkAnalytics.SparkEvents as SparkEvents 
            ON SparkEvents.groupId = g.groupid
         WHERE SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
            AND (
                  SparkEvents.actionType = "Played_Spark"
               OR SparkEvents.actionType = "Like"
               OR SparkEvents.actionType LIKE "Share_%"
               OR SparkEvents.actionType LIKE "Click_%"
            )
      ),

      CompanySparksActions AS (
         SELECT 
            SparkEvents.groupId,
            GBI.industry,
            COUNT(CASE WHEN SparkEvents.actionType = "Played_Spark" THEN 1 END) as num_views,
            COUNT(CASE WHEN SparkEvents.actionType = "Like" THEN 1 END) as num_likes,
            COUNT(CASE WHEN SparkEvents.actionType LIKE "Share_%" THEN 1 END) as num_shares,
            COUNT(CASE WHEN SparkEvents.actionType LIKE "Click_%" THEN 1 END) as num_clicks,
            COUNT(DISTINCT CASE WHEN SparkEvents.actionType = "Played_Spark" THEN IFNULL(userId, visitorId) END) AS unique_viewers,
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents as SparkEvents 
         INNER JOIN GroupByIndustry GBI ON SparkEvents.groupId = GBI.groupId AND SparkEvents.sparkId = GBI.sparkId
         WHERE timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
            AND (
               SparkEvents.actionType = "Played_Spark"
            OR SparkEvents.actionType = "Like"
            OR SparkEvents.actionType LIKE "Share_%"
            OR SparkEvents.actionType LIKE "Click_%"
         )
            AND SparkEvents.groupId IS NOT NULL
         GROUP BY 1,2

         UNION ALL

         SELECT 
            SparkEvents.groupId,
            "all" as industry,
            COUNT(CASE WHEN SparkEvents.actionType = "Played_Spark" THEN 1 END) as num_views,
            COUNT(CASE WHEN SparkEvents.actionType = "Like" THEN 1 END) as num_likes,
            COUNT(CASE WHEN SparkEvents.actionType LIKE "Share_%" THEN 1 END) as num_shares,
            COUNT(CASE WHEN SparkEvents.actionType LIKE "Click_%" THEN 1 END) as num_clicks,
            COUNT(DISTINCT CASE WHEN SparkEvents.actionType = "Played_Spark" THEN IFNULL(userId, visitorId) END) AS unique_viewers,
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents as SparkEvents 
         WHERE timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
            AND (
               SparkEvents.actionType = "Played_Spark"
            OR SparkEvents.actionType = "Like"
            OR SparkEvents.actionType LIKE "Share_%"
            OR SparkEvents.actionType LIKE "Click_%"
         )
            AND SparkEvents.groupId IS NOT NULL
         GROUP BY 1,2
      ),

      AverageMetrics AS (
         SELECT DISTINCT
            sl.group_id as groupId,
            GBI.industry,
            ROUND(AVG(ssw.videoEventPositionInSeconds) OVER (PARTITION BY sl.group_id), 2) as avg_watched_time,
            ROUND(AVG(ssw.videoEventPositionInSeconds / sl.video_duration) OVER (PARTITION BY sl.group_id), 2) as avg_watched_percentage
         FROM careerfairy-e1fd9.SparkAnalytics.SparkSecondsWatched ssw
         INNER JOIN careerfairy-e1fd9.firestore_export.sparks_schema_sparks_latest sl ON ssw.sparkId = sl.document_id
         INNER JOIN GroupByIndustry GBI ON sl.group_id = GBI.groupId AND ssw.sparkId = sl.document_id
         WHERE ssw.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))

         UNION ALL

         SELECT DISTINCT
            sl.group_id as groupId,
            "all" as industry,
            ROUND(AVG(ssw.videoEventPositionInSeconds) OVER (PARTITION BY sl.group_id), 2) as avg_watched_time,
            ROUND(AVG(ssw.videoEventPositionInSeconds / sl.video_duration) OVER (PARTITION BY sl.group_id), 2) as avg_watched_percentage
         FROM careerfairy-e1fd9.SparkAnalytics.SparkSecondsWatched ssw
         INNER JOIN careerfairy-e1fd9.firestore_export.sparks_schema_sparks_latest sl ON ssw.sparkId = sl.document_id
         WHERE ssw.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      ),

      AllMetrics AS (
         SELECT 
            CSA.*,
            AM.avg_watched_time,
            AM.avg_watched_percentage
         FROM CompanySparksActions CSA
         INNER JOIN AverageMetrics AM ON CSA.groupId = AM.groupId and CSA.industry = AM.industry
      ),

      CompaniesBaseRanking AS (
         SELECT 
            groupId,
            industry,
            rank() OVER (PARTITION BY industry ORDER BY num_views DESC) AS views_rank,
            rank() OVER (PARTITION BY industry ORDER BY num_likes DESC) AS likes_rank,
            rank() OVER (PARTITION BY industry ORDER BY num_shares DESC) AS shares_rank,
            rank() OVER (PARTITION BY industry ORDER BY num_clicks DESC) AS clicks_rank,
            rank() OVER (PARTITION BY industry ORDER BY avg_watched_time DESC) AS avg_watched_time_rank,
            rank() OVER (PARTITION BY industry ORDER BY avg_watched_percentage DESC) AS avg_watched_percentage_rank,
         FROM AllMetrics
      ),

      CompaniesWeightedRank AS (
         SELECT 
            groupId,
            industry,
            + (avg_watched_time_rank * 0.125)
            + (avg_watched_percentage_rank * 0.3)
            + (views_rank * 0.175)
            + (likes_rank * 0.10)
            + (shares_rank * 0.15)
            + (clicks_rank * 0.15)
            AS weighted_rank
         FROM CompaniesBaseRanking
      ),

      CompaniesRank AS (
         SELECT 
            groupId, 
            industry,
            rank() OVER (PARTITION BY industry ORDER BY weighted_rank ASC) as rank
         FROM CompaniesWeightedRank
      )

      SELECT 
         r.groupId,
         r.industry,
         r.rank, 
         a.num_views, 
         a.unique_viewers, 
         a.avg_watched_time, 
         a.avg_watched_percentage,
         + (a.num_views * 0.39375)
         + (a.num_likes * 0.225)
         + (a.num_shares * 0.33)
         + (a.num_clicks * 0.33) as engagement
      FROM CompaniesRank r
      INNER JOIN AllMetrics a ON a.groupId = r.groupId AND a.industry = r.industry
      ORDER BY r.rank ASC
   `
}

export function topSparksByIndustry(timePeriod: string) {
   return `
      WITH SparksActions AS (
         SELECT 
            SparkEvents.sparkId,
            COUNT(CASE WHEN SparkEvents.actionType = "Played_Spark" THEN 1 END) as num_views,
            COUNT(CASE WHEN SparkEvents.actionType = "Like" THEN 1 END) as num_likes,
            COUNT(CASE WHEN SparkEvents.actionType LIKE "Share_%" THEN 1 END) as num_shares,
            COUNT(CASE WHEN SparkEvents.actionType LIKE "Click_%" THEN 1 END) as num_clicks
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents as SparkEvents 
         WHERE SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
            AND (
               SparkEvents.actionType = "Played_Spark"
            OR SparkEvents.actionType = "Like"
            OR SparkEvents.actionType LIKE "Share_%"
            OR SparkEvents.actionType LIKE "Click_%"
         )
         GROUP BY 1
      ),

      AverageMetrics AS (
         SELECT 
            ssw.sparkId,
            ROUND(AVG(videoEventPositionInSeconds), 2) as avg_watched_time,
            ROUND(AVG(ssw.videoEventPositionInSeconds) / sl.video_duration, 2) as avg_watched_percentage
         FROM careerfairy-e1fd9.SparkAnalytics.SparkSecondsWatched ssw
         INNER JOIN careerfairy-e1fd9.firestore_export.sparks_schema_sparks_latest sl ON ssw.sparkId = sl.document_id
         WHERE ssw.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY 1, sl.video_duration
      ),

      AllMetrics AS (
         SELECT 
            SABA.*,
            AM.avg_watched_time,
            AM.avg_watched_percentage
         FROM SparksActions SABA
         INNER JOIN AverageMetrics AM ON SABA.sparkId = AM.sparkId
      ),

      SparksBaseRanking AS (
         SELECT 
            sparkId,
            rank() OVER (PARTITION BY 1 ORDER BY num_views DESC) AS views_rank,
            rank() OVER (PARTITION BY 1 ORDER BY num_likes DESC) AS likes_rank,
            rank() OVER (PARTITION BY 1 ORDER BY num_shares DESC) AS shares_rank,
            rank() OVER (PARTITION BY 1 ORDER BY num_clicks DESC) AS clicks_rank,
            rank() OVER (PARTITION BY 1 ORDER BY avg_watched_time DESC) AS avg_watched_time_rank,
            rank() OVER (PARTITION BY 1 ORDER BY avg_watched_percentage DESC) AS avg_watched_percentage_rank,
         FROM AllMetrics
      ),

      SparksWeightedRank AS (
         SELECT 
            sparkId,
            + (avg_watched_time_rank * 0.125)
            + (avg_watched_percentage_rank * 0.3)
            + (views_rank * 0.175)
            + (likes_rank * 0.10)
            + (shares_rank * 0.15)
            + (clicks_rank * 0.15)
            AS weighted_rank
         FROM SparksBaseRanking
      ),

      SparksRank AS (
         SELECT 
            sparkId, 
            rank() OVER (PARTITION BY 1 ORDER BY weighted_rank ASC) as rank
         FROM SparksWeightedRank
      ),

      GroupByIndustry AS (
        SELECT
          DISTINCT g.groupId,
          SparkEvents.sparkId,
          JSON_EXTRACT_SCALAR(item, '$.id') as industry,
        FROM careerfairy-e1fd9.firestore_export.groups_schema_groups_latest g,
        UNNEST(JSON_EXTRACT_ARRAY(companyIndustries)) AS item
        INNER JOIN careerfairy-e1fd9.SparkAnalytics.SparkEvents as SparkEvents 
          ON SparkEvents.groupId = g.groupid
        WHERE SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      )

      (
         SELECT 
            r.sparkId,
            "all" as industry,
            r.rank, 
            a.num_views, 
            a.avg_watched_time, 
            a.avg_watched_percentage,
            + (a.num_views * 0.39375)
            + (a.num_likes * 0.225)
            + (a.num_shares * 0.33)
            + (a.num_clicks * 0.33) as engagement
         FROM SparksRank r
         INNER JOIN AllMetrics a ON a.sparkId = r.sparkId
      )
      UNION ALL
      (
         SELECT 
            r.sparkId,
            gi.industry,
            r.rank, 
            a.num_views, 
            a.avg_watched_time, 
            a.avg_watched_percentage,
            + (a.num_views * 0.39375)
            + (a.num_likes * 0.225)
            + (a.num_shares * 0.33)
            + (a.num_clicks * 0.33) as engagement
         FROM SparksRank r
         INNER JOIN AllMetrics a ON a.sparkId = r.sparkId
         INNER JOIN GroupByIndustry gi ON gi.sparkId = r.sparkId
      ) ORDER BY rank ASC
  `
}

export function topSparksByAudience(timePeriod: string) {
   return `
     WITH SparkActionsByAudience AS (
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
            COUNT(CASE WHEN SparkEvents.actionType = "Played_Spark" THEN 1 END) as num_views,
            COUNT(CASE WHEN SparkEvents.actionType = "Like" THEN 1 END) as num_likes,
            COUNT(CASE WHEN SparkEvents.actionType LIKE "Share_%" THEN 1 END) as num_shares,
            COUNT(CASE WHEN SparkEvents.actionType LIKE "Click_%" THEN 1 END) as num_clicks,
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents as SparkEvents
         INNER JOIN careerfairy-e1fd9.firestore_export.userData_schema_userData_latest as userData
            ON SparkEvents.userId = userData.authId
         WHERE userData.fieldOfStudy_id IS NOT NULL
            AND (
                  SparkEvents.actionType = "Played_Spark"
               OR SparkEvents.actionType = "Like"
               OR SparkEvents.actionType LIKE "Share_%"
               OR SparkEvents.actionType LIKE "Click_%"
            )
            AND SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY 1, 2
         
         UNION ALL 
         
         SELECT 
            SparkEvents.sparkId,
            "all" as audience,
            COUNT(CASE WHEN SparkEvents.actionType = "Played_Spark" THEN 1 END) as num_views,
            COUNT(CASE WHEN SparkEvents.actionType = "Like" THEN 1 END) as num_likes,
            COUNT(CASE WHEN SparkEvents.actionType LIKE "Share_%" THEN 1 END) as num_shares,
            COUNT(CASE WHEN SparkEvents.actionType LIKE "Click_%" THEN 1 END) as num_clicks,
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents as SparkEvents
         INNER JOIN careerfairy-e1fd9.firestore_export.userData_schema_userData_latest as userData
            ON SparkEvents.userId = userData.authId
         WHERE userData.fieldOfStudy_id IS NOT NULL
            AND (
                  SparkEvents.actionType = "Played_Spark"
               OR SparkEvents.actionType = "Like"
               OR SparkEvents.actionType LIKE "Share_%"
               OR SparkEvents.actionType LIKE "Click_%"
            )
            AND SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         GROUP BY 1, 2
      ),

      AverageMetrics AS (
         SELECT 
            ssw.sparkId,
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
            ROUND(AVG(videoEventPositionInSeconds), 2) as avg_watched_time,
            ROUND(AVG(ssw.videoEventPositionInSeconds) / sl.video_duration, 2) as avg_watched_percentage
         FROM careerfairy-e1fd9.SparkAnalytics.SparkSecondsWatched ssw
         INNER JOIN careerfairy-e1fd9.firestore_export.userData_schema_userData_latest as userData ON ssw.userId = userData.authId
         INNER JOIN careerfairy-e1fd9.firestore_export.sparks_schema_sparks_latest sl ON ssw.sparkId = sl.document_id
         WHERE ssw.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         AND userData.fieldOfStudy_id IS NOT NULL
         GROUP BY 1, 2, sl.video_duration
         
         UNION ALL
         
         SELECT 
            ssw.sparkId,
            "all" as audience,
            ROUND(AVG(videoEventPositionInSeconds), 2) as avg_watched_time,
            ROUND(AVG(ssw.videoEventPositionInSeconds) / sl.video_duration, 2) as avg_watched_percentage
         FROM careerfairy-e1fd9.SparkAnalytics.SparkSecondsWatched ssw
         INNER JOIN careerfairy-e1fd9.firestore_export.userData_schema_userData_latest as userData ON ssw.userId = userData.authId
         INNER JOIN careerfairy-e1fd9.firestore_export.sparks_schema_sparks_latest sl ON ssw.sparkId = sl.document_id
         WHERE ssw.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         AND userData.fieldOfStudy_id IS NOT NULL
         GROUP BY 1, 2, sl.video_duration
      ),

      AllMetrics AS (
         SELECT 
            SABA.*,
            AM.avg_watched_time,
            AM.avg_watched_percentage
         FROM SparkActionsByAudience SABA
         INNER JOIN AverageMetrics AM 
            ON SABA.sparkId = AM.sparkId AND SABA.audience = AM.audience
      ),

      SparksBaseRankingByAudience AS (
         SELECT 
            sparkId,
            audience,
            rank() OVER (PARTITION BY audience ORDER BY num_views DESC) AS views_rank,
            rank() OVER (PARTITION BY audience ORDER BY num_likes DESC) AS likes_rank,
            rank() OVER (PARTITION BY audience ORDER BY num_shares DESC) AS shares_rank,
            rank() OVER (PARTITION BY audience ORDER BY num_clicks DESC) AS clicks_rank,
            rank() OVER (PARTITION BY audience ORDER BY avg_watched_time DESC) AS avg_watched_time_rank,
            rank() OVER (PARTITION BY audience ORDER BY avg_watched_percentage DESC) AS avg_watched_percentage_rank,
         FROM AllMetrics
      ),

      SparksWeightedRank AS (
         SELECT 
            sparkId,
            audience,
            + (avg_watched_time_rank * 0.125)
            + (avg_watched_percentage_rank * 0.3)
            + (views_rank * 0.175)
            + (likes_rank * 0.10)
            + (shares_rank * 0.15)
            + (clicks_rank * 0.15)
            AS weighted_rank
         FROM SparksBaseRankingByAudience
      ),

      SparksRankByAudience AS (
         SELECT 
            sparkId, 
            audience, 
            rank() OVER (PARTITION BY audience ORDER BY weighted_rank ASC) as rank
         FROM SparksWeightedRank
      )

      SELECT 
        r.sparkId,
        r.audience,
        r.rank, 
        a.num_views, 
        a.avg_watched_time, 
        a.avg_watched_percentage,
        + (a.num_views * 0.39375)
        + (a.num_likes * 0.225)
        + (a.num_shares * 0.33)
        + (a.num_clicks * 0.33) as engagement
      FROM SparksRankByAudience r
      INNER JOIN AllMetrics a 
      ON a.sparkId = r.sparkId AND a.audience = r.audience
      ORDER BY r.rank ASC
   `
}
