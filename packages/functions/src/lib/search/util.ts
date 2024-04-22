import { logger } from "firebase-functions"
import { algoliaClient } from "../../api/algolia"
import { getEnvPrefix } from "../../util"
import { SearchIndex } from "algoliasearch"
import { IndexSettings } from "./searchIndexGenerator"

export const logCreateIndex = (id: string, data: object) => {
   logger.info(`Creating new Algolia index for document ${id}`, data)
}

export const logUpdateIndex = (id: string, data: object) => {
   logger.info(`Updating existing Algolia index for document ${id}`, data)
}

export const logDeleteIndex = (id: string) => {
   logger.info(`Deleting existing Algolia index for document ${id}`)
}

// Helper function to append the environment prefix to the index name so Type
export const appendEnvPrefix = <T extends string>(value: T) => {
   return `${value}${getEnvPrefix()}`
}

export const initAlgoliaIndex = (indexName: string) => {
   return algoliaClient.initIndex(appendEnvPrefix(indexName))
}

type ReplicaEntry = `${string}_${string}_${"asc" | "desc"}`

async function configureReplica(
   replicaEntry: ReplicaEntry,
   rootIndexSettings: IndexSettings
) {
   const [, attribute, order] = replicaEntry.split("_") as [
      string, // index name
      string, // attribute
      "asc" | "desc" // order
   ]

   const replicaIndex = algoliaClient.initIndex(replicaEntry)

   delete rootIndexSettings.replicas

   return replicaIndex.setSettings({
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
      ...rootIndexSettings,
   })
}

export const configureSettings = async (
   settings: IndexSettings,
   index: SearchIndex
) => {
   settings.replicas =
      (settings.replicas?.map(appendEnvPrefix) as ReplicaEntry[]) || []

   await index.setSettings(settings)

   for (const entry of settings.replicas) {
      await configureReplica(entry, settings)
   }
}
