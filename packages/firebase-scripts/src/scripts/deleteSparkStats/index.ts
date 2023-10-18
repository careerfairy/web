import { logAction } from "../../util/logger"
import { firestore } from "../../lib/firebase"

export async function run() {
   console.log("start deleting all the spark stats")
   const batchSize = 500

   try {
      const [sparkStatsQuery, likedSparksQuery, seenSparksQuery] =
         await logAction(
            () =>
               Promise.all([
                  firestore.collection("sparkStats").get(),
                  firestore.collectionGroup("likedSparks").get(),
                  firestore.collectionGroup("seenSparks").get(),
               ]),
            "Fetching sparkStats, likedSparks and seenSparks collections"
         )

      const totalSparkStats = sparkStatsQuery.docs.length
      const totalLikedSparks = likedSparksQuery.docs.length
      const totalSeenSparks = seenSparksQuery.docs.length

      console.log(`Start deleting ${totalSparkStats} spark Stats`)
      console.log(`Start deleting ${totalLikedSparks} liked Sparks`)
      console.log(`Start deleting ${totalSeenSparks} seen Sparks`)

      const totalDocs = [
         ...(sparkStatsQuery?.docs || []),
         ...(likedSparksQuery?.docs || []),
         ...(seenSparksQuery?.docs || []),
      ]

      for (let i = 0; i < totalDocs.length; i += batchSize) {
         const batch = firestore.batch()
         const docs = totalDocs.slice(i, i + batchSize)

         docs.forEach((doc) => batch.delete(doc.ref))
         await batch.commit()

         console.log(`Deleted ${i + docs.length} out of ${totalDocs} documents`)
      }

      console.log("Finish deleting all the spark stats")
   } catch (error) {
      console.error(error)
   }
}
