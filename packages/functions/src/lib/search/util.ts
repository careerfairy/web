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

   const prefix = process.env.DEV_NAME || "unknown"

   return `${prefix}`
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

   const replicaIndex = algoliaClient.initIndex(replicaEntry)

   await replicaIndex.setSettings({
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
   })

   return prependEnvPrefix(replicaEntry)
}

export const configureSettings = async (
   settings: IndexSettings,
   index: SearchIndex
) => {
   const configuredReplicas = await Promise.all(
      settings.replicas?.map(
         async (entry) => await configureReplica(entry, settings)
      ) || []
   )

   await index.setSettings(
      {
         ...settings,
         replicas: configuredReplicas,
      },
      {
         forwardToReplicas: true,
      }
   )
}
