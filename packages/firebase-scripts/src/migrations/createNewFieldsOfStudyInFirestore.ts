import * as currentFieldOfStudiesMapping from "@careerfairy/firebase-scripts/data/currentFieldOfStudiesMapping.json"
import { firestore } from "../lib/firebase"

export default async function createNewFieldsOfStudyInFirestore() {
   const newFieldsOfStudy = Object.keys(currentFieldOfStudiesMapping).map(
      (mappingId) => ({
         mappingId,
         label: currentFieldOfStudiesMapping[mappingId],
      })
   )
   // write new fields of study to db
   const fieldOfStudyRef = firestore.collection("fieldOfStudy")

   for (const fieldOfStudy of newFieldsOfStudy) {
      await fieldOfStudyRef
         .doc(fieldOfStudy.mappingId)
         .set({ label: fieldOfStudy.label })
   }
}
