import * as mappings from "@careerfairy/firebase-scripts/data/fieldAndLevelOfStudyMapping.json"
import { firestore } from "../lib/firebase"
import { WriteBatch } from "firebase-admin/firestore"
import config from "../config"

export default async function createNewFieldsAndLevelOfStudyInFirestore() {
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
      label: mappings[mappingId],
   }))

   mappingArray.forEach((mapping) => {
      const mappingRef = firestore
         .collection(collectionName)
         .doc(mapping.mappingId)
      batch.set(mappingRef, { label: mapping.label })
   })
   return mappingArray
}
