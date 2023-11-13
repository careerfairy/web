import { logAction } from "../../util/logger"
import { firestore } from "../../lib/firebase"

export async function run() {
   console.log(
      "adding the new normalizedUniversityName field on all CareerCenterData's documents"
   )
   const batchSize = 500

   try {
      const allCareerCenterData = await logAction(
         () => firestore.collection("careerCenterData").get(),
         "Fetching all the CareerCenterData"
      )

      console.log(`Start adding new field`)

      const totalDocs = allCareerCenterData?.docs

      for (let i = 0; i < totalDocs.length; i += batchSize) {
         const batch = firestore.batch()
         const docs = totalDocs.slice(i, i + batchSize)

         docs.forEach((doc) => {
            const universityName = doc.data().universityName
            const normalizedUniversityName = universityName.toLowerCase()

            batch.update(doc.ref, { normalizedUniversityName })
         })
         await batch.commit()

         console.log(
            `Added the new field on ${i + docs.length} out of ${
               totalDocs.length
            } documents`
         )
      }

      console.log(
         "Finish adding the new normalizedUniversityName field to all the CareerCenterData's documents"
      )
   } catch (error) {
      console.error(error)
   }
}
