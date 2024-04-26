import { logger } from "firebase-functions"
import { algoliaClient } from "../../api/algolia"
import { SearchIndex } from "algoliasearch"
import { IndexSettings } from "./searchIndexGenerator"
import { isProductionEnvironment, isTestEnvironment } from "../../util"

export const logCreateIndex = (id: string, data: object) => {
   logger.info(`Creating new Algolia index for document ${id}`, data)
}

export const logUpdateIndex = (id: string, data: object) => {
   logger.info(`Updating existing Algolia index for document ${id}`, data)
}

export const logDeleteIndex = (id: string) => {
   logger.info(`Deleting existing Algolia index for document ${id}`)
}

export const getAlgoliaIndexPrefix = () => {
   if (isProductionEnvironment()) {
      return "prod"
   }

   if (isTestEnvironment()) {
      return "test"
   }

   return process.env.DEV_NAME || "unknown"
}

// Helper function to append the environment prefix to the index name so Type
export const prependEnvPrefix = <T extends string>(value: T) => {
   return `${getAlgoliaIndexPrefix()}_${value}` as const
}

export const initAlgoliaIndex = (indexName: string) => {
   return algoliaClient.initIndex(prependEnvPrefix(indexName))
}

type ReplicaEntry = `${string}_${string}_${"asc" | "desc"}`

async function configureReplica(
   replicaEntry: ReplicaEntry,
   indexSettings: IndexSettings
) {
   const [, attribute, order] = replicaEntry.split("_") as [
      string, // index name
      string, // attribute
      "asc" | "desc" // order
   ]

   const replicaIndex = algoliaClient.initIndex(prependEnvPrefix(replicaEntry))

   const replicaSettings = {
      ...indexSettings,
      ranking: [
         `${order}(${attribute})`,
         "typo",
         "geo",
         "words",
         "filters",
         "proximity",
         "attribute",
         "exact",
         "custom",
      ],
      replicas: [],
   }

   return replicaIndex.setSettings(replicaSettings)
}

export const configureSettings = async (
   settings: IndexSettings,
   index: SearchIndex
) => {
   const newSettings: IndexSettings = {
      ...settings,
      ...(isTestEnvironment() && {
         attributesForFaceting: [
            ...(settings.attributesForFaceting || []),
            // add the workflowId attribute to the faceting attributes so e2e tests can filter by workflowId
            "workflowId",
         ],
      }),
   }

   if (newSettings.replicas) {
      for (const entry of newSettings.replicas) {
         await configureReplica(entry, newSettings)
      }
   }

   await index.setSettings(
      {
         ...newSettings,
         replicas: newSettings.replicas.map(prependEnvPrefix),
      },
      {
         forwardToReplicas: true,
      }
   )
}
