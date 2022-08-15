import * as mappings from "@careerfairy/firebase-scripts/data/fieldAndLevelOfStudyMapping.json"
import { firestore } from "../../../lib/firebase"
import { WriteBatch } from "firebase-admin/firestore"
import config from "../../../config"
//
export async function run() {
   const batch = firestore.batch()
   const newFieldsOfStudyMapping = mappings.fieldOfStudyMapping.current
   const newLevelsOfStudyMapping = mappings.levelOfStudyMapping.current

   if (
      Object.keys(newFieldsOfStudyMapping).length < 0 ||
      Object.keys(newLevelsOfStudyMapping).length < 0
   ) {
      throw new Error(
         `Unable to find: ${config.fieldAndLevelOfStudyMappingJsonPath}`
      )
   }
   // Delete existing fieldsOfStudy and levelsOfStudy collections
   await deleteCollection("fieldsOfStudy", batch)
   await deleteCollection("levelsOfStudy", batch)

   // write new fields of study to db
   const newFieldsOfStudy = createCollection(
      "fieldsOfStudy",
      newFieldsOfStudyMapping,
      batch
   )
   // write new levels of study to db
   const newLevelsOfStudy = createCollection(
      "levelsOfStudy",
      newLevelsOfStudyMapping,
      batch
   )

   await batch.commit()

   console.log("New fields and levels of study created:")
   console.table(newFieldsOfStudy)
   console.table(newLevelsOfStudy)
}
type Mapping = {
   [id: string]: string
}
const createCollection = (
   collectionName: "fieldsOfStudy" | "levelsOfStudy",
   mappings: Mapping,
   batch: WriteBatch
) => {
   const mappingArray = Object.keys(mappings).map((mappingId) => ({
      mappingId,
      name: mappings[mappingId],
   }))

   mappingArray.forEach((mapping) => {
      const mappingRef = firestore
         .collection(collectionName)
         .doc(mapping.mappingId)
      batch.set(mappingRef, { name: mapping.name })
   })
   return mappingArray
}

const deleteCollection = async (
   collectionName: "fieldsOfStudy" | "levelsOfStudy",
   batch: WriteBatch
) => {
   const snaps = await firestore.collection(collectionName).get()
   snaps.forEach((snap) => {
      batch.delete(snap.ref)
   })
   return
}
