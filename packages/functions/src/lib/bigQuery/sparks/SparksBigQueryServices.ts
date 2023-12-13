import {
   SparkEvent,
   SparkSecondWatched,
} from "@careerfairy/shared-lib/sparks/analytics"
import BigQueryCreateInsertService from "../BigQueryCreateInsertService"
import bigQueryClient from "../../../api/bigQueryClient"
import sparkEvents from "./schema-views/sparkEvents.json"
import sparkSecondsWatched from "./schema-views/sparkSecondsWatched.json"

// Singleton instances of BigQueryHandler

export const sparkEventsHandler = new BigQueryCreateInsertService<SparkEvent>(
   bigQueryClient,
   "SparkAnalytics",
   "SparkEvents",
   {
      schema: sparkEvents,
      timePartitioning: { type: "DAY", field: "timestamp" },
   }
)

export const sparkSecondsWatchedHanlder =
   new BigQueryCreateInsertService<SparkSecondWatched>(
      bigQueryClient,
      "SparkAnalytics",
      "SparkSecondsWatched",
      {
         schema: sparkSecondsWatched,
         timePartitioning: { type: "DAY", field: "timestamp" },
      }
   )
