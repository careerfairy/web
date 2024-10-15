export const sparkStats = `
   SELECT 
      COUNT(CASE WHEN actionType = "Played_Spark" THEN 1 END) as num_views,
      COUNT(CASE WHEN actionType = "Like" THEN 1 END) as num_likes,
      COUNT(CASE WHEN actionType LIKE "Share_%" THEN 1 END) as num_shares,
      COUNT(CASE WHEN actionType LIKE "Click_%" THEN 1 END) as num_clicks
   FROM careerfairy-e1fd9.SparkAnalytics.SparkEvents
   WHERE sparkId = @sparkId
`
