import * as functions from "firebase-functions"
import algoliasearch, { SearchIndex } from "algoliasearch"
import { DocumentSnapshot, QuerySnapshot } from "firebase-admin/firestore"
import { Identifiable } from "@careerfairy/shared-lib/commonTypes"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { ChangeType, getChangeTypeEnum, getEnvPrefix } from "./util"
import { defaultTriggerRunTimeConfig } from "./lib/triggers/util"
import config from "./config"
import * as logs from "./util/search"
import * as yup from "yup"
import { firestore } from "./api/firestoreAdmin"

const DOCS_PER_INDEXING = 250

interface IndexFields {
   [indexName: string]: {
      collectionPath: string
      fields: string[]
   }
}

const getIndexData = <T extends Identifiable, TField extends keyof T = keyof T>(
   collectionPath: string,
   fields: TField[]
) => {
   return {
      collectionPath,
      fields,
   }
}

const knownIndexes = {
   livestreams: getIndexData<LivestreamEvent>("livestreams", [
      "id",
      "summary",
      "reasonsToJoinLivestream",
      "backgroundImageUrl",
      "company",
      "companyId",
      "maxRegistrants",
      "companyLogoUrl",
      "created",
      "withResume",
      "duration",
      "groupIds",
      "interestsIds",
      "levelOfStudyIds",
      "fieldOfStudyIds",
      "isRecording",
      "language",
      "hidden",
      "hasNoTalentPool",
      "test",
      "title",
      "type",
      "start",
      "status",
      "hasStarted",
      "hasEnded",
      "targetCategories",
      "mode",
      "maxHandRaisers",
      "hasNoRatings",
      "recommendedEventIds",
      "activeCallToActionIds",
      "openStream",
      "impressions",
      "recommendedImpressions",
      "speakerSwitchMode",
      "targetFieldsOfStudy",
      "targetLevelsOfStudy",
      "lastUpdated",
      "universities",
      "questionsDisabled",
      "denyRecordingAccess",
      "jobs",
      "hasJobs",
      "isHybrid",
      "address",
      "externalEventLink",
      "timezone",
      "isFaceToFace",
      "popularity",
      "companySizes",
      "companyIndustries",
      "companyCountries",
      "isDraft",
      "speakers",
   ]),
} satisfies IndexFields

type IndexName = keyof typeof knownIndexes

const client = algoliasearch("WBAREE5TWQ", "993b607c53d0965f6d93f10daea25a68")

const getIdexNameWithPrefix = (indexName: string) =>
   `${indexName}${getEnvPrefix()}`

function buildIndexFunction<T extends Identifiable>(
   indexName: string,
   fields: (keyof T & string)[]
) {
   const index = client.initIndex(getIdexNameWithPrefix(indexName))
   const documentPath = knownIndexes[indexName].collectionPath + "/{docId}"

   return functions
      .runWith(defaultTriggerRunTimeConfig)
      .region(config.region)
      .firestore.document(documentPath)
      .onWrite(async (change) => {
         const changeType = getChangeTypeEnum(change)

         switch (changeType) {
            case ChangeType.CREATE:
               await handleCreateDocument(change.after, fields, index)
               break
            case ChangeType.UPDATE:
               await handleUpdateDocument(
                  change.before,
                  change.after,
                  fields,
                  index
               )
               break
            case ChangeType.DELETE:
               await handleDeleteDocument(change.before, index)
               break
            default:
               throw new Error(`Unknown change type ${changeType}`)
         }
      })
}

const getData = (snapshot: DocumentSnapshot, fields: string[]) => {
   const payload: {
      [key: string]: boolean | string | number
   } = {
      objectID: snapshot.id,
   }

   const data = snapshot.data()

   return fields.reduce((acc, field) => {
      if (field in data && data[field] !== undefined && data[field] !== null) {
         acc[field] = data[field] as any
      }
      return acc
   }, payload)
}

const handleCreateDocument = async (
   snapshot: DocumentSnapshot,
   fields: string[],
   index: SearchIndex
) => {
   try {
      const data = getData(snapshot, fields)

      functions.logger.debug({
         ...data,
      })

      logs.createIndex(snapshot.id, data)
      await index.partialUpdateObject(data, { createIfNotExists: true })
   } catch (e) {
      functions.logger.error(e)
   }
}

const handleUpdateDocument = async (
   before: DocumentSnapshot,
   after: DocumentSnapshot,
   fields: string[],
   index: SearchIndex
) => {
   try {
      functions.logger.debug("Detected a change, execute indexing")

      const beforeData = before.data()
      // loop through the after data snapshot to see if any properties were removed
      const undefinedAttrs = Object.keys(beforeData).filter(
         (key) => after.get(key) === undefined || after.get(key) === null
      )
      functions.logger.debug("undefinedAttrs", undefinedAttrs)

      const data = getData(after, fields)
      // if no attributes were removed, then use partial update of the record.
      if (undefinedAttrs.length === 0) {
         logs.updateIndex(after.id, data)
         functions.logger.debug("execute partialUpdateObject")

         await index.partialUpdateObject(data, {
            createIfNotExists: true,
         })
      } else {
         // if an attribute was removed, then use save object of the record.

         // delete null value attributes before saving.
         undefinedAttrs.forEach((attr) => delete data[attr])

         logs.updateIndex(after.id, data)
         functions.logger.debug("execute saveObject")
         await index.saveObject(data)
      }
   } catch (e) {
      functions.logger.error(e)
   }
}

const handleDeleteDocument = async (
   deleted: DocumentSnapshot,
   index: SearchIndex
) => {
   try {
      logs.deleteIndex(deleted.id)
      await index.deleteObject(deleted.id)
   } catch (e) {
      functions.logger.error(e)
   }
}

export const fullIndexSync = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .https.onRequest(async (req, res) => {
      if (req.method !== "GET") {
         res.status(405).send("Method Not Allowed")
         return
      }

      const schema = yup.object().shape({
         indexName: yup
            .mixed()
            .oneOf<IndexName>(
               Object.keys(knownIndexes) as IndexName[],
               `Index name must be one of ${Object.keys(knownIndexes).join(
                  ", "
               )}`
            ),
      })

      const { indexName } = await schema.validate(req.query)

      const index = client.initIndex(getIdexNameWithPrefix(indexName))

      const fields = knownIndexes[indexName].fields

      const collectionRef = firestore.collection(
         knownIndexes[indexName].collectionPath
      )

      const snap = await collectionRef.count().get()

      const totalDocuments = snap.data().count

      let syncedDocuments = 0

      let documentSnapshots: QuerySnapshot
      let startAfter: DocumentSnapshot | undefined

      do {
         const query = startAfter
            ? collectionRef.startAfter(startAfter).limit(DOCS_PER_INDEXING)
            : collectionRef.limit(DOCS_PER_INDEXING)

         documentSnapshots = await query.get()

         const batch = index.saveObjects(
            documentSnapshots.docs.map((doc) => getData(doc, fields))
         )

         await batch.wait()

         syncedDocuments += documentSnapshots.size
         functions.logger.info(
            `Synced ${syncedDocuments} of ${totalDocuments} documents`
         )

         startAfter = documentSnapshots.docs[documentSnapshots.docs.length - 1]
      } while (documentSnapshots.size === DOCS_PER_INDEXING)

      res.status(200).send("Index sync completed")
   })

export const indexCollectionLivestreams = buildIndexFunction<LivestreamEvent>(
   Object.keys(knownIndexes.livestreams)[0],
   knownIndexes.livestreams.fields
)

// Add more collections as needed
