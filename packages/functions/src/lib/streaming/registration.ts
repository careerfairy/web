import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { RegisteredLivestreams, UserData } from "@careerfairy/shared-lib/users"
import { firestore } from "firebase-admin"
import { logger } from "firebase-functions"
import { onDocumentWritten } from "firebase-functions/v2/firestore"

export const onUserRegistration = onDocumentWritten(
   {
      document: "livestreams/{livestreamId}/userLivestreamData/{userEmail}",
   },
   async (event) => {
      const { params } = event
      const { livestreamId, userEmail } = params

      logger.info(
         `Processing registration for live stream ${livestreamId} and user ${userEmail}`
      )

      const newUserLivestreamData =
         event.data.after.data() as UserLivestreamData

      /* commented out for backfill */
      // const oldUserLivestreamData =
      //    event.data.before.data() as UserLivestreamData

      // const registrationChanged = hasRegistrationChanged(
      //    oldUserLivestreamData,
      //    newUserLivestreamData
      // )

      // if (!registrationChanged) {
      //    logger.info(
      //       `No registration change detected for live stream ${livestreamId} and user ${userEmail}`
      //    )
      //    return
      // }

      logger.info(
         `Registration change detected for live stream ${livestreamId} and user ${userEmail}`
      )

      const registeredLivestreamsRef = firestore()
         .collection("registeredLivestreams")
         .doc(newUserLivestreamData.userId)

      const userDataRef = firestore().collection("userData").doc(userEmail)

      try {
         await firestore().runTransaction(async (transaction) => {
            const [registeredLivestreamsDoc, userDataDoc] = await Promise.all([
               transaction.get(registeredLivestreamsRef),
               transaction.get(userDataRef),
            ])

            const userData = userDataDoc.data() as UserData | undefined
            const registeredLivestreams = getOrCreateRegisteredLivestreams(
               registeredLivestreamsDoc,
               userData
            )

            if (!registeredLivestreams) {
               logger.warn(
                  `Unable to process registration for user ${userEmail}: missing data`
               )
               return
            }

            updateRegisteredLivestreams(
               registeredLivestreams,
               livestreamId,
               newUserLivestreamData
            )

            transaction.set(registeredLivestreamsRef, registeredLivestreams, {
               merge: true,
            })

            logger.info(
               `Successfully updated registered live streams for user ${userEmail}`
            )
         })
      } catch (error) {
         logger.error(
            `Error updating registered live streams for user ${userEmail}:`,
            error
         )
         throw error
      }
   }
)

// function hasRegistrationChanged(
//    oldData: UserLivestreamData,
//    newData: UserLivestreamData
// ): boolean {
//    return (
//       Boolean(oldData?.registered?.date) !== Boolean(newData?.registered?.date)
//    )
// }

function getOrCreateRegisteredLivestreams(
   doc: FirebaseFirestore.DocumentSnapshot,
   userData: UserData | undefined
): RegisteredLivestreams | null {
   const existingData = doc.data() as RegisteredLivestreams | undefined

   if (existingData) {
      return existingData
   }

   if (!userData?.authId) {
      logger.warn(
         "Unable to create RegisteredLivestreams: missing userData or authId"
      )
      return null
   }

   logger.info(
      `Creating new RegisteredLivestreams document for user ${userData.authId}`
   )

   return {
      id: userData.authId,
      user: userData,
      registeredLivestreams: {},
      size: 0,
   }
}

function updateRegisteredLivestreams(
   registeredLivestreams: RegisteredLivestreams,
   livestreamId: string,
   newUserLivestreamData: UserLivestreamData
): void {
   if (newUserLivestreamData.registered?.date) {
      registeredLivestreams.registeredLivestreams[livestreamId] =
         newUserLivestreamData.registered.date
      logger.info(
         `User ${registeredLivestreams.id} registered for live stream ${livestreamId}`
      )
   } else {
      delete registeredLivestreams.registeredLivestreams[livestreamId]
      logger.info(
         `User ${registeredLivestreams.id} unregistered from live stream ${livestreamId}`
      )
   }

   registeredLivestreams.size = Object.keys(
      registeredLivestreams.registeredLivestreams
   ).length
   registeredLivestreams.user = newUserLivestreamData.user

   logger.info(
      `Updated RegisteredLivestreams for user ${registeredLivestreams.id}. New size: ${registeredLivestreams.size}`
   )
}
