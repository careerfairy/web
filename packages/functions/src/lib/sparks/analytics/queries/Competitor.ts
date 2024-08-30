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
      WHERE SparkEvents.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${timePeriod}))
         AND userData.fieldOfStudy_id IS NOT NULL
      GROUP BY SparkEvents.sparkId, audience
      HAVING engagement > 0.0
      ORDER BY engagement DESC
   `
}
