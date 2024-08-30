export function topSparksByIndustry(timePeriod: string) {
   return `
      WITH GroupByIndustry AS (
         SELECT
            groupId,
            JSON_EXTRACT_SCALAR(item, '$.id') as industry,
         FROM careerfairy-e1fd9.firestore_export.groups_schema_groups_latest,
         UNNEST(JSON_EXTRACT_ARRAY(companyIndustries)) AS item
      ),

      AvgWatchedTime AS (
         SELECT
            sparkId,
            ROUND(AVG(videoEventPositionInSeconds), 2) as seconds
         FROM careerfairy-e1fd9.SparkAnalytics.SparkSecondsWatched
         GROUP BY sparkId
      ),

      Views AS (
         SELECT 
            sparkId, 
            COUNT(sparkId) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
         WHERE actionType = "Played_Spark"
         GROUP BY sparkId
      )

      SELECT 
         SparkEvents.sparkId,
         GroupByIndustry.industry,
         Views.value as plays,
         AvgWatchedTime.seconds as avg_watched_time,
         ROUND(SUM(
         CASE 
            WHEN SparkEvents.actionType = "Played_Spark" THEN 0.02
            WHEN SparkEvents.actionType = "Watched_CompleteSpark" THEN 0.05
            WHEN SparkEvents.actionType = "Like" THEN 0.4
            WHEN SparkEvents.actionType LIKE "Share_%" THEN 0.5
            WHEN SparkEvents.actionType LIKE "Click_%" THEN 0.5
            ELSE 0.0
         END
         ), 2) AS engagement
      FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
      INNER JOIN GroupByIndustry
         ON SparkEvents.groupId = GroupByIndustry.groupId
      LEFT JOIN AvgWatchedTime
         ON SparkEvents.sparkId = AvgWatchedTime.sparkId
      LEFT JOIN Views
         ON SparkEvents.sparkId = Views.sparkId
      WHERE SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
      GROUP BY SparkEvents.sparkId, GroupByIndustry.industry, Views.value, AvgWatchedTime.seconds
      ORDER BY count(sparkId) DESC;
  `
}

export function topSparksByAudience(timePeriod: string) {
   return `
      WITH AvgWatchedTime AS (
         SELECT
            sparkId,
            ROUND(AVG(videoEventPositionInSeconds), 2) as seconds
         FROM careerfairy-e1fd9.SparkAnalytics.SparkSecondsWatched
         GROUP BY sparkId
      ),

      Views AS (
         SELECT 
            sparkId, 
            COUNT(sparkId) as value
         FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
         WHERE actionType = "Played_Spark"
         GROUP BY sparkId
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
         Views.value as plays,
         AvgWatchedTime.seconds as avg_watched_time,
         ROUND(SUM(
            CASE 
               WHEN SparkEvents.actionType = "Played_Spark" THEN 0.02
               WHEN SparkEvents.actionType = "Watched_CompleteSpark" THEN 0.05
               WHEN SparkEvents.actionType = "Like" THEN 0.4
               WHEN SparkEvents.actionType LIKE "Share_%" THEN 0.5
               WHEN SparkEvents.actionType LIKE "Click_%" THEN 0.5
               ELSE 0.0
            END
         ), 2) AS engagement
      FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents as SparkEvents
      INNER JOIN careerfairy-e1fd9.firestore_export.userData_schema_userData_latest as userData
         ON SparkEvents.userId = userData.authId
      LEFT JOIN AvgWatchedTime
         ON SparkEvents.sparkId = AvgWatchedTime.sparkId
      LEFT JOIN Views
         ON SparkEvents.sparkId = Views.sparkId
      WHERE SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         AND userData.fieldOfStudy_id IS NOT NULL
      GROUP BY SparkEvents.sparkId, Views.value, AvgWatchedTime.seconds, audience
      HAVING engagement > 0.0
      ORDER BY engagement DESC;
   `
}
