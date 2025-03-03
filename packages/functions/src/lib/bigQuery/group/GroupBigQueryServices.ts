import { GroupEventServer } from "@careerfairy/shared-lib/groups/telemetry"
import bigQueryClient from "../../../api/bigQueryClient"
import BigQueryCreateInsertService from "../BigQueryCreateInsertService"
import groupEvents from "./schema-views/groupEvents.json"

// Singleton instances of BigQueryHandler

export const groupEventsHandler =
   new BigQueryCreateInsertService<GroupEventServer>(
      bigQueryClient,
      "GroupAnalytics",
      "GroupEvents",
      {
         schema: groupEvents,
         timePartitioning: { type: "DAY", field: "timestamp" },
      }
   )
