// Singleton instances of BigQueryHandler

import {
   SparkEvent,
   SparkSecondWatched,
} from "@careerfairy/shared-lib/sparks/analytics"
import BigQueryCRUDService from "../BigQueryCRUDService"
import bigQueryClient from "src/api/bigQueryClient"
import sparkEvents from "./schema-views/sparkEvents.json"
import sparkSecondsWatched from "./schema-views/sparkSecondsWatched.json"

export const sparkEventsHandler = new BigQueryCRUDService<SparkEvent>(
   bigQueryClient,
   "SparkAnalytics",
   "SparkEvents",
   {
      schema: sparkEvents,
      timePartitioning: { type: "DAY", field: "timestamp" },
   }
)

export const sparkSecondsWatchedHanlder =
   new BigQueryCRUDService<SparkSecondWatched>(
      bigQueryClient,
      "SparkAnalytics",
      "SparkSecondsWatched",
      {
         schema: sparkSecondsWatched,
         timePartitioning: { type: "DAY", field: "timestamp" },
      }
   )
