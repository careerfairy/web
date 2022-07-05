import * as fieldOfStudyMapping from "@careerfairy/firebase-scripts/data/fieldOfStudyMapping.json"
import { firestore } from "../lib/firebase"

export default async function createNewFieldsOfStudyInFirestore() {
   const batch = firestore.batch()
   const newMappings = fieldOfStudyMapping.newFieldOfStudies
   const newFieldsOfStudy = Object.keys(newMappings).map((mappingId) => ({
      mappingId,
      label: newMappings[mappingId],
   }))
   // write new fields of study to db

   newFieldsOfStudy.forEach((fieldOfStudy) => {
      const fieldOfStudyRef = firestore
         .collection("fieldOfStudy")
         .doc(fieldOfStudy.mappingId)

      batch.set(fieldOfStudyRef, { label: fieldOfStudy.label })
   })
   await batch.commit()

   console.log("New fields of study created:")
   console.table(newFieldsOfStudy)
}
